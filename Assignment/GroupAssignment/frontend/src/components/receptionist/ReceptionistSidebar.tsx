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
import {
    UtensilsCrossed,
    Table,
    Users,
    LogOut,
    LayoutDashboard,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";

const ReceptionistSidebar = () => {
    const { state } = useSidebar();
    const collapsed = state === "collapsed";
    const location = useLocation();
    const navigate = useNavigate();
    const staffInfo = useAuthStore((state) => state.staffInfo);
    const logout = useLogout();

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
            url: "/receptionist/dashboard",
            isActive: location.pathname === "/receptionist/dashboard",
        },
        {
            title: "Tables",
            description: "View tables",
            icon: Table,
            url: "/receptionist/tables",
            isActive: location.pathname.startsWith("/receptionist/tables"),
        },
        {
            title: "Reservations",
            description: "Manage reservations",
            icon: Users,
            url: "/receptionist/reservations",
            isActive: location.pathname.startsWith("/receptionist/reservations"),
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
                                    Receptionist Portal
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
                                        tooltip={item.title}
                                        className="h-14 mb-1"
                                    >
                                        <NavLink
                                            to={item.url}
                                            className="flex items-center gap-3 px-3 py-2 hover:bg-sidebar-accent/50 rounded-lg transition-all"
                                            activeClassName="bg-sidebar-accent/80 text-primary border-l-[4px] border-primary"
                                        >
                                            <item.icon className={`w-5 h-5 shrink-0 ${item.isActive ? 'text-primary' : ''}`} />
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
                                {staffInfo?.username?.charAt(0).toUpperCase() || "R"}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-semibold text-sidebar-foreground truncate">
                                    {staffInfo?.username || "Receptionist"}
                                </span>
                                <span className="text-[10px] font-bold bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full w-fit mt-1">
                                    {staffInfo?.role || "RECEPTIONIST"}
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
                            {staffInfo?.username?.charAt(0).toUpperCase() || "R"}
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

export default ReceptionistSidebar;