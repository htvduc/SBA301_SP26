import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "react-router-dom";
import { useTodayOrdersCount } from "@/hooks/queries/useWaiterQueries";
import {
    UtensilsCrossed,
    Table,
    ShoppingCart,
    Clock,
} from "lucide-react";

const WaiterDashboard = () => {
    const staffInfo = useAuthStore((state) => state.staffInfo);
    const navigate = useNavigate();
    
    // Get today's orders count
    const { data: todayOrdersCount = 0, isLoading: isLoadingOrdersCount } = useTodayOrdersCount(
        staffInfo?.branchId || ""
    );

    const getWelcomeMessage = () => {
        const time = new Date().getHours();
        let greeting = "Good morning";
        if (time >= 12 && time < 18) greeting = "Good afternoon";
        if (time >= 18) greeting = "Good evening";

        return `${greeting}, ${staffInfo?.username}!`;
    };

    const quickActions = [
        {
            title: "View Tables",
            description: "Check table status and availability",
            icon: Table,
            href: "/waiter/tables",
            color: "bg-green-500/10 text-green-600",
        },
        {
            title: "Take Orders",
            description: "Manage customer orders",
            icon: ShoppingCart,
            href: "/waiter/orders",
            color: "bg-orange-500/10 text-orange-600",
        },
    ];

    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Welcome Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-display">{getWelcomeMessage()}</h1>
                <p className="text-muted-foreground">
                    Welcome to your Waiter dashboard
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <div className="text-2xl font-bold">Waiter</div>
                        <p className="text-xs text-muted-foreground">
                            Service staff
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
                            {isLoadingOrdersCount ? "..." : todayOrdersCount}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {quickActions.map((action) => (
                            <Card
                                key={action.title}
                                className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-border/60"
                                onClick={() => navigate(action.href)}
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
                            <h4 className="font-medium text-sm">As a Waiter, you can:</h4>
                            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                                <li>• View table status and availability</li>
                                <li>• Take and manage customer orders</li>
                                <li>• Update table status (occupied/available)</li>
                                <li>• Assist customers with menu and service</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default WaiterDashboard;