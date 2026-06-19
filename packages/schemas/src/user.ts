import { z } from 'zod';
import { locale } from './common';
import { role } from './roles';

export const userProfile = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string().default(''),
  photoURL: z.string().url().optional(),
  role: role.default('public'),
  locale: locale.default('ha'),
  organization: z.string().optional(),
  reputation: z.number().int().default(0),
  isVerified: z.boolean().default(false),
  disabled: z.boolean().default(false),
  createdAt: z.string().datetime(),
  lastLoginAt: z.string().datetime().optional(),
});
export type UserProfile = z.infer<typeof userProfile>;

export const updateRoleInput = z.object({
  role,
});
export type UpdateRoleInput = z.infer<typeof updateRoleInput>;
