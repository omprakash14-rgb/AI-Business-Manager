import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  AnalyticsFilterQuerySchema,
  ReportTypeSchema,
  ReportType
} from '@ai-business-manager/shared';
import { repository } from '../db/index.js';
import { requireOrganization } from '../plugins/auth.js';

export async function analyticsRoutes(app: FastifyInstance): Promise<void> {
  // All Analytics routes require an authenticated user with an active organization context
  app.addHook('preHandler', requireOrganization);

  // ==========================================
  // 1. Executive Dashboard Aggregated View
  // ==========================================

  // GET /api/analytics/dashboard — Unified cross-module executive metrics & charts
  app.get('/dashboard', async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = AnalyticsFilterQuerySchema.safeParse(request.query);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid analytics query parameters',
          details: parseResult.error.format()
        }
      });
    }

    const orgId = request.organization!.id;
    const userRole = request.membership!.role;

    try {
      const dashboard = await repository.getExecutiveDashboard(orgId, userRole, parseResult.data);
      return reply.send(dashboard);
    } catch (err: any) {
      return reply.status(500).send({
        success: false,
        error: {
          code: 'ANALYTICS_AGGREGATION_FAILED',
          message: err.message || 'Failed to aggregate executive dashboard metrics'
        }
      });
    }
  });

  // ==========================================
  // 2. Cross-Module Analytical Reports
  // ==========================================

  // GET /api/analytics/reports/:reportType — Structured report data
  app.get('/reports/:reportType', async (request: FastifyRequest, reply: FastifyReply) => {
    const { reportType } = request.params as { reportType: string };
    const typeParse = ReportTypeSchema.safeParse(reportType);
    if (!typeParse.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'INVALID_REPORT_TYPE',
          message: `Unknown report type '${reportType}'. Valid types: ${ReportTypeSchema.options.join(', ')}`
        }
      });
    }

    const queryParse = AnalyticsFilterQuerySchema.safeParse(request.query);
    if (!queryParse.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid report query parameters',
          details: queryParse.error.format()
        }
      });
    }

    const orgId = request.organization!.id;
    const userRole = request.membership!.role;

    try {
      const report = await repository.generateReport(
        orgId,
        userRole,
        typeParse.data as ReportType,
        queryParse.data
      );
      return reply.send(report);
    } catch (err: any) {
      const statusCode = err.message?.includes('Unauthorized') ? 403 : 500;
      return reply.status(statusCode).send({
        success: false,
        error: {
          code: 'REPORT_GENERATION_FAILED',
          message: err.message || 'Failed to generate cross-module report'
        }
      });
    }
  });

  // ==========================================
  // 3. Tabular CSV Exports
  // ==========================================

  // GET /api/analytics/export/:reportType — Stream downloadable CSV report
  app.get('/export/:reportType', async (request: FastifyRequest, reply: FastifyReply) => {
    const { reportType } = request.params as { reportType: string };
    const typeParse = ReportTypeSchema.safeParse(reportType);
    if (!typeParse.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'INVALID_REPORT_TYPE',
          message: `Unknown report type '${reportType}'. Valid types: ${ReportTypeSchema.options.join(', ')}`
        }
      });
    }

    const queryParse = AnalyticsFilterQuerySchema.safeParse(request.query);
    const orgId = request.organization!.id;
    const userRole = request.membership!.role;

    try {
      const csv = await repository.exportReportCsv(
        orgId,
        userRole,
        typeParse.data as ReportType,
        queryParse.data
      );

      const todayStr = new Date().toISOString().substring(0, 10);
      const filename = `${typeParse.data}_${todayStr}.csv`;

      reply.header('Content-Type', 'text/csv; charset=utf-8');
      reply.header('Content-Disposition', `attachment; filename="${filename}"`);
      return reply.send(csv);
    } catch (err: any) {
      const statusCode = err.message?.includes('Unauthorized') ? 403 : 500;
      return reply.status(statusCode).send({
        success: false,
        error: {
          code: 'REPORT_EXPORT_FAILED',
          message: err.message || 'Failed to export report CSV'
        }
      });
    }
  });
}
