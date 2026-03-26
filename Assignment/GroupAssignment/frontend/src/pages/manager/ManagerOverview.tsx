import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Grid2X2, Tag, ChevronDown } from "lucide-react";

export default function ManagerOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manager Overview</h1>
        <p className="text-muted-foreground">Branch - Branch Operations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground mt-1">
              Loading... vs yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Out of 0 total staff
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Table Status</CardTitle>
            <Grid2X2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0/0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tables occupied
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Promos</CardTitle>
            <Tag className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Running promotions
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card className="glass-card border-border/60 min-h-[300px] flex flex-col">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Table Status</CardTitle>
              <p className="text-sm text-muted-foreground">Current table availability by floor</p>
            </div>
            <div className="flex items-center gap-2 border border-border/50 rounded-md px-3 py-1.5 text-sm cursor-pointer hover:bg-muted/50 transition-colors">
              <span>All Areas</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            No tables found
          </CardContent>
        </Card>

        <Card className="glass-card border-border/60 min-h-[300px]">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <p className="text-sm text-muted-foreground">Today's performance</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                <span className="font-medium text-sm">Total Orders</span>
                <span className="font-bold text-lg">0</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                <span className="font-medium text-sm">Average Order Value</span>
                <span className="font-bold text-lg">$0.00</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                <span className="font-medium text-sm">Total Menu Items Sold</span>
                <span className="font-bold text-lg">0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
