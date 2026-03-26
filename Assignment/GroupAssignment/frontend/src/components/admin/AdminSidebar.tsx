import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    useSidebar,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuthStore } from "@/stores/authStore";
import { useLogout } from "@/hooks/queries/useAuthQueries";
import {
    BarChart3,
    Package,
    Users,
    Shield,
    LogOut,
    UtensilsCrossed,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";

const adminMenuItems = [
    {
        title: "Statistics",
        description: "View system stats",
        url: "/admin/dashboard/statistics",
        icon: BarChart3,
    },
    {
        title: "Packages",
        description: "Manage packages",
        url: "/admin/dashboard/packages",
        icon: Package,
    },
    {
        title: "Users",
        description: "Manage users",
        url: "/admin/dashboard/users",
        icon: Users,
    },
];

export default function AdminSidebar() {
    const { state } = useSidebar();
    const collapsed = state === "collapsed";
    const location = useLocation();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const logout = useLogout();

    const handleSignOut = async () => {
        await logout.mutateAsync();
        navigate("/login");
    };

    return (
        <Sidebar collapsible="icon" className="border-r border-sidebar-border">
            <SidebarHeader>
                <div className="flex items-center gap-3 h-16 py-4 px-2 mb-2">
                    {!collapsed ? (
                        <div className="flex items-center gap-3 px-2 w-full">
                            <div className="w-11 h-11 rounded-2xl brand-gradient flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
                                <Shield className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-base font-bold tracking-tight text-sidebar-foreground truncate">
                                    BentoX
                                </span>
                                <span className="text-xs text-muted-foreground truncate">
                                    Admin Portal
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center w-full">
                            <div className="w-11 h-11 rounded-2xl brand-gradient flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
                                <Shield className="w-5 h-5 text-primary-foreground" />
                            </div>
                        </div>
                    )}
                </div>
            </SidebarHeader>

            <SidebarContent className="px-2 mt-2 scrollbar-hide">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {adminMenuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={location.pathname === item.url}
                                        tooltip={item.title}
                                        className="h-14 mb-1"
                                    >
                                        <NavLink
                                            to={item.url}
                                            className="flex items-center gap-3 px-3 py-2 hover:bg-sidebar-accent/50 rounded-lg transition-all"
                                            activeClassName="bg-sidebar-accent/80 text-primary border-l-[4px] border-primary"
                                        >
                                            <item.icon
                                                className={`w-5 h-5 shrink-0 ${location.pathname === item.url ? "text-primary" : ""
                                                    }`}
                                            />
                                            {!collapsed && (
                                                <div className="flex flex-col flex-1 overflow-hidden h-full justify-center">
                                                    <span
                                                        className={`text-sm truncate leading-tight ${location.pathname === item.url
                                                            ? "font-bold text-primary"
                                                            : "font-semibold"
                                                            }`}
                                                    >
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
                                {user?.username?.charAt(0).toUpperCase() || "A"}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-semibold text-sidebar-foreground truncate">
                                    {user?.username || "Admin"}
                                </span>
                                <span className="text-[10px] font-bold bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full w-fit mt-1">
                                    ADMIN
                                </span>
                            </div>
                        </div>

                        {/* Sign Out Button */}
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-red-500/10 text-sidebar-foreground/70 hover:text-red-400 rounded-lg transition-colors w-full text-left border border-sidebar-border/50"
                        >
                            <LogOut className="w-5 h-5 shrink-0" />
                            <span className="text-sm font-semibold truncate">Sign Out</span>
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary font-bold">
                            {user?.username?.charAt(0).toUpperCase() || "A"}
                        </div>
                        <button
                            onClick={handleSignOut}
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
}
