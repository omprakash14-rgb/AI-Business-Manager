import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  PaginationQuerySchema,
  CreateFinancialCategoryInputSchema,
  UpdateFinancialCategoryInputSchema,
  FinancialCategoryTypeSchema,
  CreateTransactionInputSchema,
  UpdateTransactionInputSchema,
  TransactionTypeSchema,
  TransactionStatusSchema,
  CreateInvoiceInputSchema,
  UpdateInvoiceInputSchema,
  InvoiceStatusSchema,
  CreatePaymentInputSchema,
  CreateBudgetInputSchema,
  UpdateBudgetInputSchema,
  FinancialCategoryType,
  TransactionType,
  TransactionStatus,
  InvoiceStatus
} from '@ai-business-manager/shared';
import { repository } from '../db/index.js';
import { requireOrganization, requireRole } from '../plugins/auth.js';

export async function financeRoutes(app: FastifyInstance): Promise<void> {
  // All Finance routes require authenticated session & active organization context
  app.addHook('preHandler', requireOrganization);

  // ==========================================
  // 1. Financial Categories Endpoints
  // ==========================================

  // GET /api/finance/categories — List categories for organization
  app.get('/categories', async (request: FastifyRequest, reply: FastifyReply) => {
    const { type } = request.query as { type?: string };
    const orgId = request.organization!.id;

    let parsedType: FinancialCategoryType | undefined;
    if (type) {
      const typeParsed = FinancialCategoryTypeSchema.safeParse(type);
      if (typeParsed.success) {
        parsedType = typeParsed.data;
      }
    }

    const categories = await repository.listFinancialCategories(orgId, parsedType);
    return reply.send({
      success: true,
      data: categories
    });
  });

  // POST /api/finance/categories — Create new financial category (Admin/Owner)
  app.post(
    '/categories',
    { preHandler: [requireRole(['owner', 'admin'])] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parseResult = CreateFinancialCategoryInputSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid category payload',
            details: parseResult.error.format()
          }
        });
      }

      const orgId = request.organization!.id;
      const category = await repository.createFinancialCategory(orgId, parseResult.data);
      return reply.status(201).send({
        success: true,
        data: category
      });
    }
  );

  // PATCH /api/finance/categories/:id — Update category (Admin/Owner)
  app.patch(
    '/categories/:id',
    { preHandler: [requireRole(['owner', 'admin'])] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const parseResult = UpdateFinancialCategoryInputSchema.safeParse(request.body);
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

      const orgId = request.organization!.id;
      const updated = await repository.updateFinancialCategory(orgId, id, parseResult.data);
      if (!updated) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Category not found' }
        });
      }

      return reply.send({
        success: true,
        data: updated
      });
    }
  );

  // DELETE /api/finance/categories/:id — Delete category (Admin/Owner)
  app.delete(
    '/categories/:id',
    { preHandler: [requireRole(['owner', 'admin'])] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const orgId = request.organization!.id;

      try {
        const success = await repository.deleteFinancialCategory(orgId, id);
        if (!success) {
          return reply.status(404).send({
            success: false,
            error: { code: 'NOT_FOUND', message: 'Category not found' }
          });
        }
        return reply.send({
          success: true,
          message: 'Category deleted successfully'
        });
      } catch (err: any) {
        return reply.status(400).send({
          success: false,
          error: { code: 'CATEGORY_IN_USE', message: err.message }
        });
      }
    }
  );

  // ==========================================
  // 2. Transactions (Income & Expenses) Endpoints
  // ==========================================

  // GET /api/finance/transactions — Paginated list of income/expense records
  app.get('/transactions', async (request: FastifyRequest, reply: FastifyReply) => {
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

    const { type, categoryId, status, startDate, endDate, accountId } = request.query as Record<
      string,
      string | undefined
    >;
    const orgId = request.organization!.id;

    let parsedType: TransactionType | undefined;
    if (type) {
      const typeParsed = TransactionTypeSchema.safeParse(type);
      if (typeParsed.success) parsedType = typeParsed.data;
    }

    let parsedStatus: TransactionStatus | undefined;
    if (status) {
      const statusParsed = TransactionStatusSchema.safeParse(status);
      if (statusParsed.success) parsedStatus = statusParsed.data;
    }

    const transactions = await repository.listFinancialTransactions(orgId, {
      ...queryResult.data,
      type: parsedType,
      categoryId,
      status: parsedStatus,
      startDate,
      endDate,
      accountId
    });

    return reply.send(transactions);
  });

  // POST /api/finance/transactions — Log income or expense
  app.post('/transactions', async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = CreateTransactionInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid transaction payload',
          details: parseResult.error.format()
        }
      });
    }

    const orgId = request.organization!.id;
    const userId = request.user!.id;

    try {
      const tx = await repository.createFinancialTransaction(orgId, userId, parseResult.data);
      return reply.status(201).send({
        success: true,
        data: tx
      });
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: { code: 'TRANSACTION_FAILED', message: err.message }
      });
    }
  });

  // GET /api/finance/transactions/:id — Transaction detail
  app.get(
    '/transactions/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;
      const orgId = request.organization!.id;

      const tx = await repository.getFinancialTransactionById(orgId, id);
      if (!tx) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Transaction not found' }
        });
      }

      return reply.send({
        success: true,
        data: tx
      });
    }
  );

  // PATCH /api/finance/transactions/:id — Update transaction
  app.patch(
    '/transactions/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;
      const parseResult = UpdateTransactionInputSchema.safeParse(request.body);
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

      const orgId = request.organization!.id;
      const userId = request.user!.id;

      const updated = await repository.updateFinancialTransaction(orgId, id, parseResult.data, userId);
      if (!updated) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Transaction not found' }
        });
      }

      return reply.send({
        success: true,
        data: updated
      });
    }
  );

  // DELETE /api/finance/transactions/:id — Delete transaction
  app.delete(
    '/transactions/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;
      const orgId = request.organization!.id;
      const userId = request.user!.id;

      const success = await repository.deleteFinancialTransaction(orgId, id, userId);
      if (!success) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Transaction not found' }
        });
      }

      return reply.send({
        success: true,
        message: 'Transaction deleted successfully'
      });
    }
  );

  // ==========================================
  // 3. Invoices Endpoints
  // ==========================================

  // GET /api/finance/invoices — Paginated invoices list with filters
  app.get('/invoices', async (request: FastifyRequest, reply: FastifyReply) => {
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

    const { accountId, status, isOverdue, startDate, endDate } = request.query as Record<
      string,
      string | undefined
    >;
    const orgId = request.organization!.id;

    let parsedStatus: InvoiceStatus | undefined;
    if (status) {
      const statusParsed = InvoiceStatusSchema.safeParse(status);
      if (statusParsed.success) parsedStatus = statusParsed.data;
    }

    const invoices = await repository.listInvoices(orgId, {
      ...queryResult.data,
      accountId,
      status: parsedStatus,
      isOverdue: isOverdue === 'true' ? true : isOverdue === 'false' ? false : undefined,
      startDate,
      endDate
    });

    return reply.send(invoices);
  });

  // POST /api/finance/invoices — Create invoice with line items
  app.post('/invoices', async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = CreateInvoiceInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid invoice payload',
          details: parseResult.error.format()
        }
      });
    }

    const orgId = request.organization!.id;
    const userId = request.user!.id;

    try {
      const invoice = await repository.createInvoice(orgId, userId, parseResult.data);
      return reply.status(201).send({
        success: true,
        data: invoice
      });
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: { code: 'INVOICE_CREATE_FAILED', message: err.message }
      });
    }
  });

  // POST /api/finance/invoices/from-quotation/:quotationId — Lead-to-cash quotation conversion
  app.post(
    '/invoices/from-quotation/:quotationId',
    async (request: FastifyRequest<{ Params: { quotationId: string } }>, reply: FastifyReply) => {
      const { quotationId } = request.params;
      const orgId = request.organization!.id;
      const userId = request.user!.id;

      try {
        const invoice = await repository.createInvoiceFromQuotation(orgId, userId, quotationId);
        return reply.status(201).send({
          success: true,
          data: invoice
        });
      } catch (err: any) {
        return reply.status(400).send({
          success: false,
          error: { code: 'CONVERSION_FAILED', message: err.message }
        });
      }
    }
  );

  // GET /api/finance/invoices/:id — Invoice details with line items
  app.get(
    '/invoices/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;
      const orgId = request.organization!.id;

      const invoice = await repository.getInvoiceById(orgId, id);
      if (!invoice) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Invoice not found' }
        });
      }

      return reply.send({
        success: true,
        data: invoice
      });
    }
  );

  // PATCH /api/finance/invoices/:id/status — Transition invoice status
  app.patch(
    '/invoices/:id/status',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;
      const { status } = request.body as { status: string };

      const statusParsed = InvoiceStatusSchema.safeParse(status);
      if (!statusParsed.success) {
        return reply.status(400).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid invoice status' }
        });
      }

      const orgId = request.organization!.id;
      const userId = request.user!.id;

      try {
        const updated = await repository.updateInvoiceStatus(orgId, id, statusParsed.data, userId);
        if (!updated) {
          return reply.status(404).send({
            success: false,
            error: { code: 'NOT_FOUND', message: 'Invoice not found' }
          });
        }
        return reply.send({
          success: true,
          data: updated
        });
      } catch (err: any) {
        return reply.status(400).send({
          success: false,
          error: { code: 'STATUS_UPDATE_FAILED', message: err.message }
        });
      }
    }
  );

  // DELETE /api/finance/invoices/:id — Soft delete invoice
  app.delete(
    '/invoices/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;
      const orgId = request.organization!.id;
      const userId = request.user!.id;

      try {
        const success = await repository.softDeleteInvoice(orgId, id, userId);
        if (!success) {
          return reply.status(404).send({
            success: false,
            error: { code: 'NOT_FOUND', message: 'Invoice not found' }
          });
        }
        return reply.send({
          success: true,
          message: 'Invoice deleted successfully'
        });
      } catch (err: any) {
        return reply.status(400).send({
          success: false,
          error: { code: 'DELETE_PROHIBITED', message: err.message }
        });
      }
    }
  );

  // ==========================================
  // 4. Payment Records Endpoints
  // ==========================================

  // GET /api/finance/payments — List payments
  app.get('/payments', async (request: FastifyRequest, reply: FastifyReply) => {
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

    const { invoiceId, accountId } = request.query as Record<string, string | undefined>;
    const orgId = request.organization!.id;

    const payments = await repository.listPaymentRecords(orgId, {
      ...queryResult.data,
      invoiceId,
      accountId
    });

    return reply.send(payments);
  });

  // POST /api/finance/payments — Record customer payment
  app.post('/payments', async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = CreatePaymentInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid payment payload',
          details: parseResult.error.format()
        }
      });
    }

    const orgId = request.organization!.id;
    const userId = request.user!.id;

    try {
      const payment = await repository.recordPayment(orgId, userId, parseResult.data);
      return reply.status(201).send({
        success: true,
        data: payment
      });
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: { code: 'PAYMENT_FAILED', message: err.message }
      });
    }
  });

  // GET /api/finance/payments/:id — Payment record details
  app.get(
    '/payments/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;
      const orgId = request.organization!.id;

      const payment = await repository.getPaymentRecordById(orgId, id);
      if (!payment) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Payment record not found' }
        });
      }

      return reply.send({
        success: true,
        data: payment
      });
    }
  );

  // PATCH /api/finance/payments/:id/void — Void payment record (Admin/Owner)
  app.patch(
    '/payments/:id/void',
    { preHandler: [requireRole(['owner', 'admin'])] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const orgId = request.organization!.id;
      const userId = request.user!.id;

      const success = await repository.voidPaymentRecord(orgId, id, userId);
      if (!success) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Payment record not found' }
        });
      }

      return reply.send({
        success: true,
        message: 'Payment record voided successfully'
      });
    }
  );

  // ==========================================
  // 5. Budgets Endpoints
  // ==========================================

  // GET /api/finance/budgets — List operational budgets with actuals
  app.get('/budgets', async (request: FastifyRequest, reply: FastifyReply) => {
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

    const orgId = request.organization!.id;
    const budgets = await repository.listBudgets(orgId, queryResult.data);
    return reply.send(budgets);
  });

  // POST /api/finance/budgets — Create budget (Admin/Owner)
  app.post(
    '/budgets',
    { preHandler: [requireRole(['owner', 'admin'])] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parseResult = CreateBudgetInputSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid budget payload',
            details: parseResult.error.format()
          }
        });
      }

      const orgId = request.organization!.id;
      const userId = request.user!.id;

      try {
        const budget = await repository.createBudget(orgId, userId, parseResult.data);
        return reply.status(201).send({
          success: true,
          data: budget
        });
      } catch (err: any) {
        return reply.status(400).send({
          success: false,
          error: { code: 'BUDGET_CREATE_FAILED', message: err.message }
        });
      }
    }
  );

  // GET /api/finance/budgets/:id — Budget detail with actual spending
  app.get(
    '/budgets/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;
      const orgId = request.organization!.id;

      const budget = await repository.getBudgetById(orgId, id);
      if (!budget) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Budget not found' }
        });
      }

      return reply.send({
        success: true,
        data: budget
      });
    }
  );

  // PATCH /api/finance/budgets/:id — Update budget
  app.patch(
    '/budgets/:id',
    { preHandler: [requireRole(['owner', 'admin'])] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const parseResult = UpdateBudgetInputSchema.safeParse(request.body);
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

      const orgId = request.organization!.id;
      const userId = request.user!.id;

      const updated = await repository.updateBudget(orgId, id, parseResult.data, userId);
      if (!updated) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Budget not found' }
        });
      }

      return reply.send({
        success: true,
        data: updated
      });
    }
  );

  // DELETE /api/finance/budgets/:id — Delete budget
  app.delete(
    '/budgets/:id',
    { preHandler: [requireRole(['owner', 'admin'])] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const orgId = request.organization!.id;
      const userId = request.user!.id;

      const success = await repository.deleteBudget(orgId, id, userId);
      if (!success) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Budget not found' }
        });
      }

      return reply.send({
        success: true,
        message: 'Budget deleted successfully'
      });
    }
  );

  // ==========================================
  // 6. Financial Summary & Reports Endpoints
  // ==========================================

  // GET /api/finance/summary — Reconciled operational financial summary
  app.get('/summary', async (request: FastifyRequest, reply: FastifyReply) => {
    const { startDate, endDate, currency } = request.query as Record<string, string | undefined>;
    const orgId = request.organization!.id;

    const summary = await repository.getFinancialSummary(orgId, {
      startDate,
      endDate,
      currency
    });

    return reply.send({
      success: true,
      data: summary
    });
  });
}
