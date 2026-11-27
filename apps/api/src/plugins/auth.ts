import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastifyCookie from '@fastify/cookie';
import { hashToken } from '../core/security/tokens.js';
import {
  repository,
  type DbUser,
  type DbSession,
  type DbOrganization,
  type DbOrganizationMember
} from '../db/index.js';
import type { Role } from '@ai-business-manager/shared';

export const SESSION_COOKIE_NAME = 'ai_session_id';

declare module 'fastify' {
  interface FastifyRequest {
    user: DbUser | null;
    session: DbSession | null;
    organization: DbOrganization | null;
    membership: DbOrganizationMember | null;
  }
}

export function setSessionCookie(reply: FastifyReply, token: string): void {
  reply.setCookie(SESSION_COOKIE_NAME, token, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
  });
}

export function clearSessionCookie(reply: FastifyReply): void {
  reply.clearCookie(SESSION_COOKIE_NAME, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
}

export async function registerAuthPlugin(app: FastifyInstance): Promise<void> {
  // Register cookie parser
  await app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET || 'dev-session-cookie-secret-key-32chars'
  });

  // Decorate request with identity context
  app.decorateRequest('user', null);
  app.decorateRequest('session', null);
  app.decorateRequest('organization', null);
  app.decorateRequest('membership', null);

  // Global pre-handler: resolve session and tenant context
  app.addHook('preHandler', async (request: FastifyRequest) => {
    const rawToken = request.cookies[SESSION_COOKIE_NAME];
    if (!rawToken) return;

    try {
      const tokenHash = hashToken(rawToken);
      const session = await repository.findSessionByTokenHash(tokenHash);
      if (!session) return;

      const user = await repository.findUserById(session.userId);
      if (!user || user.status !== 'active') return;

      request.user = user;
      request.session = session;

      // If session has an active organization, resolve and verify membership
      if (session.activeOrganizationId) {
        const membership = await repository.getMembership(session.activeOrganizationId, user.id);
        if (membership && membership.status === 'active') {
          const org = await repository.findOrganizationById(session.activeOrganizationId);
          if (org && org.status === 'active') {
            request.organization = org;
            request.membership = membership;
          }
        }
      }
    } catch (err) {
      request.log.error(err, 'Error resolving session context');
    }
  });
}

/**
 * Guard: Requires an authenticated user session.
 */
export async function requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (!request.user || !request.session) {
    reply.status(401).send({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required. Please log in.'
      },
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Guard: Requires both an authenticated session and an active, validated organization context.
 */
export async function requireOrganization(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  await requireAuth(request, reply);
  if (reply.sent) return;

  if (!request.organization || !request.membership) {
    reply.status(400).send({
      success: false,
      error: {
        code: 'NO_ACTIVE_ORGANIZATION',
        message: 'An active organization context is required for this operation.'
      },
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Guard: Requires the user to have one of the specified roles in the active organization.
 */
export function requireRole(allowedRoles: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    await requireOrganization(request, reply);
    if (reply.sent) return;

    const currentRole = request.membership!.role;
    if (!allowedRoles.includes(currentRole)) {
      reply.status(403).send({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Insufficient permissions. Allowed roles: ${allowedRoles.join(', ')}.`
        },
        timestamp: new Date().toISOString()
      });
    }
  };
}

/**
 * Guard: Blocks read-only 'viewer' memberships from performing state-mutating operations.
 */
export async function requireWriteAccess(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  await requireOrganization(request, reply);
  if (reply.sent) return;

  if (request.membership!.role === 'viewer') {
    reply.status(403).send({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Read-only Viewer accounts cannot create, modify, or delete organization records.'
      },
      timestamp: new Date().toISOString()
    });
  }
}
