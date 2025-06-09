import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, Trophy, Settings } from "lucide-react";

interface GameIntegrationsProps {
  user: {
    id: string;
    name: string;
    role: string;
  };
}

export function GameIntegrations({ user }: GameIntegrationsProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Game Integrations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Button variant="outline" className="h-auto py-4">
              <div className="flex items-center gap-2">
                <Gamepad2 className="h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">Connected Games</span>
                  <span className="text-xs text-muted-foreground">
                    Manage connections
                  </span>
                </div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto py-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">Stats & Progress</span>
                  <span className="text-xs text-muted-foreground">
                    View achievements
                  </span>
                </div>
              </div>
            </Button>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-500" />
              <div>
                <h4 className="font-medium">Integration Settings</h4>
                <p className="text-sm text-muted-foreground">
                  Configure game connections and preferences
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 