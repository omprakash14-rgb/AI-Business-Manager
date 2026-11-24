import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  RegisterInputSchema,
  LoginInputSchema,
  type AuthSessionDto
} from '@ai-business-manager/shared';
import { hashPassword, verifyPassword } from '../core/security/password.js';
import { generateSecureToken, hashToken } from '../core/security/tokens.js';
import { repository, type DbOrganization, type DbOrganizationMember } from '../db/index.js';
import { setSessionCookie, clearSessionCookie, requireAuth } from '../plugins/auth.js';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // POST /api/auth/register
  app.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = RegisterInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parseResult.error.errors[0]?.message || 'Invalid input data',
          details: parseResult.error.format()
        },
        timestamp: new Date().toISOString()
      });
    }

    const { email, password, fullName } = parseResult.data;

    const existingUser = await repository.findUserByEmail(email);
    if (existingUser) {
      return reply.status(409).send({
        success: false,
        error: {
          code: 'ACCOUNT_EXISTS',
          message: 'An account with this email address already exists'
        },
        timestamp: new Date().toISOString()
      });
    }

    const passwordHash = await hashPassword(password);
    const user = await repository.createUser({
      email,
      passwordHash,
      fullName
    });

    let organization: DbOrganization;
    let membership: DbOrganizationMember;

    // Check if user has an active pending invitation
    const pendingInvitation = await repository.findPendingInvitationByEmail(email);

    if (pendingInvitation) {
      // User joins the invited organization with the assigned role (defaults to 'viewer')
      const result = await repository.acceptInvitation(pendingInvitation.id, user.id);
      membership = result.membership;
      const org = await repository.findOrganizationById(membership.organizationId);
      if (!org) {
        throw new Error('Invited organization not found');
      }
      organization = org;
    } else {
      // Check if an organization already exists
      const existingOrg = await repository.getFirstOrganization();

      if (existingOrg) {
        // Subsequent user account creation: join existing organization as 'viewer' by default
        membership = await repository.addMember(existingOrg.id, user.id, 'viewer');
        organization = existingOrg;
      } else {
        // First account created in system: founding organization setup (creator becomes owner)
        const result = await repository.createOrganization(
          { name: `${fullName}'s Workspace` },
          user.id
        );
        organization = result.organization;
        membership = result.membership;
      }
    }

    // Create authenticated session
    const rawToken = generateSecureToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await repository.createSession({
      tokenHash,
      userId: user.id,
      activeOrganizationId: organization.id,
      expiresAt
    });

    setSessionCookie(reply, rawToken);

    await repository.createAuditLog({
      organizationId: organization.id,
      userId: user.id,
      action: 'auth.register',
      metadata: JSON.stringify({ email }),
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    });

    const responseData: AuthSessionDto = {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        status: user.status,
        createdAt: user.createdAt
      },
      activeOrganization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        status: organization.status,
        createdAt: organization.createdAt
      },
      currentMembership: {
        id: membership.id,
        organizationId: membership.organizationId,
        userId: membership.userId,
        role: membership.role,
        status: membership.status,
        createdAt: membership.createdAt
      },
      organizations: [
        {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          status: organization.status,
          createdAt: organization.createdAt
        }
      ]
    };

    return reply.status(201).send({
      success: true,
      data: responseData,
      timestamp: new Date().toISOString()
    });
  });

  // POST /api/auth/login
  app.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = LoginInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required'
        },
        timestamp: new Date().toISOString()
      });
    }

    const { email, password } = parseResult.data;
    const user = await repository.findUserByEmail(email);

    // Constant-time check or safe rejection without revealing account existence
    if (!user || user.status !== 'active') {
      return reply.status(401).send({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        },
        timestamp: new Date().toISOString()
      });
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return reply.status(401).send({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        },
        timestamp: new Date().toISOString()
      });
    }

    // Resolve user's organizations
    const userOrgs = await repository.getUserOrganizations(user.id);
    const primary = userOrgs[0] || null;

    const rawToken = generateSecureToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await repository.createSession({
      tokenHash,
      userId: user.id,
      activeOrganizationId: primary ? primary.organization.id : null,
      expiresAt
    });

    setSessionCookie(reply, rawToken);

    await repository.createAuditLog({
      organizationId: primary ? primary.organization.id : null,
      userId: user.id,
      action: 'auth.login',
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    });

    const responseData: AuthSessionDto = {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        status: user.status,
        createdAt: user.createdAt
      },
      activeOrganization: primary ? primary.organization : null,
      currentMembership: primary ? primary.membership : null,
      organizations: userOrgs.map((o) => o.organization)
    };

    return reply.status(200).send({
      success: true,
      data: responseData,
      timestamp: new Date().toISOString()
    });
  });

  // POST /api/auth/logout
  app.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    if (request.session) {
      await repository.deleteSession(request.session.id);
      await repository.createAuditLog({
        organizationId: request.organization ? request.organization.id : null,
        userId: request.user ? request.user.id : null,
        action: 'auth.logout',
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      });
    }

    clearSessionCookie(reply);

    return reply.status(200).send({
      success: true,
      data: { message: 'Successfully logged out' },
      timestamp: new Date().toISOString()
    });
  });

  // GET /api/auth/me
  app.get('/me', { preHandler: requireAuth }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user!;
    const userOrgs = await repository.getUserOrganizations(user.id);

    // If session has no active org but user has orgs, auto-select first org
    let activeOrg = request.organization;
    let membership = request.membership;

    if (!activeOrg && userOrgs.length > 0) {
      const first = userOrgs[0];
      await repository.updateSessionActiveOrg(request.session!.id, first.organization.id);
      activeOrg = first.organization;
      membership = first.membership;
    }

    const responseData: AuthSessionDto = {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        status: user.status,
        createdAt: user.createdAt
      },
      activeOrganization: activeOrg,
      currentMembership: membership,
      organizations: userOrgs.map((o) => o.organization)
    };

    return reply.status(200).send({
      success: true,
      data: responseData,
      timestamp: new Date().toISOString()
    });
  });
}
