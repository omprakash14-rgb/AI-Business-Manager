import { z } from 'zod';

export const ApiErrorDetailSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional()
});

export type ApiErrorDetail = z.infer<typeof ApiErrorDetailSchema>;

export const ApiResponseEnvelopeSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: ApiErrorDetailSchema.optional(),
  timestamp: z.string()
});

export type ApiResponseEnvelope<T = unknown> = {
  success: boolean;
  data?: T;
  error?: ApiErrorDetail;
  timestamp: string;
};
