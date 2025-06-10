import { DefaultSession, DefaultUser } from "next-auth"
import { JWT } from "next-auth/jwt"
import { UserRole } from "@/lib/permissions"

// Base types
export interface CustomUser extends DefaultUser {
  id: string
  role: UserRole
}

export interface CustomSession extends DefaultSession {
  user: CustomUser
}

// Type declarations
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  interface User {
    id: string
    role: UserRole
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
  }
}

// Type guards
export function isCustomUser(obj: any): obj is CustomUser {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.role === "string" &&
    Object.values(UserRole).includes(obj.role as UserRole)
  )
}

export function isCustomSession(obj: any): obj is CustomSession {
  return (
    obj &&
    typeof obj === "object" &&
    obj.user &&
    isCustomUser(obj.user)
  )
}

// Helper types
export type AuthUser = CustomUser
export type AuthSession = CustomSession

// Type utilities
export type WithRole<T> = T & { role: UserRole }
export type WithId<T> = T & { id: string }
export type WithUser<T> = T & { user: AuthUser } 