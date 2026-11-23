import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  PaginationQuerySchema,
  CreateLeadInputSchema,
  UpdateLeadInputSchema,
  AssignLeadInputSchema,
  ConvertLeadInputSchema,
  CheckDuplicatesInputSchema,
  CreateAccountInputSchema,
  UpdateAccountInputSchema,
  CreateContactInputSchema,
  UpdateContactInputSchema,
  CreateCrmActivityInputSchema,
  UpdateCrmActivityInputSchema
} from '@ai-business-manager/shared';
import { repository } from '../db/index.js';
import { requireOrganization, requireRole } from '../plugins/auth.js';

export async function crmRoutes(app: FastifyInstance): Promise<void> {
  // All CRM routes require authenticated user and active organization
  app.addHook('preHandler', requireOrganization);

  // ==========================================
  // Leads Endpoints
  // ==========================================

  // GET /api/crm/leads — Paginated lead list with filtering & search
  app.get('/leads', async (request: FastifyRequest, reply: FastifyReply) => {
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

    const { status, source, assignedToId } = request.query as Record<string, string | undefined>;
    const orgId = request.organization!.id;

    const leads = await repository.listLeads(orgId, {
      ...queryResult.data,
      status,
      source,
      assignedToId
    });

    return reply.send(leads);
  });

  // POST /api/crm/leads — Create new lead
  app.post('/leads', async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = CreateLeadInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parseResult.error.errors[0]?.message || 'Invalid lead data',
          details: parseResult.error.format()
        }
      });
    }

    const orgId = request.organization!.id;
    const userId = request.user!.id;

    const lead = await repository.createLead(orgId, parseResult.data);

    // Record activity & audit log
    await repository.recordActivity({
      organizationId: orgId,
      actorId: userId,
      resourceType: 'lead',
      resourceId: lead.id,
      action: 'LEAD_CREATED',
      description: `Created new lead "${lead.title}" (${lead.firstName} ${lead.lastName})`,
      metadata: {
        company: lead.companyName,
        source: lead.source,
        status: lead.status
      }
    });

    await repository.createAuditLog({
      organizationId: orgId,
      userId,
      action: 'CRM_LEAD_CREATE',
      metadata: JSON.stringify({ leadId: lead.id, title: lead.title }),
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    });

    return reply.status(201).send(lead);
  });

  // POST /api/crm/leads/check-duplicates — Check for potential duplicate records
  app.post('/leads/check-duplicates', async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = CheckDuplicatesInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid duplicate check parameters'
        }
      });
    }

    const orgId = request.organization!.id;
    const result = await repository.checkDuplicates(orgId, parseResult.data);
    return reply.send(result);
  });

  // GET /api/crm/leads/:id — Get lead detail
  app.get('/leads/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const orgId = request.organization!.id;
    const lead = await repository.getLeadById(orgId, request.params.id);

    if (!lead) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found'
        }
      });
    }

    return reply.send(lead);
  });

  // PATCH /api/crm/leads/:id — Update lead
  app.patch('/leads/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const parseResult = UpdateLeadInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parseResult.error.errors[0]?.message || 'Invalid lead update payload',
          details: parseResult.error.format()
        }
      });
    }

    const orgId = request.organization!.id;
    const userId = request.user!.id;
    const leadId = request.params.id;

    const existing = await repository.getLeadById(orgId, leadId);
    if (!existing) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found'
        }
      });
    }

    const updated = await repository.updateLead(orgId, leadId, parseResult.data);

    // Record activity for status transition or update
    const isStatusChange = parseResult.data.status && parseResult.data.status !== existing.status;
    await repository.recordActivity({
      organizationId: orgId,
      actorId: userId,
      resourceType: 'lead',
      resourceId: leadId,
      action: isStatusChange ? 'LEAD_STATUS_CHANGED' : 'LEAD_UPDATED',
      description: isStatusChange
        ? `Lead status changed from "${existing.status}" to "${parseResult.data.status}"`
        : `Updated lead details for "${existing.title}"`,
      metadata: {
        previousStatus: existing.status,
        newStatus: parseResult.data.status
      }
    });

    const fullLead = await repository.getLeadById(orgId, leadId);
    return reply.send(fullLead);
  });

  // POST /api/crm/leads/:id/assign — Assign lead to user
  app.post('/leads/:id/assign', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const parseResult = AssignLeadInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid assignment payload'
        }
      });
    }

    const orgId = request.organization!.id;
    const userId = request.user!.id;
    const leadId = request.params.id;

    const existing = await repository.getLeadById(orgId, leadId);
    if (!existing) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found'
        }
      });
    }

    const updated = await repository.assignLead(orgId, leadId, parseResult.data.assignedToId);

    // Send in-app notification to new assignee
    if (parseResult.data.assignedToId && parseResult.data.assignedToId !== userId) {
      await repository.createNotification({
        organizationId: orgId,
        userId: parseResult.data.assignedToId,
        title: 'New Lead Assigned to You',
        body: `You have been assigned to lead "${existing.title}" (${existing.companyName || 'Individual'}).`,
        type: 'activity',
        link: `/crm/leads/${leadId}`
      });
    }

    await repository.recordActivity({
      organizationId: orgId,
      actorId: userId,
      resourceType: 'lead',
      resourceId: leadId,
      action: 'LEAD_ASSIGNED',
      description: `Assigned lead to user ${parseResult.data.assignedToId || 'unassigned'}`,
      metadata: { assignedToId: parseResult.data.assignedToId }
    });

    const fullLead = await repository.getLeadById(orgId, leadId);
    return reply.send(fullLead);
  });

  // POST /api/crm/leads/:id/convert — Convert lead into customer records
  app.post('/leads/:id/convert', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const parseResult = ConvertLeadInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parseResult.error.errors[0]?.message || 'Invalid lead conversion payload',
          details: parseResult.error.format()
        }
      });
    }

    const orgId = request.organization!.id;
    const userId = request.user!.id;
    const leadId = request.params.id;

    try {
      const result = await repository.convertLead(orgId, leadId, parseResult.data, userId);
      return reply.send(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to convert lead';
      return reply.status(400).send({
        success: false,
        error: {
          code: 'CONVERSION_ERROR',
          message: msg
        }
      });
    }
  });

  // DELETE /api/crm/leads/:id — Soft-delete lead
  app.delete('/leads/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const orgId = request.organization!.id;
    const userId = request.user!.id;
    const leadId = request.params.id;

    const lead = await repository.getLeadById(orgId, leadId);
    if (!lead) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found'
        }
      });
    }

    await repository.softDeleteLead(orgId, leadId);

    await repository.recordActivity({
      organizationId: orgId,
      actorId: userId,
      resourceType: 'lead',
      resourceId: leadId,
      action: 'LEAD_DELETED',
      description: `Soft-deleted lead "${lead.title}"`
    });

    await repository.createAuditLog({
      organizationId: orgId,
      userId,
      action: 'CRM_LEAD_DELETE',
      metadata: JSON.stringify({ leadId, title: lead.title }),
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    });

    return reply.send({ success: true, message: 'Lead soft-deleted successfully' });
  });

  // ==========================================
  // Accounts Endpoints
  // ==========================================

  // GET /api/crm/accounts — Paginated accounts
  app.get('/accounts', async (request: FastifyRequest, reply: FastifyReply) => {
    const queryResult = PaginationQuerySchema.safeParse(request.query);
    if (!queryResult.success) {
      return reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid pagination query' }
      });
    }

    const { industry } = request.query as Record<string, string | undefined>;
    const orgId = request.organization!.id;

    const accounts = await repository.listAccounts(orgId, {
      ...queryResult.data,
      industry
    });

    return reply.send(accounts);
  });

  // POST /api/crm/accounts — Create account
  app.post('/accounts', async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = CreateAccountInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parseResult.error.errors[0]?.message || 'Invalid account payload',
          details: parseResult.error.format()
        }
      });
    }

    const orgId = request.organization!.id;
    const userId = request.user!.id;

    const account = await repository.createAccount(orgId, parseResult.data);

    await repository.recordActivity({
      organizationId: orgId,
      actorId: userId,
      resourceType: 'account',
      resourceId: account.id,
      action: 'ACCOUNT_CREATED',
      description: `Created account "${account.name}"`
    });

    const full = await repository.getAccountById(orgId, account.id);
    return reply.status(201).send(full);
  });

  // GET /api/crm/accounts/:id — Get account detail
  app.get('/accounts/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const orgId = request.organization!.id;
    const account = await repository.getAccountById(orgId, request.params.id);

    if (!account) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Account not found' }
      });
    }

    return reply.send(account);
  });

  // PATCH /api/crm/accounts/:id — Update account
  app.patch('/accounts/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const parseResult = UpdateAccountInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid update payload' }
      });
    }

    const orgId = request.organization!.id;
    const userId = request.user!.id;
    const accountId = request.params.id;

    const updated = await repository.updateAccount(orgId, accountId, parseResult.data);
    if (!updated) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Account not found' }
      });
    }

    await repository.recordActivity({
      organizationId: orgId,
      actorId: userId,
      resourceType: 'account',
      resourceId: accountId,
      action: 'ACCOUNT_UPDATED',
      description: `Updated account details for "${updated.name}"`
    });

    const full = await repository.getAccountById(orgId, accountId);
    return reply.send(full);
  });

  // DELETE /api/crm/accounts/:id — Soft-delete account
  app.delete('/accounts/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const orgId = request.organization!.id;
    const userId = request.user!.id;
    const accountId = request.params.id;

    const account = await repository.getAccountById(orgId, accountId);
    if (!account) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Account not found' }
      });
    }

    await repository.softDeleteAccount(orgId, accountId);

    await repository.recordActivity({
      organizationId: orgId,
      actorId: userId,
      resourceType: 'account',
      resourceId: accountId,
      action: 'ACCOUNT_DELETED',
      description: `Soft-deleted account "${account.name}"`
    });

    return reply.send({ success: true, message: 'Account soft-deleted successfully' });
  });

  // ==========================================
  // Contacts Endpoints
  // ==========================================

  // GET /api/crm/contacts — Paginated contacts
  app.get('/contacts', async (request: FastifyRequest, reply: FastifyReply) => {
    const queryResult = PaginationQuerySchema.safeParse(request.query);
    if (!queryResult.success) {
      return reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid pagination query' }
      });
    }

    const { accountId } = request.query as Record<string, string | undefined>;
    const orgId = request.organization!.id;

    const contacts = await repository.listContacts(orgId, {
      ...queryResult.data,
      accountId
    });

    return reply.send(contacts);
  });

  // POST /api/crm/contacts — Create contact
  app.post('/contacts', async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = CreateContactInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parseResult.error.errors[0]?.message || 'Invalid contact payload',
          details: parseResult.error.format()
        }
      });
    }

    const orgId = request.organization!.id;
    const userId = request.user!.id;

    const contact = await repository.createContact(orgId, parseResult.data);

    await repository.recordActivity({
      organizationId: orgId,
      actorId: userId,
      resourceType: 'contact',
      resourceId: contact.id,
      action: 'CONTACT_CREATED',
      description: `Created contact "${contact.firstName} ${contact.lastName}"`
    });

    const full = await repository.getContactById(orgId, contact.id);
    return reply.status(201).send(full);
  });

  // GET /api/crm/contacts/:id — Get contact detail
  app.get('/contacts/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const orgId = request.organization!.id;
    const contact = await repository.getContactById(orgId, request.params.id);

    if (!contact) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact not found' }
      });
    }

    return reply.send(contact);
  });

  // PATCH /api/crm/contacts/:id — Update contact
  app.patch('/contacts/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const parseResult = UpdateContactInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid update payload' }
      });
    }

    const orgId = request.organization!.id;
    const userId = request.user!.id;
    const contactId = request.params.id;

    const updated = await repository.updateContact(orgId, contactId, parseResult.data);
    if (!updated) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact not found' }
      });
    }

    await repository.recordActivity({
      organizationId: orgId,
      actorId: userId,
      resourceType: 'contact',
      resourceId: contactId,
      action: 'CONTACT_UPDATED',
      description: `Updated contact "${updated.firstName} ${updated.lastName}"`
    });

    const full = await repository.getContactById(orgId, contactId);
    return reply.send(full);
  });

  // DELETE /api/crm/contacts/:id — Soft-delete contact
  app.delete('/contacts/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const orgId = request.organization!.id;
    const userId = request.user!.id;
    const contactId = request.params.id;

    const contact = await repository.getContactById(orgId, contactId);
    if (!contact) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact not found' }
      });
    }

    await repository.softDeleteContact(orgId, contactId);

    await repository.recordActivity({
      organizationId: orgId,
      actorId: userId,
      resourceType: 'contact',
      resourceId: contactId,
      action: 'CONTACT_DELETED',
      description: `Soft-deleted contact "${contact.firstName} ${contact.lastName}"`
    });

    return reply.send({ success: true, message: 'Contact soft-deleted successfully' });
  });

  // ==========================================
  // CRM Activities & Follow-ups Endpoints
  // ==========================================

  // GET /api/crm/activities — List CRM activities
  app.get('/activities', async (request: FastifyRequest, reply: FastifyReply) => {
    const queryResult = PaginationQuerySchema.safeParse(request.query);
    if (!queryResult.success) {
      return reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid pagination query' }
      });
    }

    const { leadId, contactId, accountId, status, type } = request.query as Record<string, string | undefined>;
    const orgId = request.organization!.id;

    const activities = await repository.listCrmActivities(orgId, {
      ...queryResult.data,
      leadId,
      contactId,
      accountId,
      status,
      type
    });

    return reply.send(activities);
  });

  // POST /api/crm/activities — Log an activity or follow-up
  app.post('/activities', async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = CreateCrmActivityInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parseResult.error.errors[0]?.message || 'Invalid activity payload',
          details: parseResult.error.format()
        }
      });
    }

    const orgId = request.organization!.id;
    const userId = request.user!.id;

    const activity = await repository.createCrmActivity(orgId, userId, parseResult.data);

    // If a follow-up or meeting is assigned to another user, send an in-app reminder
    if (
      (activity.type === 'follow_up' || activity.type === 'meeting' || activity.type === 'task') &&
      activity.assignedToUserId &&
      activity.assignedToUserId !== userId
    ) {
      await repository.createNotification({
        organizationId: orgId,
        userId: activity.assignedToUserId,
        title: `CRM Follow-up Scheduled: ${activity.subject}`,
        body: `You have been assigned a CRM ${activity.type}: "${activity.subject}".`,
        type: 'reminder',
        link: activity.leadId ? `/crm/leads/${activity.leadId}` : undefined
      });
    }

    await repository.recordActivity({
      organizationId: orgId,
      actorId: userId,
      resourceType: 'crm_activity',
      resourceId: activity.id,
      action: 'CRM_ACTIVITY_LOGGED',
      description: `Logged ${activity.type}: "${activity.subject}"`,
      metadata: { type: activity.type, leadId: activity.leadId }
    });

    const full = await repository.getCrmActivityById(orgId, activity.id);
    return reply.status(201).send(full);
  });

  // PATCH /api/crm/activities/:id — Update activity or mark complete
  app.patch('/activities/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const parseResult = UpdateCrmActivityInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid update payload' }
      });
    }

    const orgId = request.organization!.id;
    const activityId = request.params.id;

    const updated = await repository.updateCrmActivity(orgId, activityId, parseResult.data);
    if (!updated) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Activity not found' }
      });
    }

    const full = await repository.getCrmActivityById(orgId, activityId);
    return reply.send(full);
  });

  // ==========================================
  // Opportunities Endpoints (Sales Interface)
  // ==========================================

  // GET /api/crm/opportunities — List opportunities created during lead conversion
  app.get('/opportunities', async (request: FastifyRequest, reply: FastifyReply) => {
    const queryResult = PaginationQuerySchema.safeParse(request.query);
    if (!queryResult.success) {
      return reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid pagination query' }
      });
    }

    const orgId = request.organization!.id;
    const opps = await repository.listOpportunities(orgId, queryResult.data);
    return reply.send(opps);
  });
}
