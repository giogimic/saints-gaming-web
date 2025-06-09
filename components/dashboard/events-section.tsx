import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Gamepad2, Trophy } from "lucide-react";

interface EventsSectionProps {
  user: {
    id: string;
    name: string;
    role: string;
  };
}

export function EventsSection({ user }: EventsSectionProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Events & Challenges</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Button variant="outline" className="h-auto py-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">Upcoming Events</span>
                  <span className="text-xs text-muted-foreground">
                    View schedule
                  </span>
                </div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto py-4">
              <div className="flex items-center gap-2">
                <Gamepad2 className="h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">Tournaments</span>
                  <span className="text-xs text-muted-foreground">
                    Join competitions
                  </span>
                </div>
              </div>
            </Button>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <h4 className="font-medium">Your Achievements</h4>
                <p className="text-sm text-muted-foreground">
                  Track your progress and rewards
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 