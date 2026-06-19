import { describe, expect, it } from 'vitest';
import { can } from './roles';

describe('RBAC capabilities', () => {
  it('grants super_admin user management', () => {
    expect(can('super_admin', 'users:manage')).toBe(true);
  });

  it('denies public users content submission', () => {
    expect(can('public', 'content:submit')).toBe(false);
  });

  it('lets researchers publish but not manage users', () => {
    expect(can('researcher', 'content:publish')).toBe(true);
    expect(can('researcher', 'users:manage')).toBe(false);
  });

  it('lets contributors use the AI assistant', () => {
    expect(can('contributor', 'ai:assistant')).toBe(true);
  });
});
