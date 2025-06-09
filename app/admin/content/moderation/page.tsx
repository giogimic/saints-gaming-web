"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRole } from "@/lib/permissions";
import { AlertTriangle, Check, X, Flag, MessageSquare, Image } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ReportedContent {
  id: string;
  type: 'post' | 'comment' | 'image';
  content: string;
  reportedBy: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'removed';
  createdAt: string;
}

export default function ContentModerationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reportedContent, setReportedContent] = useState<ReportedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<ReportedContent | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role !== UserRole.ADMIN) {
      router.push('/dashboard');
    } else {
      fetchReportedContent();
    }
  }, [session, status, router]);

  const fetchReportedContent = async () => {
    try {
      const response = await fetch('/api/admin/moderation/reports');
      if (!response.ok) throw new Error('Failed to fetch reported content');
      const data = await response.json();
      setReportedContent(data);
    } catch (error) {
      console.error('Error fetching reported content:', error);
      toast({
        title: "Error",
        description: "Failed to load reported content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModerationAction = async (contentId: string, action: 'approve' | 'remove') => {
    try {
      const response = await fetch(`/api/admin/moderation/reports/${contentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) throw new Error('Failed to process moderation action');

      setReportedContent(reportedContent.map(content =>
        content.id === contentId
          ? { ...content, status: action === 'approve' ? 'reviewed' : 'removed' }
          : content
      ));

      toast({
        title: "Success",
        description: `Content ${action === 'approve' ? 'approved' : 'removed'} successfully`,
      });
    } catch (error) {
      console.error('Error processing moderation action:', error);
      toast({
        title: "Error",
        description: "Failed to process moderation action",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <AlertTriangle className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Content Moderation</h1>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
          <TabsTrigger value="removed">Removed</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Reports</CardTitle>
              <CardDescription>Review and take action on reported content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportedContent
                  .filter(content => content.status === 'pending')
                  .map((content) => (
                    <div key={content.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {content.type === 'post' && <MessageSquare className="h-4 w-4" />}
                          {content.type === 'image' && <Image className="h-4 w-4" />}
                          <span className="font-medium">
                            {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            Reported by {content.reportedBy}
                          </span>
                        </div>
                        <p className="text-sm mb-2">{content.content}</p>
                        <div className="flex items-center gap-2">
                          <Flag className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-muted-foreground">{content.reason}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleModerationAction(content.id, 'approve')}
                          className="text-green-600"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleModerationAction(content.id, 'remove')}
                          className="text-red-600"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviewed">
          <Card>
            <CardHeader>
              <CardTitle>Reviewed Content</CardTitle>
              <CardDescription>Content that has been reviewed and approved</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportedContent
                  .filter(content => content.status === 'reviewed')
                  .map((content) => (
                    <div key={content.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {content.type === 'post' && <MessageSquare className="h-4 w-4" />}
                          {content.type === 'image' && <Image className="h-4 w-4" />}
                          <span className="font-medium">
                            {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            Reviewed by {content.reportedBy}
                          </span>
                        </div>
                        <p className="text-sm">{content.content}</p>
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="removed">
          <Card>
            <CardHeader>
              <CardTitle>Removed Content</CardTitle>
              <CardDescription>Content that has been removed due to violations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportedContent
                  .filter(content => content.status === 'removed')
                  .map((content) => (
                    <div key={content.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {content.type === 'post' && <MessageSquare className="h-4 w-4" />}
                          {content.type === 'image' && <Image className="h-4 w-4" />}
                          <span className="font-medium">
                            {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            Removed by {content.reportedBy}
                          </span>
                        </div>
                        <p className="text-sm">{content.content}</p>
                      </div>
                      <div className="flex items-center">
                        <X className="h-4 w-4 text-red-500" />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 