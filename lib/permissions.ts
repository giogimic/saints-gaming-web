import prisma from '@/lib/prisma';

export enum UserRole {
  ADMIN = "admin",
  MODERATOR = "moderator",
  USER = "user",
}

// Define the role hierarchy (higher number = higher authority)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.ADMIN]: 3,
  [UserRole.MODERATOR]: 2,
  [UserRole.USER]: 1,
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
    'view:hidden',
    'manage:tags',
    'tag:threads',
    'tag:own_threads',
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
    'view:hidden',
    'manage:tags',
    'tag:threads',
    'tag:own_threads',
  ],
  [UserRole.USER]: [
    'view:forum',
    'create:post',
    'edit:own-post',
    'delete:own-post',
    'vote:post',
    'tag:own_threads',
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
  | 'manage:content'
  | 'view:hidden'
  | 'manage:tags'
  | 'tag:threads'
  | 'tag:own_threads';

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(userRole: string | undefined, permission: Permission): boolean {
  if (!userRole) return false;
  const role = userRole as UserRole;
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
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
    slug: 'general',
    description: 'General discussions about gaming and community',
    order: 1,
    isDefault: true
  },
  {
    id: 'ark-ascended',
    name: 'ARK: Survival Ascended Server',
    slug: 'ark-ascended',
    description: 'Discussions about our ARK: Survival Ascended server',
    order: 2,
    isDefault: true
  },
  {
    id: 'minecraft',
    name: 'Minecraft Server',
    slug: 'minecraft',
    description: 'Discussions about our Minecraft server',
    order: 3,
    isDefault: true
  },
  {
    id: 'support',
    name: 'Support',
    slug: 'support',
    description: 'Get help with technical issues or server problems',
    order: 4,
    isDefault: true
  },
  {
    id: 'spam',
    name: 'Spam',
    slug: 'spam',
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

export const PERMISSIONS: Record<Permission, string> = {
  'view:forum': 'View forum content',
  'create:post': 'Create new posts',
  'edit:own-post': 'Edit own posts',
  'delete:own-post': 'Delete own posts',
  'vote:post': 'Vote on posts',
  'edit:page': 'Edit page content',
  'manage:categories': 'Manage forum categories',
  'manage:users': 'Manage user accounts',
  'manage:roles': 'Manage user roles',
  'manage:settings': 'Manage site settings',
  'edit:posts': 'Edit any post',
  'delete:posts': 'Delete any post',
  'edit:comments': 'Edit any comment',
  'delete:comments': 'Delete any comment',
  'manage:content': 'Manage all content',
  'view:hidden': 'View hidden content',
  'manage:tags': 'Manage forum tags',
  'tag:threads': 'Tag any thread',
  'tag:own_threads': 'Tag own threads',
};

export const canEditContent = (userRole: string | undefined): boolean => {
  return hasPermission(userRole, 'edit:page');
};

export const canManageUsers = (userRole: string | undefined): boolean => {
  return hasPermission(userRole, 'manage:users');
};

export const canManageSettings = (userRole: string | undefined): boolean => {
  return hasPermission(userRole, 'manage:settings');
}; 