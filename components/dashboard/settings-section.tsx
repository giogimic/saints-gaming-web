import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Bell, Shield } from "lucide-react";

interface SettingsSectionProps {
  user: {
    id: string;
    name: string;
    role: string;
  };
}

export function SettingsSection({ user }: SettingsSectionProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Button variant="outline" className="h-auto py-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">Preferences</span>
                  <span className="text-xs text-muted-foreground">
                    Customize experience
                  </span>
                </div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto py-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">Notifications</span>
                  <span className="text-xs text-muted-foreground">
                    Manage alerts
                  </span>
                </div>
              </div>
            </Button>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <div>
                <h4 className="font-medium">Privacy & Security</h4>
                <p className="text-sm text-muted-foreground">
                  Manage account settings
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 