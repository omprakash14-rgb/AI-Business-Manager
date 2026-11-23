import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  PaginationQuerySchema,
  CreateProjectInputSchema,
  UpdateProjectInputSchema,
  AddProjectMemberInputSchema,
  CreateMilestoneInputSchema,
  UpdateMilestoneInputSchema,
  CreateTaskInputSchema,
  UpdateTaskInputSchema,
  UpdateTaskStatusInputSchema,
  CreateCommentInputSchema,
  ProjectStatusSchema,
  ProjectPrioritySchema,
  TaskStatusSchema,
  TaskPrioritySchema,
  ProjectStatus,
  ProjectPriority,
  TaskStatus,
  TaskPriority
} from '@ai-business-manager/shared';
import { repository } from '../db/index.js';
import { requireOrganization } from '../plugins/auth.js';

export async function projectRoutes(app: FastifyInstance): Promise<void> {
  // All Project Management routes require authenticated user and active organization context
  app.addHook('preHandler', requireOrganization);

  // ==========================================
  // 1. Summary & Overview Metrics
  // ==========================================

  // GET /api/projects/summary — High-level project KPIs
  app.get('/summary', async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.organization!.id;
    const summary = await repository.getProjectSummary(orgId);
    return reply.send(summary);
  });

  // ==========================================
  // 2. Projects Endpoints
  // ==========================================

  // GET /api/projects — Paginated projects listing with filters
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const queryResult = PaginationQuerySchema.safeParse(request.query);
    if (!queryResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid pagination query parameters',
          details: queryResult.error.format()
        }
      });
    }

    const { status, priority, ownerId, accountId, opportunityId } = request.query as Record<
      string,
      string | undefined
    >;
    const orgId = request.organization!.id;

    let parsedStatus: ProjectStatus | undefined = undefined;
    if (status) {
      const sp = ProjectStatusSchema.safeParse(status);
      if (sp.success) parsedStatus = sp.data;
    }

    let parsedPriority: ProjectPriority | undefined = undefined;
    if (priority) {
      const pp = ProjectPrioritySchema.safeParse(priority);
      if (pp.success) parsedPriority = pp.data;
    }

    const projects = await repository.listProjects(orgId, {
      ...queryResult.data,
      status: parsedStatus,
      priority: parsedPriority,
      ownerId,
      accountId,
      opportunityId
    });

    return reply.send(projects);
  });

  // POST /api/projects — Create a new project
  app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = CreateProjectInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid project payload',
          details: parseResult.error.format()
        }
      });
    }

    const orgId = request.organization!.id;
    const userId = request.user!.id;

    try {
      const project = await repository.createProject(orgId, userId, parseResult.data);

      await repository.createAuditLog({
        organizationId: orgId,
        userId,
        action: 'project.created',
        metadata: JSON.stringify({ projectId: project.id, name: project.name }),
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      });

      return reply.status(201).send(project);
    } catch (err: any) {
      return reply.status(500).send({
        success: false,
        error: {
          code: 'PROJECT_CREATION_FAILED',
          message: err.message || 'Failed to create project'
        }
      });
    }
  });

  // GET /api/projects/:id — Retrieve project details
  app.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const orgId = request.organization!.id;

    const project = await repository.getProjectById(orgId, id);
    if (!project) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found'
        }
      });
    }

    return reply.send(project);
  });

  // PATCH /api/projects/:id — Update project
  app.patch('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const orgId = request.organization!.id;
    const userId = request.user!.id;

    const parseResult = UpdateProjectInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid update payload',
          details: parseResult.error.format()
        }
      });
    }

    try {
      const updated = await repository.updateProject(orgId, id, parseResult.data);

      await repository.createAuditLog({
        organizationId: orgId,
        userId,
        action: 'project.updated',
        metadata: JSON.stringify({ projectId: id, updates: Object.keys(parseResult.data) }),
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      });

      return reply.send(updated);
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: err.message || 'Failed to update project'
        }
      });
    }
  });

  // DELETE /api/projects/:id — Soft-delete project
  app.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const orgId = request.organization!.id;
    const userId = request.user!.id;

    const success = await repository.softDeleteProject(orgId, id);
    if (!success) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found or already deleted'
        }
      });
    }

    await repository.createAuditLog({
      organizationId: orgId,
      userId,
      action: 'project.deleted',
      metadata: JSON.stringify({ projectId: id }),
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    });

    return reply.send({ success: true });
  });

  // ==========================================
  // 3. Project Members Endpoints
  // ==========================================

  // GET /api/projects/:id/members — List members
  app.get('/:id/members', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const orgId = request.organization!.id;

    const members = await repository.listProjectMembers(orgId, id);
    return reply.send(members);
  });

  // POST /api/projects/:id/members — Add or update project member
  app.post('/:id/members', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const orgId = request.organization!.id;

    const parseResult = AddProjectMemberInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid member payload',
          details: parseResult.error.format()
        }
      });
    }

    try {
      const member = await repository.addProjectMember(orgId, id, parseResult.data);
      return reply.status(201).send(member);
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'ADD_MEMBER_FAILED',
          message: err.message || 'Failed to add project member'
        }
      });
    }
  });

  // DELETE /api/projects/:id/members/:userId — Remove project member
  app.delete('/:id/members/:userId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id, userId: targetUserId } = request.params as { id: string; userId: string };
    const orgId = request.organization!.id;

    try {
      const removed = await repository.removeProjectMember(orgId, id, targetUserId);
      if (!removed) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Project member not found'
          }
        });
      }
      return reply.send({ success: true });
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'REMOVE_MEMBER_FAILED',
          message: err.message || 'Failed to remove member'
        }
      });
    }
  });

  // ==========================================
  // 4. Milestones Endpoints
  // ==========================================

  // GET /api/projects/:id/milestones — List milestones for project
  app.get('/:id/milestones', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const orgId = request.organization!.id;

    const milestones = await repository.listMilestones(orgId, id);
    return reply.send(milestones);
  });

  // POST /api/projects/:id/milestones — Create milestone
  app.post('/:id/milestones', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const orgId = request.organization!.id;

    const parseResult = CreateMilestoneInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid milestone payload',
          details: parseResult.error.format()
        }
      });
    }

    try {
      const milestone = await repository.createMilestone(orgId, id, parseResult.data);
      return reply.status(201).send(milestone);
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'MILESTONE_CREATION_FAILED',
          message: err.message || 'Failed to create milestone'
        }
      });
    }
  });

  // PATCH /api/projects/milestones/:id — Update milestone
  app.patch('/milestones/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const orgId = request.organization!.id;

    const parseResult = UpdateMilestoneInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid update payload',
          details: parseResult.error.format()
        }
      });
    }

    try {
      const updated = await repository.updateMilestone(orgId, id, parseResult.data);
      return reply.send(updated);
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: err.message || 'Failed to update milestone'
        }
      });
    }
  });

  // DELETE /api/projects/milestones/:id — Soft-delete milestone
  app.delete('/milestones/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const orgId = request.organization!.id;

    const success = await repository.softDeleteMilestone(orgId, id);
    if (!success) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Milestone not found or already deleted'
        }
      });
    }

    return reply.send({ success: true });
  });

  // ==========================================
  // 5. Tasks & Subtasks Endpoints
  // ==========================================

  // GET /api/projects/tasks — Paginated tasks listing with filters
  app.get('/tasks', async (request: FastifyRequest, reply: FastifyReply) => {
    const queryResult = PaginationQuerySchema.safeParse(request.query);
    if (!queryResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid pagination query parameters',
          details: queryResult.error.format()
        }
      });
    }

    const {
      projectId,
      milestoneId,
      parentTaskId,
      status,
      priority,
      assigneeId,
      isOverdue,
      sortBy,
      sortOrder
    } = request.query as Record<string, string | undefined>;
    const orgId = request.organization!.id;

    let parsedStatus: TaskStatus | undefined = undefined;
    if (status) {
      const sp = TaskStatusSchema.safeParse(status);
      if (sp.success) parsedStatus = sp.data;
    }

    let parsedPriority: TaskPriority | undefined = undefined;
    if (priority) {
      const pp = TaskPrioritySchema.safeParse(priority);
      if (pp.success) parsedPriority = pp.data;
    }

    const tasks = await repository.listTasks(orgId, {
      ...queryResult.data,
      projectId,
      milestoneId,
      parentTaskId: parentTaskId === 'null' ? null : parentTaskId,
      status: parsedStatus,
      priority: parsedPriority,
      assigneeId,
      isOverdue: isOverdue === 'true',
      sortBy,
      sortOrder: sortOrder === 'desc' ? 'desc' : 'asc'
    });

    return reply.send(tasks);
  });

  // POST /api/projects/tasks — Create a task or subtask
  app.post('/tasks', async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = CreateTaskInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid task payload',
          details: parseResult.error.format()
        }
      });
    }

    const orgId = request.organization!.id;
    const userId = request.user!.id;

    try {
      const task = await repository.createTask(orgId, userId, parseResult.data);

      await repository.createAuditLog({
        organizationId: orgId,
        userId,
        action: 'task.created',
        metadata: JSON.stringify({ taskId: task.id, title: task.title, projectId: task.projectId }),
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      });

      return reply.status(201).send(task);
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'TASK_CREATION_FAILED',
          message: err.message || 'Failed to create task'
        }
      });
    }
  });

  // GET /api/projects/tasks/:id — Get task details
  app.get('/tasks/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const orgId = request.organization!.id;

    const task = await repository.getTaskById(orgId, id);
    if (!task) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Task not found'
        }
      });
    }

    return reply.send(task);
  });

  // PATCH /api/projects/tasks/:id — Update task details
  app.patch('/tasks/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const orgId = request.organization!.id;
    const userId = request.user!.id;

    const parseResult = UpdateTaskInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid update payload',
          details: parseResult.error.format()
        }
      });
    }

    try {
      const updated = await repository.updateTask(orgId, id, parseResult.data);

      await repository.createAuditLog({
        organizationId: orgId,
        userId,
        action: 'task.updated',
        metadata: JSON.stringify({ taskId: id, updates: Object.keys(parseResult.data) }),
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      });

      return reply.send(updated);
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: err.message || 'Failed to update task'
        }
      });
    }
  });

  // PATCH /api/projects/tasks/:id/status — Fast status update (for Kanban and quick toggles)
  app.patch('/tasks/:id/status', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const orgId = request.organization!.id;
    const userId = request.user!.id;

    const parseResult = UpdateTaskStatusInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid status payload',
          details: parseResult.error.format()
        }
      });
    }

    try {
      const updated = await repository.updateTaskStatus(orgId, id, parseResult.data.status);

      await repository.createAuditLog({
        organizationId: orgId,
        userId,
        action: 'task.status_changed',
        metadata: JSON.stringify({ taskId: id, newStatus: parseResult.data.status }),
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      });

      return reply.send(updated);
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'STATUS_UPDATE_FAILED',
          message: err.message || 'Failed to update task status'
        }
      });
    }
  });

  // DELETE /api/projects/tasks/:id — Soft-delete task
  app.delete('/tasks/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const orgId = request.organization!.id;
    const userId = request.user!.id;

    const success = await repository.softDeleteTask(orgId, id);
    if (!success) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Task not found or already deleted'
        }
      });
    }

    await repository.createAuditLog({
      organizationId: orgId,
      userId,
      action: 'task.deleted',
      metadata: JSON.stringify({ taskId: id }),
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    });

    return reply.send({ success: true });
  });

  // ==========================================
  // 6. Comments & Collaboration Endpoints
  // ==========================================

  // GET /api/projects/:id/comments — List comments for project (or task)
  app.get('/:id/comments', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: projectId } = request.params as { id: string };
    const { taskId } = request.query as { taskId?: string };
    const orgId = request.organization!.id;

    const comments = await repository.listComments(orgId, {
      projectId,
      taskId: taskId || undefined
    });

    return reply.send(comments);
  });

  // POST /api/projects/:id/comments — Post a comment on project or task
  app.post('/:id/comments', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: projectId } = request.params as { id: string };
    const orgId = request.organization!.id;
    const authorId = request.user!.id;

    const parseResult = CreateCommentInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid comment payload',
          details: parseResult.error.format()
        }
      });
    }

    try {
      const comment = await repository.createComment(orgId, projectId, authorId, parseResult.data);
      return reply.status(201).send(comment);
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'COMMENT_CREATION_FAILED',
          message: err.message || 'Failed to post comment'
        }
      });
    }
  });

  // DELETE /api/projects/comments/:id — Delete comment
  app.delete('/comments/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const orgId = request.organization!.id;
    const userId = request.user!.id;
    const userRole = request.membership?.role;
    const isAdmin = userRole === 'owner' || userRole === 'admin';

    try {
      const success = await repository.deleteComment(orgId, id, userId, isAdmin);
      if (!success) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Comment not found or already deleted'
          }
        });
      }
      return reply.send({ success: true });
    } catch (err: any) {
      return reply.status(403).send({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: err.message || 'Not authorized to delete this comment'
        }
      });
    }
  });
}
