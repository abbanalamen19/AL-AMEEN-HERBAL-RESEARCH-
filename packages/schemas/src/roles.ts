import { z } from 'zod';

export const role = z.enum([
  'super_admin',
  'researcher',
  'practitioner',
  'contributor',
  'public',
]);
export type Role = z.infer<typeof role>;

/** Capabilities are `resource:action` strings checked across UI, BFF and rules. */
export const capability = z.enum([
  'content:read',
  'content:submit',
  'content:publish',
  'clinical:read',
  'formulation:use',
  'dataset:export',
  'ai:assistant',
  'users:manage',
  'audit:read',
]);
export type Capability = z.infer<typeof capability>;

export const ROLE_CAPABILITIES: Record<Role, Capability[]> = {
  super_admin: [
    'content:read',
    'content:submit',
    'content:publish',
    'clinical:read',
    'formulation:use',
    'dataset:export',
    'ai:assistant',
    'users:manage',
    'audit:read',
  ],
  researcher: [
    'content:read',
    'content:submit',
    'content:publish',
    'clinical:read',
    'formulation:use',
    'dataset:export',
    'ai:assistant',
  ],
  practitioner: ['content:read', 'content:submit', 'clinical:read', 'formulation:use', 'ai:assistant'],
  contributor: ['content:read', 'content:submit', 'ai:assistant'],
  public: ['content:read'],
};

export function can(userRole: Role, cap: Capability): boolean {
  return ROLE_CAPABILITIES[userRole].includes(cap);
}
