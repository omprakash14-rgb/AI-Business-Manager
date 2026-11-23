import { z } from 'zod';

// ==========================================
// 1. Pagination, Search, Sorting Conventions
// ==========================================

export const SortOrderSchema = z.enum(['asc', 'desc']);
export type SortOrder = z.infer<typeof SortOrderSchema>;

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  sortBy: z.string().trim().optional(),
  sortOrder: SortOrderSchema.default('desc')
});
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export const PaginationMetaSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  totalItems: z.number().int().min(0),
  totalPages: z.number().int().min(0),
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean()
});
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

// ==========================================
// 2. Currency & Money Conventions
// ==========================================

export const CurrencyCodeSchema = z.enum([
  'USD',
  'EUR',
  'GBP',
  'CAD',
  'AUD',
  'JPY',
  'INR',
  'CHF',
  'CNY',
  'SGD',
  'AED'
]);
export type CurrencyCode = z.infer<typeof CurrencyCodeSchema>;

export const MoneyValueSchema = z.object({
  amount: z.string().regex(/^-?\d+(\.\d{1,4})?$/, { message: 'Must be a valid fixed-precision decimal string' }),
  currency: CurrencyCodeSchema.default('USD')
});
export type MoneyValue = z.infer<typeof MoneyValueSchema>;

// ==========================================
// 3. File Metadata & Storage Contracts
// ==========================================

export const FileVisibilitySchema = z.enum(['private', 'organization']);
export type FileVisibility = z.infer<typeof FileVisibilitySchema>;

export const CreateFileMetadataInputSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  fileSize: z.number().int().min(1).max(104857600), // Max 100MB
  mimeType: z.string().trim().min(3).max(100),
  visibility: FileVisibilitySchema.default('organization')
});
export type CreateFileMetadataInput = z.infer<typeof CreateFileMetadataInputSchema>;

export interface FileMetadataDto {
  id: string;
  organizationId: string;
  uploadedById: string;
  fileName: string;
  fileKey: string;
  fileSize: number;
  mimeType: string;
  storageProvider: string;
  visibility: FileVisibility;
  downloadUrl?: string;
  createdAt: string;
  updatedAt: string;
  uploaderName?: string;
}

// ==========================================
// 4. Notifications Contracts
// ==========================================

export const NotificationTypeSchema = z.enum(['system', 'activity', 'mention', 'reminder', 'security']);
export type NotificationType = z.infer<typeof NotificationTypeSchema>;

export const CreateNotificationInputSchema = z.object({
  userId: z.string().min(1),
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(2000),
  type: NotificationTypeSchema.default('system'),
  link: z.string().trim().max(500).optional()
});
export type CreateNotificationInput = z.infer<typeof CreateNotificationInputSchema>;

export interface NotificationDto {
  id: string;
  organizationId: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  link?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

// ==========================================
// 5. Activity History & Audit Contracts
// ==========================================

export interface ActivityEventDto {
  id: string;
  organizationId: string;
  actorId: string | null;
  actorName: string;
  resourceType: string;
  resourceId: string;
  action: string;
  description: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuditLogDto {
  id: string;
  organizationId: string | null;
  userId: string | null;
  userEmail?: string | null;
  action: string;
  metadata?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}
