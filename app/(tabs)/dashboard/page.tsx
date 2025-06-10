import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import prisma from "@/lib/prisma";
import { UserProfile } from "@/components/dashboard/user-profile";
import { CommunitySection } from "@/components/dashboard/community-section";
import { EventsSection } from "@/components/dashboard/events-section";
import { GameIntegrations } from "@/components/dashboard/game-integrations";
import { PerformanceSection } from "@/components/dashboard/performance-section";
import { StoreSection } from "@/components/dashboard/store-section";
import { SettingsSection } from "@/components/dashboard/settings-section";

async function getUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      threads: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      },
      posts: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          thread: {
            include: {
              category: {
                select: {
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      },
      comments: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          post: {
            include: {
              thread: {
                include: {
                  category: {
                    select: {
                      name: true,
                      slug: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) return null;

  const stats = {
    totalThreads: await prisma.thread.count({ where: { authorId: userId } }),
    totalPosts: await prisma.post.count({ where: { authorId: userId } }),
    totalComments: await prisma.comment.count({ where: { authorId: userId } }),
    joinDate: user.createdAt,
    lastActive: user.lastLogin || user.updatedAt,
  };

  return { user, stats };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return <div>Please sign in to view your dashboard.</div>;
  }

  const data = await getUserData(session.user.id);

  if (!data) {
    return <div>User not found.</div>;
  }

  const { user, stats } = data;
  // Ensure name and email are always strings for dashboard section components
  const safeUser: { id: string; name: string; role: string; email: string } = {
    id: user.id,
    name: user.name || "User",
    role: String(user.role),
    email: user.email || "",
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <UserProfile user={{ ...user, name: safeUser.name }} stats={stats} />
        <CommunitySection user={safeUser} />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <EventsSection user={safeUser} />
        <GameIntegrations user={safeUser} />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <PerformanceSection user={safeUser} />
        <StoreSection user={safeUser} />
      </div>
      <SettingsSection user={safeUser} />
    </div>
  );
} 