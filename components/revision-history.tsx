import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { UserRole } from '@/lib/permissions';

interface Revision {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
}

interface RevisionHistoryProps {
  entityId: string;
  type: 'page' | 'block';
  onRestore: () => void;
}

export function RevisionHistory({ entityId, type, onRestore }: RevisionHistoryProps) {
  const { data: session } = useSession();
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevisions();
  }, [entityId, type]);

  const fetchRevisions = async () => {
    try {
      const response = await fetch(`/api/admin/content/revisions?entityId=${entityId}&type=${type}`);
      if (!response.ok) throw new Error('Failed to fetch revisions');
      const data = await response.json();
      setRevisions(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load revision history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (revisionId: string) => {
    try {
      const response = await fetch('/api/admin/content/revisions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: revisionId }),
      });
      if (!response.ok) throw new Error('Failed to restore revision');
      toast({
        title: 'Success',
        description: 'Revision restored successfully',
      });
      onRestore();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to restore revision',
        variant: 'destructive',
      });
    }
  };

  if (!session?.user || ![UserRole.ADMIN, UserRole.MODERATOR].includes(session.user.role)) {
    return null;
  }

  if (loading) {
    return <div>Loading revision history...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revision History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {revisions.map((revision) => (
            <div key={revision.id} className="border p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">{revision.author.name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(revision.createdAt).toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRestore(revision.id)}
                >
                  Restore
                </Button>
              </div>
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: revision.content }} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 