import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { checkPermission } from "@/lib/permissions"
import { AdminLayoutClient } from "../components/admin/admin-layout"
import { User } from "@prisma/client"

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/api/auth/signin")
  }

  const hasPermission = await checkPermission(session.user.id, "manage:content")

  if (!hasPermission) {
    redirect("/")
  }

  // Ensure user object has all required fields
  const user: Pick<User, "id" | "name" | "email" | "image" | "role"> = {
    id: session.user.id,
    name: session.user.name || null,
    email: session.user.email || null,
    image: session.user.image || null,
    role: session.user.role
  }

  return <AdminLayoutClient user={user}>{children}</AdminLayoutClient>
} 