import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";
import { useMemo } from "react";
import { useReservations } from "@/hooks/queries/useReservationQueries";
import {
    UtensilsCrossed,
    Table,
    Users,
    Clock,
} from "lucide-react";

const ReceptionistDashboard = () => {
    const staffInfo = useAuthStore((state) => state.staffInfo);
    const branchId = staffInfo?.branchId || "";

    const todayFilters = useMemo(() => {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        return {
            startDate: start.toISOString(),
            endDate: end.toISOString(),
        };
    }, []);

    const { data: reservationsToday = [], isLoading: isLoadingReservationsToday } = useReservations(
        branchId,
        todayFilters
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
            description: "Check table availability",
            icon: Table,
            href: "/receptionist/tables",
            color: "bg-green-500/10 text-green-600",
        },
        {
            title: "Reservations",
            description: "Manage table reservations",
            icon: Users,
            href: "/receptionist/reservations",
            color: "bg-purple-500/10 text-purple-600",
        },
    ];

    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Welcome Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-display">{getWelcomeMessage()}</h1>
                <p className="text-muted-foreground">
                    Welcome to your Receptionist dashboard
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
                        <div className="text-2xl font-bold">Receptionist</div>
                        <p className="text-xs text-muted-foreground">
                            Front desk staff
                        </p>
                    </CardContent>
                </Card>

                <Card className="glass-card border-border/60">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            Reservations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {branchId ? (isLoadingReservationsToday ? "..." : reservationsToday.length) : "--"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Reservations today
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
                            <h4 className="font-medium text-sm">As a Receptionist, you can:</h4>
                            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                                <li>• View table availability</li>
                                <li>• Manage table reservations</li>
                                <li>• Welcome and seat customers</li>
                                <li>• Handle customer inquiries</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ReceptionistDashboard;