import { z } from 'zod';
import { PaginationQuerySchema, PaginatedResult } from './platform.js';

// ==========================================
// 1. Financial Categories
// ==========================================

export const FinancialCategoryTypeSchema = z.enum(['income', 'expense']);
export type FinancialCategoryType = z.infer<typeof FinancialCategoryTypeSchema>;

export const CreateFinancialCategoryInputSchema = z.object({
  name: z.string().trim().min(1, 'Category name is required').max(100),
  type: FinancialCategoryTypeSchema,
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color code').optional().default('#64748b'),
  description: z.string().trim().max(255).optional()
});
export type CreateFinancialCategoryInput = z.infer<typeof CreateFinancialCategoryInputSchema>;

export const UpdateFinancialCategoryInputSchema = CreateFinancialCategoryInputSchema.partial();
export type UpdateFinancialCategoryInput = z.infer<typeof UpdateFinancialCategoryInputSchema>;

export interface FinancialCategoryDto {
  id: string;
  organizationId: string;
  name: string;
  type: FinancialCategoryType;
  color: string;
  description?: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 2. Financial Transactions (Income & Expenses)
// ==========================================

export const TransactionTypeSchema = z.enum(['income', 'expense']);
export type TransactionType = z.infer<typeof TransactionTypeSchema>;

export const TransactionStatusSchema = z.enum(['pending', 'completed', 'cancelled']);
export type TransactionStatus = z.infer<typeof TransactionStatusSchema>;

export const PaymentMethodSchema = z.enum([
  'bank_transfer',
  'credit_card',
  'cash',
  'check',
  'other'
]);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export const CreateTransactionInputSchema = z.object({
  type: TransactionTypeSchema,
  categoryId: z.string().uuid('Valid category is required'),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid decimal amount (e.g. 150.00)'),
  currency: z.string().length(3).default('USD'),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  description: z.string().trim().min(1, 'Description is required').max(255),
  counterparty: z.string().trim().max(255).optional(),
  reference: z.string().trim().max(100).optional(),
  paymentMethod: PaymentMethodSchema.default('bank_transfer'),
  status: TransactionStatusSchema.default('completed'),
  accountId: z.string().uuid().optional().nullable(),
  invoiceId: z.string().uuid().optional().nullable(),
  notes: z.string().trim().max(1000).optional()
});
export type CreateTransactionInput = z.infer<typeof CreateTransactionInputSchema>;

export const UpdateTransactionInputSchema = CreateTransactionInputSchema.partial();
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionInputSchema>;

export interface FinancialTransactionDto {
  id: string;
  organizationId: string;
  type: TransactionType;
  categoryId: string;
  categoryName?: string | null;
  categoryColor?: string | null;
  amount: string;
  currency: string;
  date: string;
  description: string;
  counterparty?: string | null;
  reference?: string | null;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  accountId?: string | null;
  accountName?: string | null;
  invoiceId?: string | null;
  invoiceNumber?: string | null;
  notes?: string | null;
  recordedByUserId: string;
  recordedByName?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 3. Invoices & Line Items
// ==========================================

export const InvoiceStatusSchema = z.enum([
  'draft',
  'issued',
  'partially_paid',
  'paid',
  'overdue',
  'void'
]);
export type InvoiceStatus = z.infer<typeof InvoiceStatusSchema>;

export const InvoiceLineItemInputSchema = z.object({
  description: z.string().trim().min(1, 'Description is required').max(255),
  quantity: z.number().min(0.01, 'Quantity must be greater than zero').default(1),
  unitPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid decimal unit price')
});
export type InvoiceLineItemInput = z.infer<typeof InvoiceLineItemInputSchema>;

export const CreateInvoiceInputSchema = z.object({
  accountId: z.string().uuid('Customer account is required'),
  contactId: z.string().uuid().optional().nullable(),
  opportunityId: z.string().uuid().optional().nullable(),
  quotationId: z.string().uuid().optional().nullable(),
  issueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  dueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  currency: z.string().length(3).default('USD'),
  taxPercent: z.number().min(0).max(100).default(0),
  discountAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid discount decimal').default('0.00'),
  notes: z.string().trim().max(2000).optional(),
  terms: z.string().trim().max(2000).optional(),
  items: z.array(InvoiceLineItemInputSchema).min(1, 'At least one line item is required')
});
export type CreateInvoiceInput = z.infer<typeof CreateInvoiceInputSchema>;

export const UpdateInvoiceInputSchema = CreateInvoiceInputSchema.partial().extend({
  status: InvoiceStatusSchema.optional()
});
export type UpdateInvoiceInput = z.infer<typeof UpdateInvoiceInputSchema>;

export interface InvoiceLineItemDto {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  sortOrder: number;
}

export interface InvoiceDto {
  id: string;
  organizationId: string;
  invoiceNumber: string;
  accountId: string;
  accountName?: string | null;
  contactId?: string | null;
  contactName?: string | null;
  opportunityId?: string | null;
  opportunityName?: string | null;
  quotationId?: string | null;
  quotationNumber?: string | null;
  issueDate: string;
  dueDate: string;
  currency: string;
  subtotal: string;
  taxPercent: number;
  taxAmount: string;
  discountAmount: string;
  totalAmount: string;
  paidAmount: string;
  balanceDue: string;
  status: InvoiceStatus;
  isOverdue: boolean;
  notes?: string | null;
  terms?: string | null;
  createdByUserId: string;
  createdByName?: string | null;
  items: InvoiceLineItemDto[];
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 4. Payment Records
// ==========================================

export const CreatePaymentInputSchema = z.object({
  invoiceId: z.string().uuid().optional().nullable(),
  accountId: z.string().uuid().optional().nullable(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid decimal amount (e.g. 500.00)'),
  currency: z.string().length(3).default('USD'),
  paymentDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  paymentMethod: PaymentMethodSchema.default('bank_transfer'),
  reference: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(1000).optional()
});
export type CreatePaymentInput = z.infer<typeof CreatePaymentInputSchema>;

export interface PaymentRecordDto {
  id: string;
  organizationId: string;
  paymentNumber: string;
  invoiceId?: string | null;
  invoiceNumber?: string | null;
  accountId?: string | null;
  accountName?: string | null;
  amount: string;
  currency: string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  reference?: string | null;
  notes?: string | null;
  status: 'completed' | 'void';
  recordedByUserId: string;
  recordedByName?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 5. Budgets
// ==========================================

export const BudgetPeriodSchema = z.enum(['monthly', 'quarterly', 'yearly']);
export type BudgetPeriod = z.infer<typeof BudgetPeriodSchema>;

export const CreateBudgetInputSchema = z.object({
  name: z.string().trim().min(1, 'Budget name is required').max(100),
  categoryId: z.string().uuid().optional().nullable(),
  period: BudgetPeriodSchema.default('quarterly'),
  startDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  endDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  budgetAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid decimal amount (e.g. 10000.00)'),
  currency: z.string().length(3).default('USD'),
  description: z.string().trim().max(500).optional()
});
export type CreateBudgetInput = z.infer<typeof CreateBudgetInputSchema>;

export const UpdateBudgetInputSchema = CreateBudgetInputSchema.partial();
export type UpdateBudgetInput = z.infer<typeof UpdateBudgetInputSchema>;

export interface BudgetDto {
  id: string;
  organizationId: string;
  name: string;
  categoryId?: string | null;
  categoryName?: string | null;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  budgetAmount: string;
  actualSpent: string;
  remainingAmount: string;
  utilizationPercent: number;
  status: 'on_track' | 'warning' | 'exceeded';
  currency: string;
  description?: string | null;
  createdByUserId: string;
  createdByName?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 6. Financial Summaries & Reports
// ==========================================

export interface CategoryBreakdownDto {
  categoryId: string;
  categoryName: string;
  color: string;
  totalAmount: string;
  transactionCount: number;
  percentageOfTotal: number;
}

export interface MonthlyCashFlowDto {
  month: string; // YYYY-MM
  income: string;
  expense: string;
  net: string;
}

export interface FinancialSummaryDto {
  totalIncome: string;
  totalExpenses: string;
  netOperatingIncome: string;
  totalReceivables: string; // Unpaid balance on issued/overdue invoices
  totalPaidInvoices: string;
  overdueInvoicesCount: number;
  overdueInvoicesAmount: string;
  currency: string;
  expensesByCategory: CategoryBreakdownDto[];
  incomeByCategory: CategoryBreakdownDto[];
  monthlyCashFlow: MonthlyCashFlowDto[];
  budgetUtilizationSummary: {
    totalBudgeted: string;
    totalActualSpent: string;
    averageUtilizationPercent: number;
  };
}
