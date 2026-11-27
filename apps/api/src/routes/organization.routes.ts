import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  CreateOrganizationInputSchema,
  SwitchOrganizationInputSchema,
  UpdateOrganizationInputSchema,
  InviteMemberInputSchema,
  UpdateMemberRoleInputSchema,
  AcceptInvitationInputSchema
} from '@ai-business-manager/shared';
import { generateSecureToken, hashToken } from '../core/security/tokens.js';
import { repository } from '../db/index.js';
import { requireAuth, requireOrganization, requireRole } from '../plugins/auth.js';

export async function organizationRoutes(app: FastifyInstance): Promise<void> {
  // POST /api/organizations — Create new organization (Creator becomes Owner)
  app.post('/', { preHandler: requireAuth }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = CreateOrganizationInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parseResult.error.errors[0]?.message || 'Invalid organization data'
        },
        timestamp: new Date().toISOString()
      });
    }

    const { organization, membership } = await repository.createOrganization(
      parseResult.data,
      request.user!.id
    );

    // Automatically set the newly created organization as active in session
    await repository.updateSessionActiveOrg(request.session!.id, organization.id);

    await repository.createAuditLog({
      organizationId: organization.id,
      userId: request.user!.id,
      action: 'org.create',
      metadata: JSON.stringify({ name: organization.name }),
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    });

    return reply.status(201).send({
      success: true,
      data: { organization, membership },
      timestamp: new Date().toISOString()
    });
  });

  // GET /api/organizations — List all organizations the user belongs to
  app.get('/', { preHandler: requireAuth }, async (request: FastifyRequest, reply: FastifyReply) => {
    const orgs = await repository.getUserOrganizations(request.user!.id);
    return reply.status(200).send({
      success: true,
      data: orgs.map((o) => ({
        ...o.organization,
        role: o.membership.role,
        membershipStatus: o.membership.status
      })),
      timestamp: new Date().toISOString()
    });
  });

  // POST /api/organizations/switch — Switch active organization context
  app.post('/switch', { preHandler: requireAuth }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = SwitchOrganizationInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Valid organizationId is required'
        },
        timestamp: new Date().toISOString()
      });
    }

    const { organizationId } = parseResult.data;

    // Validate that the user belongs to the target organization
    const membership = await repository.getMembership(organizationId, request.user!.id);
    if (!membership || membership.status !== 'active') {
      return reply.status(403).send({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to switch to this organization'
        },
        timestamp: new Date().toISOString()
      });
    }

    const org = await repository.findOrganizationById(organizationId);
    if (!org || org.status !== 'active') {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'ORGANIZATION_NOT_FOUND',
          message: 'Organization not found or inactive'
        },
        timestamp: new Date().toISOString()
      });
    }

    await repository.updateSessionActiveOrg(request.session!.id, org.id);

    await repository.createAuditLog({
      organizationId: org.id,
      userId: request.user!.id,
      action: 'org.switch',
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    });

    return reply.status(200).send({
      success: true,
      data: {
        activeOrganization: org,
        currentMembership: membership
      },
      timestamp: new Date().toISOString()
    });
  });

  // GET /api/organizations/current — Details of currently active organization
  app.get('/current', { preHandler: requireOrganization }, async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send({
      success: true,
      data: {
        organization: request.organization,
        membership: request.membership
      },
      timestamp: new Date().toISOString()
    });
  });

  // PATCH /api/organizations/current — Update organization details (Owner/Admin only)
  app.patch(
    '/current',
    { preHandler: requireRole(['owner', 'admin']) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parseResult = UpdateOrganizationInputSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parseResult.error.errors[0]?.message || 'Invalid organization details'
          },
          timestamp: new Date().toISOString()
        });
      }

      const updated = await repository.updateOrganization(request.organization!.id, parseResult.data);

      await repository.createAuditLog({
        organizationId: request.organization!.id,
        userId: request.user!.id,
        action: 'org.update',
        metadata: JSON.stringify(parseResult.data),
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      });

      return reply.status(200).send({
        success: true,
        data: updated,
        timestamp: new Date().toISOString()
      });
    }
  );

  // GET /api/organizations/current/members — List members of active organization
  app.get('/current/members', { preHandler: requireOrganization }, async (request: FastifyRequest, reply: FastifyReply) => {
    const members = await repository.getOrganizationMembers(request.organization!.id);
    return reply.status(200).send({
      success: true,
      data: members,
      timestamp: new Date().toISOString()
    });
  });

  // PATCH /api/organizations/current/members/:memberId — Update member role (Owner ONLY)
  app.patch(
    '/current/members/:memberId',
    { preHandler: requireRole(['owner']) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { memberId } = request.params as { memberId: string };
      const parseResult = UpdateMemberRoleInputSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parseResult.error.errors[0]?.message || 'Valid assignable role (admin, manager, member, or viewer) is required'
          },
          timestamp: new Date().toISOString()
        });
      }

      const { role: newRole } = parseResult.data;
      const callerRole = request.membership!.role;

      // Strict Owner enforcement: Only the actual Organization Owner can manage roles
      if (callerRole !== 'owner') {
        return reply.status(403).send({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Only the Organization Owner can assign, modify, or revoke member roles'
          },
          timestamp: new Date().toISOString()
        });
      }

      // Guard: Cannot change own role
      if (request.membership!.id === memberId) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'You cannot modify your own role'
          },
          timestamp: new Date().toISOString()
        });
      }

      // Target member lookup and validation
      const targetMember = await repository.getMemberById(request.organization!.id, memberId);
      if (!targetMember) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'MEMBER_NOT_FOUND',
            message: 'Target member does not exist in this organization'
          },
          timestamp: new Date().toISOString()
        });
      }

      // Guard: Owner account protection - Owner cannot be demoted or modified through member role management
      if (targetMember.role === 'owner') {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'OWNER_PROTECTION',
            message: 'The Organization Owner cannot be demoted or modified through member role management'
          },
          timestamp: new Date().toISOString()
        });
      }

      try {
        const { updated, previousRole } = await repository.updateMemberRole(request.organization!.id, memberId, newRole);

        // Record security audit log
        await repository.createAuditLog({
          organizationId: request.organization!.id,
          userId: request.user!.id,
          action: 'member.role_update',
          metadata: JSON.stringify({
            memberId,
            targetUserId: updated.userId,
            previousRole,
            newRole,
            actingOwnerId: request.user!.id,
            operationType: 'role_assignment'
          }),
          ipAddress: request.ip,
          userAgent: request.headers['user-agent']
        });

        // Record activity event for timeline
        await repository.recordActivity({
          organizationId: request.organization!.id,
          actorId: request.user!.id,
          resourceType: 'member',
          resourceId: memberId,
          action: 'role_updated',
          description: `Updated member role from ${previousRole} to ${newRole}`,
          metadata: { memberId, previousRole, newRole }
        });

        return reply.status(200).send({
          success: true,
          data: updated,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'ROLE_UPDATE_FAILED',
            message: err instanceof Error ? err.message : 'Failed to update member role'
          },
          timestamp: new Date().toISOString()
        });
      }
    }
  );

  // DELETE /api/organizations/current/members/:memberId — Remove member (Owner ONLY)
  app.delete(
    '/current/members/:memberId',
    { preHandler: requireRole(['owner']) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { memberId } = request.params as { memberId: string };

      if (request.membership!.role !== 'owner') {
        return reply.status(403).send({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Only the Organization Owner can remove members from the organization'
          },
          timestamp: new Date().toISOString()
        });
      }

      // Guard: Cannot remove yourself through this endpoint
      if (request.membership!.id === memberId) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'The Organization Owner cannot remove themselves from the organization'
          },
          timestamp: new Date().toISOString()
        });
      }

      const targetMember = await repository.getMemberById(request.organization!.id, memberId);
      if (!targetMember) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'MEMBER_NOT_FOUND',
            message: 'Target member does not exist in this organization'
          },
          timestamp: new Date().toISOString()
        });
      }

      if (targetMember.role === 'owner') {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'OWNER_PROTECTION',
            message: 'The Organization Owner cannot be removed from the organization'
          },
          timestamp: new Date().toISOString()
        });
      }

      try {
        await repository.removeMember(request.organization!.id, memberId);

        await repository.createAuditLog({
          organizationId: request.organization!.id,
          userId: request.user!.id,
          action: 'member.remove',
          metadata: JSON.stringify({ memberId, targetUserId: targetMember.userId, role: targetMember.role }),
          ipAddress: request.ip,
          userAgent: request.headers['user-agent']
        });

        await repository.recordActivity({
          organizationId: request.organization!.id,
          actorId: request.user!.id,
          resourceType: 'member',
          resourceId: memberId,
          action: 'member_removed',
          description: `Removed member (${targetMember.role}) from the organization`,
          metadata: { memberId, role: targetMember.role }
        });

        return reply.status(200).send({
          success: true,
          data: { message: 'Member removed successfully' },
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'MEMBER_REMOVAL_FAILED',
            message: err instanceof Error ? err.message : 'Failed to remove member'
          },
          timestamp: new Date().toISOString()
        });
      }
    }
  );

  // POST /api/organizations/current/invitations — Invite member (Owner or Admin)
  app.post(
    '/current/invitations',
    { preHandler: requireRole(['owner', 'admin']) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parseResult = InviteMemberInputSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parseResult.error.errors[0]?.message || 'Invalid invitation parameters'
          },
          timestamp: new Date().toISOString()
        });
      }

      const callerRole = request.membership!.role;
      let targetRole = parseResult.data.role || 'viewer';

      // Rule: Only Owners can assign elevated roles (admin, manager, member).
      // If an Admin creates an invitation, it is strictly forced to default 'viewer' role.
      if (callerRole !== 'owner') {
        if (targetRole !== 'viewer') {
          return reply.status(403).send({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Only the Organization Owner can assign elevated roles to invitations. Non-owner invitations must use the default Viewer role.'
            },
            timestamp: new Date().toISOString()
          });
        }
        targetRole = 'viewer';
      }

      const { email } = parseResult.data;
      const rawToken = generateSecureToken(24);
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      try {
        const invitation = await repository.createInvitation({
          organizationId: request.organization!.id,
          email,
          role: targetRole,
          tokenHash,
          invitedById: request.user!.id,
          expiresAt
        });

        await repository.createAuditLog({
          organizationId: request.organization!.id,
          userId: request.user!.id,
          action: 'member.invite',
          metadata: JSON.stringify({ email, role: targetRole, actingUserId: request.user!.id }),
          ipAddress: request.ip,
          userAgent: request.headers['user-agent']
        });

        await repository.recordActivity({
          organizationId: request.organization!.id,
          actorId: request.user!.id,
          resourceType: 'invitation',
          resourceId: invitation.id,
          action: 'invitation_created',
          description: `Invited ${email} with ${targetRole} role`,
          metadata: { email, role: targetRole }
        });

        return reply.status(201).send({
          success: true,
          data: {
            invitation: {
              id: invitation.id,
              organizationId: invitation.organizationId,
              email: invitation.email,
              role: invitation.role,
              status: invitation.status,
              expiresAt: invitation.expiresAt,
              createdAt: invitation.createdAt
            },
            // Secure token returned once for manual delivery/copying
            invitationToken: rawToken
          },
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'INVITATION_FAILED',
            message: err instanceof Error ? err.message : 'Failed to create invitation'
          },
          timestamp: new Date().toISOString()
        });
      }
    }
  );

  // GET /api/organizations/current/invitations — List pending invitations (Owner/Admin only)
  app.get(
    '/current/invitations',
    { preHandler: requireRole(['owner', 'admin']) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const invitations = await repository.getPendingInvitations(request.organization!.id);
      return reply.status(200).send({
        success: true,
        data: invitations.map((inv) => ({
          id: inv.id,
          organizationId: inv.organizationId,
          email: inv.email,
          role: inv.role,
          status: inv.status,
          expiresAt: inv.expiresAt,
          createdAt: inv.createdAt
        })),
        timestamp: new Date().toISOString()
      });
    }
  );

  // DELETE /api/organizations/current/invitations/:invitationId — Revoke invitation (Owner/Admin only)
  app.delete(
    '/current/invitations/:invitationId',
    { preHandler: requireRole(['owner', 'admin']) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { invitationId } = request.params as { invitationId: string };
      try {
        await repository.revokeInvitation(request.organization!.id, invitationId);
        return reply.status(200).send({
          success: true,
          data: { message: 'Invitation revoked successfully' },
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'REVOKE_FAILED',
            message: err instanceof Error ? err.message : 'Failed to revoke invitation'
          },
          timestamp: new Date().toISOString()
        });
      }
    }
  );

  // POST /api/invitations/accept — Accept an invitation token
  app.post('/accept-invitation', { preHandler: requireAuth }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = AcceptInvitationInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Valid invitation token is required'
        },
        timestamp: new Date().toISOString()
      });
    }

    const { token } = parseResult.data;
    const tokenHash = hashToken(token);
    const invitation = await repository.findInvitationByTokenHash(tokenHash);

    if (!invitation) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'INVITATION_NOT_FOUND',
          message: 'Invitation not found or invalid'
        },
        timestamp: new Date().toISOString()
      });
    }

    if (request.user!.email.trim().toLowerCase() !== invitation.email.trim().toLowerCase()) {
      return reply.status(403).send({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'This invitation was issued for a different email address'
        },
        timestamp: new Date().toISOString()
      });
    }

    try {
      const { membership } = await repository.acceptInvitation(invitation.id, request.user!.id);
      const org = await repository.findOrganizationById(membership.organizationId);

      // Automatically switch to the joined organization
      if (org) {
        await repository.updateSessionActiveOrg(request.session!.id, org.id);
      }

      await repository.createAuditLog({
        organizationId: membership.organizationId,
        userId: request.user!.id,
        action: 'invitation.accept',
        metadata: JSON.stringify({ invitationId: invitation.id, role: membership.role }),
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      });

      return reply.status(200).send({
        success: true,
        data: {
          message: `Successfully joined ${org ? org.name : 'the organization'} as ${membership.role}`,
          membership,
          organization: org
        },
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      const statusCode = (err as { statusCode?: number }).statusCode === 403 ? 403 : 400;
      const errorCode = statusCode === 403 ? 'FORBIDDEN' : 'ACCEPT_FAILED';
      return reply.status(statusCode).send({
        success: false,
        error: {
          code: errorCode,
          message: err instanceof Error ? err.message : 'Could not accept invitation'
        },
        timestamp: new Date().toISOString()
      });
    }
  });
}
