import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  PaginationQuerySchema,
  CreateDepartmentInputSchema,
  UpdateDepartmentInputSchema,
  CreateDesignationInputSchema,
  UpdateDesignationInputSchema,
  CreateEmployeeInputSchema,
  UpdateEmployeeInputSchema,
  RecordAttendanceInputSchema,
  UpdateAttendanceInputSchema,
  CreateLeaveRequestInputSchema,
  UpdateLeaveStatusInputSchema
} from '@ai-business-manager/shared';
import { repository } from '../db/index.js';
import { requireOrganization, requireRole, requireWriteAccess } from '../plugins/auth.js';

export async function hrRoutes(app: FastifyInstance): Promise<void> {
  // All HR routes require an authenticated session and active organization context
  app.addHook('preHandler', requireOrganization);

  // ==========================================
  // 1. HR Overview & Summary
  // ==========================================

  // GET /api/hr/summary — Organization-wide HR operational metrics
  app.get('/summary', async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.organization!.id;
    const summary = await repository.getHrSummary(orgId);
    return reply.send(summary);
  });

  // ==========================================
  // 2. Departments Endpoints
  // ==========================================

  // GET /api/hr/departments — List all organization departments
  app.get('/departments', async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.organization!.id;
    const depts = await repository.listDepartments(orgId);
    return reply.send(depts);
  });

  // POST /api/hr/departments — Create a new department (Admin / Owner only)
  app.post(
    '/departments',
    { preHandler: requireRole(['owner', 'admin']) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parseResult = CreateDepartmentInputSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid department data',
            details: parseResult.error.format()
          }
        });
      }

      const orgId = request.organization!.id;
      const userId = request.user!.id;

      try {
        const dept = await repository.createDepartment(orgId, parseResult.data);

        await repository.createAuditLog({
          organizationId: orgId,
          userId,
          action: 'hr.department_created',
          metadata: JSON.stringify({ departmentId: dept.id, name: dept.name }),
          ipAddress: request.ip,
          userAgent: request.headers['user-agent']
        });

        return reply.status(201).send(dept);
      } catch (err: any) {
        return reply.status(400).send({
          success: false,
          error: { code: 'DEPARTMENT_CREATE_FAILED', message: err.message || 'Failed to create department' }
        });
      }
    }
  );

  // GET /api/hr/departments/:id — Get department details
  app.get('/departments/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const orgId = request.organization!.id;

    const dept = await repository.getDepartmentById(orgId, id);
    if (!dept) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Department not found' }
      });
    }

    return reply.send(dept);
  });

  // PATCH /api/hr/departments/:id — Update department (Admin / Owner only)
  app.patch(
    '/departments/:id',
    { preHandler: requireRole(['owner', 'admin']) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const parseResult = UpdateDepartmentInputSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid department update data',
            details: parseResult.error.format()
          }
        });
      }

      const orgId = request.organization!.id;
      const userId = request.user!.id;

      try {
        const updated = await repository.updateDepartment(orgId, id, parseResult.data);

        await repository.createAuditLog({
          organizationId: orgId,
          userId,
          action: 'hr.department_updated',
          metadata: JSON.stringify({ departmentId: id }),
          ipAddress: request.ip,
          userAgent: request.headers['user-agent']
        });

        return reply.send(updated);
      } catch (err: any) {
        return reply.status(400).send({
          success: false,
          error: { code: 'DEPARTMENT_UPDATE_FAILED', message: err.message || 'Failed to update department' }
        });
      }
    }
  );

  // DELETE /api/hr/departments/:id — Soft-delete department (Admin / Owner only)
  app.delete(
    '/departments/:id',
    { preHandler: requireRole(['owner', 'admin']) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const orgId = request.organization!.id;
      const userId = request.user!.id;

      try {
        await repository.deleteDepartment(orgId, id);

        await repository.createAuditLog({
          organizationId: orgId,
          userId,
          action: 'hr.department_deleted',
          metadata: JSON.stringify({ departmentId: id }),
          ipAddress: request.ip,
          userAgent: request.headers['user-agent']
        });

        return reply.send({ success: true });
      } catch (err: any) {
        return reply.status(400).send({
          success: false,
          error: { code: 'DEPARTMENT_DELETE_FAILED', message: err.message || 'Failed to delete department' }
        });
      }
    }
  );

  // ==========================================
  // 3. Designations Endpoints
  // ==========================================

  // GET /api/hr/designations — List designations (optionally filtered by department)
  app.get('/designations', async (request: FastifyRequest, reply: FastifyReply) => {
    const { departmentId } = request.query as { departmentId?: string };
    const orgId = request.organization!.id;
    const des = await repository.listDesignations(orgId, departmentId);
    return reply.send(des);
  });

  // POST /api/hr/designations — Create designation (Admin / Owner only)
  app.post(
    '/designations',
    { preHandler: requireRole(['owner', 'admin']) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parseResult = CreateDesignationInputSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid designation data',
            details: parseResult.error.format()
          }
        });
      }

      const orgId = request.organization!.id;
      const userId = request.user!.id;

      try {
        const des = await repository.createDesignation(orgId, parseResult.data);

        await repository.createAuditLog({
          organizationId: orgId,
          userId,
          action: 'hr.designation_created',
          metadata: JSON.stringify({ designationId: des.id, title: des.title }),
          ipAddress: request.ip,
          userAgent: request.headers['user-agent']
        });

        return reply.status(201).send(des);
      } catch (err: any) {
        return reply.status(400).send({
          success: false,
          error: { code: 'DESIGNATION_CREATE_FAILED', message: err.message || 'Failed to create designation' }
        });
      }
    }
  );

  // GET /api/hr/designations/:id — Get designation details
  app.get('/designations/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const orgId = request.organization!.id;

    const des = await repository.getDesignationById(orgId, id);
    if (!des) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Designation not found' }
      });
    }

    return reply.send(des);
  });

  // PATCH /api/hr/designations/:id — Update designation (Admin / Owner only)
  app.patch(
    '/designations/:id',
    { preHandler: requireRole(['owner', 'admin']) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const parseResult = UpdateDesignationInputSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid designation update data',
            details: parseResult.error.format()
          }
        });
      }

      const orgId = request.organization!.id;
      const userId = request.user!.id;

      try {
        const updated = await repository.updateDesignation(orgId, id, parseResult.data);

        await repository.createAuditLog({
          organizationId: orgId,
          userId,
          action: 'hr.designation_updated',
          metadata: JSON.stringify({ designationId: id }),
          ipAddress: request.ip,
          userAgent: request.headers['user-agent']
        });

        return reply.send(updated);
      } catch (err: any) {
        return reply.status(400).send({
          success: false,
          error: { code: 'DESIGNATION_UPDATE_FAILED', message: err.message || 'Failed to update designation' }
        });
      }
    }
  );

  // DELETE /api/hr/designations/:id — Soft-delete designation (Admin / Owner only)
  app.delete(
    '/designations/:id',
    { preHandler: requireRole(['owner', 'admin']) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const orgId = request.organization!.id;
      const userId = request.user!.id;

      try {
        await repository.deleteDesignation(orgId, id);

        await repository.createAuditLog({
          organizationId: orgId,
          userId,
          action: 'hr.designation_deleted',
          metadata: JSON.stringify({ designationId: id }),
          ipAddress: request.ip,
          userAgent: request.headers['user-agent']
        });

        return reply.send({ success: true });
      } catch (err: any) {
        return reply.status(400).send({
          success: false,
          error: { code: 'DESIGNATION_DELETE_FAILED', message: err.message || 'Failed to delete designation' }
        });
      }
    }
  );

  // ==========================================
  // 4. Employees Endpoints
  // ==========================================

  // GET /api/hr/employees — Paginated employee directory
  app.get('/employees', async (request: FastifyRequest, reply: FastifyReply) => {
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

    const { departmentId, designationId, status, employmentType, search, sortBy, sortOrder } =
      request.query as Record<string, string | undefined>;
    const orgId = request.organization!.id;

    const employees = await repository.listEmployees(orgId, {
      ...queryResult.data,
      departmentId,
      designationId,
      status,
      employmentType,
      search,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined
    });

    return reply.send(employees);
  });

  // GET /api/hr/employees/me — Current user's linked employee profile
  app.get('/employees/me', async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.organization!.id;
    const userId = request.user!.id;

    const emp = await repository.findEmployeeByUserId(orgId, userId);
    if (!emp) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'No employee record linked to current user' }
      });
    }

    return reply.send(emp);
  });

  // POST /api/hr/employees — Create employee (Admin / Owner only)
  app.post(
    '/employees',
    { preHandler: requireRole(['owner', 'admin']) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parseResult = CreateEmployeeInputSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid employee profile data',
            details: parseResult.error.format()
          }
        });
      }

      const orgId = request.organization!.id;
      const userId = request.user!.id;

      try {
        const emp = await repository.createEmployee(orgId, parseResult.data);

        await repository.createAuditLog({
          organizationId: orgId,
          userId,
          action: 'hr.employee_created',
          metadata: JSON.stringify({ employeeId: emp.id, employeeNumber: emp.employeeNumber }),
          ipAddress: request.ip,
          userAgent: request.headers['user-agent']
        });

        return reply.status(201).send(emp);
      } catch (err: any) {
        return reply.status(400).send({
          success: false,
          error: { code: 'EMPLOYEE_CREATE_FAILED', message: err.message || 'Failed to create employee profile' }
        });
      }
    }
  );

  // GET /api/hr/employees/:id — Get employee profile by ID
  app.get('/employees/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const orgId = request.organization!.id;

    const emp = await repository.getEmployeeById(orgId, id);
    if (!emp) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Employee profile not found' }
      });
    }

    return reply.send(emp);
  });

  // PATCH /api/hr/employees/:id — Update employee profile (Admin / Owner only)
  app.patch(
    '/employees/:id',
    { preHandler: requireRole(['owner', 'admin']) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const parseResult = UpdateEmployeeInputSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid employee update data',
            details: parseResult.error.format()
          }
        });
      }

      const orgId = request.organization!.id;
      const userId = request.user!.id;

      try {
        const updated = await repository.updateEmployee(orgId, id, parseResult.data);

        await repository.createAuditLog({
          organizationId: orgId,
          userId,
          action: 'hr.employee_updated',
          metadata: JSON.stringify({ employeeId: id }),
          ipAddress: request.ip,
          userAgent: request.headers['user-agent']
        });

        return reply.send(updated);
      } catch (err: any) {
        return reply.status(400).send({
          success: false,
          error: { code: 'EMPLOYEE_UPDATE_FAILED', message: err.message || 'Failed to update employee' }
        });
      }
    }
  );

  // DELETE /api/hr/employees/:id — Soft-delete / terminate employee (Admin / Owner only)
  app.delete(
    '/employees/:id',
    { preHandler: requireRole(['owner', 'admin']) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const orgId = request.organization!.id;
      const userId = request.user!.id;

      try {
        await repository.deleteEmployee(orgId, id);

        await repository.createAuditLog({
          organizationId: orgId,
          userId,
          action: 'hr.employee_terminated',
          metadata: JSON.stringify({ employeeId: id }),
          ipAddress: request.ip,
          userAgent: request.headers['user-agent']
        });

        return reply.send({ success: true });
      } catch (err: any) {
        return reply.status(400).send({
          success: false,
          error: { code: 'EMPLOYEE_DELETE_FAILED', message: err.message || 'Failed to terminate employee' }
        });
      }
    }
  );

  // ==========================================
  // 5. Attendance Endpoints
  // ==========================================

  // GET /api/hr/attendance — Paginated attendance records
  app.get('/attendance', async (request: FastifyRequest, reply: FastifyReply) => {
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

    const { date, employeeId, status, month } = request.query as Record<string, string | undefined>;
    const orgId = request.organization!.id;

    const records = await repository.listAttendance(orgId, {
      ...queryResult.data,
      date,
      employeeId,
      status,
      month
    });

    return reply.send(records);
  });

  // POST /api/hr/attendance — Record attendance
  app.post('/attendance', { preHandler: requireWriteAccess }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = RecordAttendanceInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid attendance record data',
          details: parseResult.error.format()
        }
      });
    }

    const orgId = request.organization!.id;
    const userId = request.user!.id;
    const role = request.membership!.role;

    // Permissions check: regular members can only record attendance for their own linked employee
    if (role === 'member') {
      const myEmp = await repository.findEmployeeByUserId(orgId, userId);
      if (!myEmp || myEmp.id !== parseResult.data.employeeId) {
        return reply.status(403).send({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Members can only record their own attendance.'
          }
        });
      }
    }

    try {
      const record = await repository.recordAttendance(orgId, userId, parseResult.data);

      await repository.createAuditLog({
        organizationId: orgId,
        userId,
        action: 'hr.attendance_recorded',
        metadata: JSON.stringify({ attendanceId: record.id, employeeId: record.employeeId, date: record.date }),
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      });

      return reply.status(201).send(record);
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: { code: 'ATTENDANCE_RECORD_FAILED', message: err.message || 'Failed to record attendance' }
      });
    }
  });

  // PATCH /api/hr/attendance/:id — Update attendance (Admin / Owner only)
  app.patch(
    '/attendance/:id',
    { preHandler: requireRole(['owner', 'admin']) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const parseResult = UpdateAttendanceInputSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid attendance update data',
            details: parseResult.error.format()
          }
        });
      }

      const orgId = request.organization!.id;
      const userId = request.user!.id;

      try {
        const updated = await repository.updateAttendance(orgId, id, parseResult.data);

        await repository.createAuditLog({
          organizationId: orgId,
          userId,
          action: 'hr.attendance_updated',
          metadata: JSON.stringify({ attendanceId: id }),
          ipAddress: request.ip,
          userAgent: request.headers['user-agent']
        });

        return reply.send(updated);
      } catch (err: any) {
        return reply.status(400).send({
          success: false,
          error: { code: 'ATTENDANCE_UPDATE_FAILED', message: err.message || 'Failed to update attendance' }
        });
      }
    }
  );

  // DELETE /api/hr/attendance/:id — Delete attendance record (Admin / Owner only)
  app.delete(
    '/attendance/:id',
    { preHandler: requireRole(['owner', 'admin']) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const orgId = request.organization!.id;

      try {
        await repository.deleteAttendance(orgId, id);
        return reply.send({ success: true });
      } catch (err: any) {
        return reply.status(400).send({
          success: false,
          error: { code: 'ATTENDANCE_DELETE_FAILED', message: err.message || 'Failed to delete attendance' }
        });
      }
    }
  );

  // ==========================================
  // 6. Leave Management Endpoints
  // ==========================================

  // GET /api/hr/leaves — Paginated leave requests
  app.get('/leaves', async (request: FastifyRequest, reply: FastifyReply) => {
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

    const { employeeId, status, leaveType, year } = request.query as Record<string, string | undefined>;
    const orgId = request.organization!.id;

    const leaves = await repository.listLeaveRequests(orgId, {
      ...queryResult.data,
      employeeId,
      status,
      leaveType,
      year
    });

    return reply.send(leaves);
  });

  // POST /api/hr/leaves — Submit a leave request
  app.post('/leaves', { preHandler: requireWriteAccess }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = CreateLeaveRequestInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid leave request data',
          details: parseResult.error.format()
        }
      });
    }

    const orgId = request.organization!.id;
    const userId = request.user!.id;
    const role = request.membership!.role;

    // If regular member, verify they are requesting leave for their own linked employee
    if (role === 'member') {
      const myEmp = await repository.findEmployeeByUserId(orgId, userId);
      if (!myEmp || myEmp.id !== parseResult.data.employeeId) {
        return reply.status(403).send({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Members can only request leaves for their own employee profile.'
          }
        });
      }
    }

    try {
      const leave = await repository.createLeaveRequest(orgId, userId, parseResult.data);

      await repository.createAuditLog({
        organizationId: orgId,
        userId,
        action: 'hr.leave_requested',
        metadata: JSON.stringify({ leaveId: leave.id, employeeId: leave.employeeId, days: leave.daysCount }),
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      });

      // Notify organization admins
      await repository.createNotification({
        organizationId: orgId,
        userId,
        type: 'activity',
        title: 'New Leave Request Submitted',
        body: `${leave.employeeName} submitted a ${leave.leaveType} leave request for ${leave.daysCount} day(s) (${leave.startDate} to ${leave.endDate}).`
      });

      return reply.status(201).send(leave);
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: { code: 'LEAVE_REQUEST_FAILED', message: err.message || 'Failed to submit leave request' }
      });
    }
  });

  // GET /api/hr/leaves/:id — Get leave request details
  app.get('/leaves/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const orgId = request.organization!.id;

    const leave = await repository.getLeaveRequestById(orgId, id);
    if (!leave) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Leave request not found' }
      });
    }

    return reply.send(leave);
  });

  // PATCH /api/hr/leaves/:id/status — Approve or reject leave request (Admin / Owner only)
  app.patch(
    '/leaves/:id/status',
    { preHandler: requireRole(['owner', 'admin']) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const parseResult = UpdateLeaveStatusInputSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid leave status update data',
            details: parseResult.error.format()
          }
        });
      }

      const orgId = request.organization!.id;
      const userId = request.user!.id;

      try {
        const updated = await repository.updateLeaveStatus(orgId, id, userId, parseResult.data);

        await repository.createAuditLog({
          organizationId: orgId,
          userId,
          action: 'hr.leave_status_updated',
          metadata: JSON.stringify({ leaveId: id, status: updated.status }),
          ipAddress: request.ip,
          userAgent: request.headers['user-agent']
        });

        // Notify employee if linked
        const emp = await repository.getEmployeeById(orgId, updated.employeeId);
        if (emp?.userId) {
          await repository.createNotification({
            organizationId: orgId,
            userId: emp.userId,
            type: 'activity',
            title: `Leave Request ${updated.status === 'approved' ? 'Approved' : 'Rejected'}`,
            body: `Your leave request for ${updated.startDate} to ${updated.endDate} has been ${updated.status}.`
          });
        }

        return reply.send(updated);
      } catch (err: any) {
        return reply.status(400).send({
          success: false,
          error: { code: 'LEAVE_STATUS_UPDATE_FAILED', message: err.message || 'Failed to update leave status' }
        });
      }
    }
  );

  // DELETE /api/hr/leaves/:id — Cancel pending leave request
  app.delete('/leaves/:id', { preHandler: requireWriteAccess }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const orgId = request.organization!.id;
    const userId = request.user!.id;

    try {
      await repository.cancelLeaveRequest(orgId, id, userId);

      await repository.createAuditLog({
        organizationId: orgId,
        userId,
        action: 'hr.leave_cancelled',
        metadata: JSON.stringify({ leaveId: id }),
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      });

      return reply.send({ success: true });
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: { code: 'LEAVE_CANCEL_FAILED', message: err.message || 'Failed to cancel leave request' }
      });
    }
  });
}
