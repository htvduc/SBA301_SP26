import { useLocation, useNavigate } from "react-router-dom";
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
    SidebarGroup,
    SidebarGroupContent,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuthStore } from "@/stores/authStore";
import { useLogout } from "@/hooks/queries/useAuthQueries";
import { useQuery } from "@tanstack/react-query";
import {
    UtensilsCrossed,
    Table,
    ShoppingCart,
    History,
    LogOut,
    LayoutDashboard,
    ChefHat,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { waiterOrderApi } from "@/api/waiterOrderApi";
import type { OrderLineDTO } from "@/types/dto";
import { OrderLineStatus } from "@/types/dto";

const WaiterSidebar = () => {
    const { state } = useSidebar();
    const collapsed = state === "collapsed";
    const location = useLocation();
    const navigate = useNavigate();
    const staffInfo = useAuthStore((state) => state.staffInfo);
    const logout = useLogout();
    const branchId = staffInfo?.branchId || "";

    const { data: currentOrderLines = [] } = useQuery({
        queryKey: ["current-order-lines", branchId],
        queryFn: () => waiterOrderApi.getCurrentOrderLines(branchId),
        enabled: !!branchId,
        // Share cache with Kitchen page (so both update together)
        staleTime: 2000,
        refetchOnWindowFocus: false,
    });

    const pendingKitchenCount = (currentOrderLines as OrderLineDTO[]).filter(
        (line) => line.orderLineStatus === OrderLineStatus.PENDING
    ).length;

    const handleLogout = async () => {
        try {
            await logout.mutateAsync();
            navigate("/staff-login");
        } catch (error) {
        }
    };

    const menuItems = [
        {
            title: "Dashboard",
            description: "Dashboard overview",
            icon: LayoutDashboard,
            url: "/waiter/dashboard",
            isActive: location.pathname === "/waiter/dashboard",
        },
        {
            title: "Tables",
            description: "View tables",
            icon: Table,
            url: "/waiter/tables",
            isActive: location.pathname.startsWith("/waiter/tables"),
        },
        {
            title: "Orders",
            description: "Manage orders",
            icon: ShoppingCart,
            url: "/waiter/orders",
            isActive: location.pathname.startsWith("/waiter/orders"),
        },
        {
            title: "Kitchen",
            description: "Kitchen display",
            icon: ChefHat,
            url: "/waiter/kitchen",
            isActive: location.pathname.startsWith("/waiter/kitchen"),
        },
        {
            title: "History",
            description: "Order history",
            icon: History,
            url: "/waiter/history",
            isActive: location.pathname.startsWith("/waiter/history"),
        },
    ];

    return (
        <Sidebar collapsible="icon" className="border-r border-sidebar-border">
            <SidebarHeader>
                <div className="flex items-center gap-3 h-16 py-4 px-2 mb-2">
                    {!collapsed ? (
                        <div className="flex items-center gap-3 px-2 w-full">
                            <div className="w-11 h-11 rounded-2xl brand-gradient flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
                                <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-base font-bold tracking-tight text-sidebar-foreground truncate">
                                    BentoX
                                </span>
                                <span className="text-xs text-muted-foreground truncate">
                                    Waiter Portal
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center w-full">
                            <div className="w-11 h-11 rounded-2xl brand-gradient flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
                                <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
                            </div>
                        </div>
                    )}
                </div>
            </SidebarHeader>

            <SidebarContent className="px-2 mt-2 scrollbar-hide">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={item.isActive}
                                        tooltip={
                                            item.url === "/waiter/kitchen" && pendingKitchenCount > 0
                                                ? `Kitchen (${pendingKitchenCount})`
                                                : item.title
                                        }
                                        className="h-14 mb-1"
                                    >
                                        <NavLink
                                            to={item.url}
                                            className="flex items-center gap-3 px-3 py-2 hover:bg-sidebar-accent/50 rounded-lg transition-all"
                                            activeClassName="bg-sidebar-accent/80 text-primary border-l-[4px] border-primary"
                                        >
                                            <div className="relative flex items-center justify-center">
                                                <item.icon className={`w-5 h-5 shrink-0 ${item.isActive ? 'text-primary' : ''}`} />
                                                {item.url === "/waiter/kitchen" && pendingKitchenCount > 0 && (
                                                    <span
                                                        className="absolute -top-1 -right-2 h-5 min-w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 shadow-sm"
                                                    >
                                                        {pendingKitchenCount > 99 ? "99+" : pendingKitchenCount}
                                                    </span>
                                                )}
                                            </div>
                                            {!collapsed && (
                                                <div className="flex flex-col flex-1 overflow-hidden h-full justify-center">
                                                    <span className={`text-sm truncate leading-tight ${item.isActive ? 'font-bold text-primary' : 'font-semibold'}`}>
                                                        {item.title}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground truncate leading-tight mt-0.5">
                                                        {item.description}
                                                    </span>
                                                </div>
                                            )}
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <div className="mt-auto px-4 py-4 border-t border-sidebar-border gap-2 flex flex-col">
                {!collapsed ? (
                    <div className="flex flex-col gap-4">
                        {/* User Info block */}
                        <div className="flex items-center gap-3 px-1 py-2">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary font-bold">
                                {staffInfo?.username?.charAt(0).toUpperCase() || "W"}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-semibold text-sidebar-foreground truncate">
                                    {staffInfo?.username || "Waiter"}
                                </span>
                                <span className="text-[10px] font-bold bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full w-fit mt-1">
                                    {staffInfo?.role || "WAITER"}
                                </span>
                            </div>
                        </div>

                        {/* Sign Out Button */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-red-500/10 text-sidebar-foreground/70 hover:text-red-400 rounded-lg transition-colors w-full text-left border border-sidebar-border/50"
                        >
                            <LogOut className="w-5 h-5 shrink-0" />
                            <span className="text-sm font-semibold truncate">Sign Out</span>
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary font-bold">
                            {staffInfo?.username?.charAt(0).toUpperCase() || "W"}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 hover:bg-red-500/10 text-sidebar-foreground/70 hover:text-red-400 rounded-lg transition-colors flex items-center justify-center border border-sidebar-border/50"
                            title="Sign Out"
                        >
                            <LogOut className="w-5 h-5 shrink-0" />
                        </button>
                    </div>
                )}

                <div className="pt-2 flex justify-center">
                    <ThemeToggle />
                </div>
            </div>
        </Sidebar>
    );
};

export default WaiterSidebar;