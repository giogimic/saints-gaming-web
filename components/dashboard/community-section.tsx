import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, Trophy } from "lucide-react";

interface CommunitySectionProps {
  user: {
    id: string;
    name: string;
    role: string;
  };
}

export function CommunitySection({ user }: CommunitySectionProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Community</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Button variant="outline" className="h-auto py-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">Discord</span>
                  <span className="text-xs text-muted-foreground">
                    Join our community
                  </span>
                </div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto py-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">Teams</span>
                  <span className="text-xs text-muted-foreground">
                    Find your squad
                  </span>
                </div>
              </div>
            </Button>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <h4 className="font-medium">Community Challenges</h4>
                <p className="text-sm text-muted-foreground">
                  Participate in weekly challenges and earn rewards
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 