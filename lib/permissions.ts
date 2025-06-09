export enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  MEMBER = 'member'
}

// Define the role hierarchy (higher number = higher authority)
const roleHierarchy: Record<UserRole, number> = {
  [UserRole.ADMIN]: 3,
  [UserRole.MODERATOR]: 2,
  [UserRole.MEMBER]: 1,
};

// Define permissions for each role
const rolePermissions: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: [
    'view:forum',
    'create:post',
    'edit:own-post',
    'delete:own-post',
    'vote:post',
    'manage:posts',
    'manage:categories',
    'manage:users',
    'manage:roles',
    'manage:settings',
  ],
  [UserRole.MODERATOR]: [
    'view:forum',
    'create:post',
    'edit:own-post',
    'delete:own-post',
    'vote:post',
    'manage:posts',
    'manage:categories',
    'manage:users',
  ],
  [UserRole.MEMBER]: [
    'view:forum',
    'create:post',
    'edit:own-post',
    'delete:own-post',
    'vote:post',
  ],
};

export const DEFAULT_ADMIN_EMAIL = 'matthewatoope@gmail.com';

export const PERMISSIONS = {
  'manage:users': [UserRole.ADMIN],
  'manage:categories': [UserRole.ADMIN, UserRole.MODERATOR],
  'manage:posts': [UserRole.ADMIN, UserRole.MODERATOR],
  'create:post': [UserRole.ADMIN, UserRole.MODERATOR, UserRole.MEMBER],
  'delete:own_post': [UserRole.ADMIN, UserRole.MODERATOR, UserRole.MEMBER],
  'edit:own_post': [UserRole.ADMIN, UserRole.MODERATOR, UserRole.MEMBER],
  'delete:any_post': [UserRole.ADMIN, UserRole.MODERATOR],
  'edit:any_post': [UserRole.ADMIN, UserRole.MODERATOR],
} as const;

export type Permission = keyof typeof PERMISSIONS;

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(userRole: UserRole, permission: Permission | string): boolean {
  if (!userRole || !permission) return false;

  // Always grant admin permissions to the default admin email
  if (userRole === UserRole.ADMIN) return true;

  // Check if the permission is in our defined permissions
  if (permission in PERMISSIONS) {
    const allowedRoles = PERMISSIONS[permission as Permission];
    return allowedRoles.includes(userRole);
  }

  // For dynamic permissions (like edit:own-post)
  const [action, scope] = permission.split(':');
  if (action === 'edit' && scope?.startsWith('own-')) {
    return [UserRole.ADMIN, UserRole.MODERATOR, UserRole.MEMBER].includes(userRole);
  }

  return false;
}

/**
 * Check if a user role has a higher or equal role in the hierarchy
 */
export function hasHigherRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
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
  return hasPermission(userRole, `edit:own-${contentType}`);
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