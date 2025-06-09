import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Gift, Coins } from "lucide-react";

interface StoreSectionProps {
  user: {
    id: string;
    name: string;
    role: string;
  };
}

export function StoreSection({ user }: StoreSectionProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Store & Rewards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Button variant="outline" className="h-auto py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">Store</span>
                  <span className="text-xs text-muted-foreground">
                    Browse items
                  </span>
                </div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto py-4">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">Rewards</span>
                  <span className="text-xs text-muted-foreground">
                    Claim prizes
                  </span>
                </div>
              </div>
            </Button>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-yellow-500" />
              <div>
                <h4 className="font-medium">Your Balance</h4>
                <p className="text-sm text-muted-foreground">
                  View and manage your points
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 