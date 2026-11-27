import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import crypto from 'crypto';
import {
  CreateFileMetadataInputSchema,
  PaginationQuerySchema
} from '@ai-business-manager/shared';
import { repository } from '../db/index.js';
import { storageService } from '../core/storage/local-storage.service.js';
import { requireOrganization, requireRole, requireWriteAccess } from '../plugins/auth.js';

export async function fileRoutes(app: FastifyInstance): Promise<void> {
  // POST /api/files/metadata — Register file metadata and acquire signed upload URL
  app.post('/metadata', { preHandler: requireWriteAccess }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = CreateFileMetadataInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parseResult.error.errors[0]?.message || 'Invalid file metadata',
          details: parseResult.error.format()
        },
        timestamp: new Date().toISOString()
      });
    }

    const { fileName, fileSize, mimeType, visibility } = parseResult.data;
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileKey = `tenants/${request.organization!.id}/files/${crypto.randomUUID()}-${sanitizedName}`;

    const file = await repository.createFileMetadata({
      organizationId: request.organization!.id,
      uploadedById: request.user!.id,
      fileName,
      fileKey,
      fileSize,
      mimeType,
      visibility
    });

    const uploadIntent = await storageService.generateUploadUrl(fileKey, mimeType, 3600);

    // Record activity and audit
    await repository.recordActivity({
      organizationId: request.organization!.id,
      actorId: request.user!.id,
      resourceType: 'file',
      resourceId: file.id,
      action: 'file.uploaded',
      description: `Uploaded file ${fileName}`,
      metadata: { fileSize, mimeType }
    });

    await repository.createAuditLog({
      organizationId: request.organization!.id,
      userId: request.user!.id,
      action: 'file.create_metadata',
      metadata: JSON.stringify({ fileId: file.id, fileName, fileSize }),
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    });

    return reply.status(201).send({
      success: true,
      data: {
        file,
        uploadUrl: uploadIntent.uploadUrl,
        expiresAt: uploadIntent.expiresAt
      },
      timestamp: new Date().toISOString()
    });
  });

  // GET /api/files — Paginated list of organization files
  app.get('/', { preHandler: requireOrganization }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = PaginationQuerySchema.safeParse(request.query);
    const query = parseResult.success
      ? parseResult.data
      : { page: 1, limit: 20, sortOrder: 'desc' as const };

    const result = await repository.listOrganizationFiles(request.organization!.id, query);

    return reply.status(200).send({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  });

  // GET /api/files/:id — Retrieve single file metadata
  app.get('/:id', { preHandler: requireOrganization }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const file = await repository.getFileMetadataById(id, request.organization!.id);

    if (!file) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'File not found or has been deleted'
        },
        timestamp: new Date().toISOString()
      });
    }

    return reply.status(200).send({
      success: true,
      data: file,
      timestamp: new Date().toISOString()
    });
  });

  // GET /api/files/:id/access-url — Generate short-lived signed download URL
  app.get('/:id/access-url', { preHandler: requireOrganization }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const file = await repository.getFileMetadataById(id, request.organization!.id);

    if (!file) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'File not found or has been deleted'
        },
        timestamp: new Date().toISOString()
      });
    }

    const { downloadUrl, expiresAt } = await storageService.generateDownloadUrl(
      file.fileKey,
      file.fileName,
      900 // 15 minutes
    );

    await repository.createAuditLog({
      organizationId: request.organization!.id,
      userId: request.user!.id,
      action: 'file.download_requested',
      metadata: JSON.stringify({ fileId: file.id, fileKey: file.fileKey }),
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    });

    return reply.status(200).send({
      success: true,
      data: {
        downloadUrl,
        expiresAt,
        fileName: file.fileName,
        mimeType: file.mimeType
      },
      timestamp: new Date().toISOString()
    });
  });

  // DELETE /api/files/:id — Soft-delete file (Owner/Admin only)
  app.delete(
    '/:id',
    { preHandler: requireRole(['owner', 'admin']) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };

      try {
        await repository.softDeleteFile(id, request.organization!.id);

        await repository.recordActivity({
          organizationId: request.organization!.id,
          actorId: request.user!.id,
          resourceType: 'file',
          resourceId: id,
          action: 'file.deleted',
          description: `Deleted file record`
        });

        await repository.createAuditLog({
          organizationId: request.organization!.id,
          userId: request.user!.id,
          action: 'file.delete',
          metadata: JSON.stringify({ fileId: id }),
          ipAddress: request.ip,
          userAgent: request.headers['user-agent']
        });

        return reply.status(200).send({
          success: true,
          data: { message: 'File deleted successfully' },
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'FILE_DELETE_FAILED',
            message: err instanceof Error ? err.message : 'File not found'
          },
          timestamp: new Date().toISOString()
        });
      }
    }
  );
}
