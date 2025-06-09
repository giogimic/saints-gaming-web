import { UserRole } from './types';

const roleHierarchy: Record<UserRole, number> = {
  [UserRole.USER]: 0,
  [UserRole.MEMBER]: 1,
  [UserRole.MODERATOR]: 2,
  [UserRole.ADMIN]: 3,
};

const rolePermissions: Record<UserRole, string[]> = {
  [UserRole.USER]: [
    'read:posts',
    'create:posts',
    'update:own:posts',
    'delete:own:posts',
  ],
  [UserRole.MEMBER]: [
    'read:posts',
    'create:posts',
    'update:own:posts',
    'delete:own:posts',
    'create:replies',
    'update:own:replies',
    'delete:own:replies',
  ],
  [UserRole.MODERATOR]: [
    'read:posts',
    'create:posts',
    'update:own:posts',
    'delete:own:posts',
    'create:replies',
    'update:own:replies',
    'delete:own:replies',
    'manage:posts',
    'manage:replies',
    'manage:categories',
  ],
  [UserRole.ADMIN]: [
    'read:posts',
    'create:posts',
    'update:own:posts',
    'delete:own:posts',
    'create:replies',
    'update:own:replies',
    'delete:own:replies',
    'manage:posts',
    'manage:replies',
    'manage:categories',
    'manage:users',
    'manage:settings',
  ],
};

export function hasPermission(userRole: UserRole, permission: string): boolean {
  const userPermissions = rolePermissions[userRole] || [];
  return userPermissions.includes(permission);
}

export function hasHigherRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function hasAnyPermission(role: UserRole, permissions: string[]): boolean {
  return permissions.some((perm) => hasPermission(role, perm));
}

export function canEditUser(currentRole: UserRole, targetRole: UserRole): boolean {
  // Admins can edit anyone, moderators can edit users, users cannot edit others
  if (currentRole === 'admin') return true;
  if (currentRole === 'moderator' && targetRole === 'user') return true;
  return false;
} 