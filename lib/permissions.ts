import { prisma } from '@/lib/prisma';

export enum UserRole {
  ADMIN = "admin",
  MODERATOR = "moderator",
  MEMBER = "member",
}

// Define the role hierarchy (higher number = higher authority)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.ADMIN]: 3,
  [UserRole.MODERATOR]: 2,
  [UserRole.MEMBER]: 1,
};

// Define permissions for each role
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    'view:forum',
    'create:post',
    'edit:own-post',
    'delete:own-post',
    'vote:post',
    'edit:page',
    'manage:categories',
    'manage:users',
    'manage:roles',
    'manage:settings',
    'edit:posts',
    'delete:posts',
    'edit:comments',
    'delete:comments',
    'manage:content',
  ],
  [UserRole.MODERATOR]: [
    'view:forum',
    'create:post',
    'edit:own-post',
    'delete:own-post',
    'vote:post',
    'edit:page',
    'manage:categories',
    'edit:posts',
    'delete:posts',
    'edit:comments',
    'delete:comments',
    'manage:content',
  ],
  [UserRole.MEMBER]: [
    'view:forum',
    'create:post',
    'edit:own-post',
    'delete:own-post',
    'vote:post',
  ],
};

export type Permission =
  | 'view:forum'
  | 'create:post'
  | 'edit:own-post'
  | 'delete:own-post'
  | 'vote:post'
  | 'edit:page'
  | 'manage:categories'
  | 'manage:users'
  | 'manage:roles'
  | 'manage:settings'
  | 'edit:posts'
  | 'delete:posts'
  | 'edit:comments'
  | 'delete:comments'
  | 'manage:content';

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  if (!userRole || !permission) return false;

  // Admin has all permissions
  if (userRole === UserRole.ADMIN) return true;

  // Check if the permission is in the role's permissions
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
}

/**
 * Check if a user role has a higher or equal role in the hierarchy
 */
export function hasHigherRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if a user can edit another user based on their roles
 */
export function canEditUser(currentRole: UserRole, targetRole: UserRole): boolean {
  return hasHigherRole(currentRole, targetRole);
}

/**
 * Check if a user can edit their own content
 */
export function canEditOwnContent(userRole: UserRole, contentType: string): boolean {
  return hasPermission(userRole, `edit:own-${contentType}` as Permission);
}

export const DEFAULT_CATEGORIES = [
  {
    id: 'general',
    name: 'General',
    description: 'General discussions about gaming and community',
    order: 1,
    isDefault: true
  },
  {
    id: 'ark-ascended',
    name: 'ARK: Survival Ascended Server',
    description: 'Discussions about our ARK: Survival Ascended server',
    order: 2,
    isDefault: true
  },
  {
    id: 'minecraft',
    name: 'Minecraft Server',
    description: 'Discussions about our Minecraft server',
    order: 3,
    isDefault: true
  },
  {
    id: 'support',
    name: 'Support',
    description: 'Get help with technical issues or server problems',
    order: 4,
    isDefault: true
  },
  {
    id: 'spam',
    name: 'Spam',
    description: 'Off-topic discussions and fun content',
    order: 5,
    isDefault: true
  }
] as const;

export const isAdmin = (role: UserRole): boolean => role === UserRole.ADMIN;
export const isModerator = (role: UserRole): boolean => role === UserRole.MODERATOR || role === UserRole.ADMIN;
export const isMember = (role: UserRole): boolean => true; // All roles are members 

export async function checkPermission(
  userId: string,
  permission: Permission
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    return false;
  }

  const permissions = ROLE_PERMISSIONS[user.role as UserRole] || [];
  return permissions.includes(permission);
}

export function getPermissionsForRole(role: string): Permission[] {
  return ROLE_PERMISSIONS[role as UserRole] || [];
} 