import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Target } from "lucide-react";

interface PerformanceSectionProps {
  user: {
    id: string;
    name: string;
    role: string;
  };
}

export function PerformanceSection({ user }: PerformanceSectionProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Button variant="outline" className="h-auto py-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">Statistics</span>
                  <span className="text-xs text-muted-foreground">
                    View detailed stats
                  </span>
                </div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto py-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-xs text-muted-foreground">
                    Track improvement
                  </span>
                </div>
              </div>
            </Button>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <h4 className="font-medium">Goals & Milestones</h4>
                <p className="text-sm text-muted-foreground">
                  Set and track your gaming goals
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 