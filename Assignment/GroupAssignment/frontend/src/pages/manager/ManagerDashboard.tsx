import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBranchContext } from "@/hooks/useBranchContext";
import { useAuthStore } from "@/stores/authStore";
import { useTablesByBranch } from "@/hooks/queries/useTableQueries";
import { useQuery } from "@tanstack/react-query";
import { managerApi } from "@/api/managerApi";
import {
  UtensilsCrossed,
  MapPin,
  Table,
  ShoppingCart,
  Users,
  Clock,
  Building2,
  Info,
} from "lucide-react";

const ManagerDashboard = () => {
  const { user, staffInfo } = useAuthStore();
  const { branchId, isOwner, isStaff } = useBranchContext();

  const { data: branchTables = [], isLoading: isLoadingTables } = useTablesByBranch(branchId || "");

  const { data: ordersTodayCount = 0, isLoading: isLoadingOrdersToday } = useQuery({
    queryKey: ["manager-dashboard-orders-today", branchId],
    queryFn: async () => {
      if (!branchId) return 0;
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);

      const response = await managerApi.searchOrders({
        branchId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        page: 0,
        size: 1,
      });

      return response.result?.totalElements ?? 0;
    },
    enabled: !!branchId,
  });

  const getWelcomeMessage = () => {
    const time = new Date().getHours();
    let greeting = "Good morning";
    if (time >= 12 && time < 18) greeting = "Good afternoon";
    if (time >= 18) greeting = "Good evening";

    const name = isOwner ? user?.username : staffInfo?.username;
    return `${greeting}, ${name}!`;
  };

  const quickActions = [
    {
      title: "Manage Areas",
      description: "Create and manage dining areas",
      icon: MapPin,
      href: "/manager/areas",
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      title: "Manage Tables",
      description: "Add and organize tables",
      icon: Table,
      href: "/manager/tables",
      color: "bg-green-500/10 text-green-600",
    },
    {
      title: "View Orders",
      description: "Monitor all orders",
      icon: ShoppingCart,
      href: "/manager/orders",
      color: "bg-orange-500/10 text-orange-600",
    },
    {
      title: "Staff Management",
      description: "Manage staff accounts",
      icon: Users,
      href: "/manager/staff",
      color: "bg-purple-500/10 text-purple-600",
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Restaurant Owner Access Alert */}
      {isOwner && (
        <Alert className="border-primary/20 bg-primary/5">
          <Building2 className="h-4 w-4 text-primary" />
          <AlertDescription className="text-primary">
            You are accessing this branch dashboard as a <strong>Restaurant Owner</strong>. 
            You have full access to manage this branch's operations.
          </AlertDescription>
        </Alert>
      )}

      {/* Branch ID Missing Alert */}
      {!branchId && (
        <Alert className="border-destructive/20 bg-destructive/5">
          <Info className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            No branch selected. Please select a branch from your restaurant dashboard to access branch management features.
          </AlertDescription>
        </Alert>
      )}

      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-display">{getWelcomeMessage()}</h1>
        <p className="text-muted-foreground">
          Welcome to your Branch Manager dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Current Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-primary" />
              Your Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isOwner ? "Restaurant Owner" : "Branch Manager"}
            </div>
            <p className="text-xs text-muted-foreground">
              {isOwner ? "Full restaurant access" : "Full branch access"}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Table className="w-4 h-4 text-primary" />
              Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {branchId ? (isLoadingTables ? "..." : branchTables.length) : "--"}
            </div>
            <p className="text-xs text-muted-foreground">
              Total tables managed
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-primary" />
              Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {branchId ? (isLoadingOrdersToday ? "..." : ordersTodayCount) : "--"}
            </div>
            <p className="text-xs text-muted-foreground">
              Orders today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass-card border-border/60">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Card
                key={action.title}
                className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-border/60"
                onClick={() => window.location.href = action.href}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.color}`}>
                      <action.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">{action.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Responsibilities */}
      <Card className="glass-card border-border/60">
        <CardHeader>
          <CardTitle>Your Responsibilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">
                As a {isOwner ? "Restaurant Owner" : "Branch Manager"}, you can:
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Create, edit, and delete dining areas</li>
                <li>• Manage table layouts and configurations</li>
                <li>• Oversee all branch operations</li>
                <li>• Manage staff accounts and permissions</li>
                <li>• Monitor orders and customer service</li>
                {isOwner && (
                  <li>• Access all restaurant owner privileges</li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerDashboard;