import { z } from 'zod';

export const planSchema = z.enum(['FREE', 'PREMIUM']);

export const entitlementSchema = z.object({
  userId: z.string(),
  movieId: z.string(),
  hasEntitlement: z.boolean()
});

export type Entitlement = z.infer<typeof entitlementSchema>;
