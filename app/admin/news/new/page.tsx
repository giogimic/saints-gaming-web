import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-config";
import { checkPermission } from "@/lib/permissions";
import CreateNewsForm from "./create-news-form";

export default async function NewNewsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const canCreateNews = await checkPermission(session.user.id, "create:news");
  if (!canCreateNews) {
    redirect("/admin");
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Create News Article</h1>
      <CreateNewsForm />
    </div>
  );
} 