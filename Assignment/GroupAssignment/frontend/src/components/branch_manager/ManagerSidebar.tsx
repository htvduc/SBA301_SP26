import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Store,
  Grid2X2,
  ReceiptText,
  Users,
  Tag,
  LogOut,
  ShoppingCart,
  ChefHat,
  ArrowLeft,
  Building
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
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
import { useBranchContext } from "@/hooks/useBranchContext";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Dashboard", description: "Dashboard summary", url: "/dashboard", icon: LayoutDashboard },
  { title: "Branch Info", description: "Branch details", url: "/branch", icon: Store },
  { title: "Area & Tables", description: "Area management", url: "/areas", icon: Grid2X2 },
  { title: "Kitchen", description: "Kitchen monitor", url: "/kitchen", icon: ChefHat },
  { title: "Orders", description: "Manage orders", url: "/orders", icon: ShoppingCart },
  { title: "Menu", description: "Menu management", url: "/menu", icon: UtensilsCrossed },
  { title: "Bills", description: "View bill history", url: "/bills", icon: ReceiptText },
  { title: "Staff", description: "Staff management", url: "/staff", icon: Users },
  { title: "Promotions", description: "Manage promotions", url: "/promotions", icon: Tag },
];

export default function ManagerSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { user, staffInfo } = useAuthStore();
  const { isOwner } = useBranchContext();
  const logout = useLogout();

  const basePath = `/manager`;

  const isActive = (url: string) => {
    const fullPath = `${basePath}${url}`;
    if (url === "/areas") {
      return location.pathname.startsWith(fullPath) || location.pathname.startsWith(`${basePath}/tables`);
    }
    return location.pathname.startsWith(fullPath);
  };

  const handleSignOut = async () => {
    await logout.mutateAsync();
  };

  const handleReturnToRestaurant = () => {
    // Clear selected branch from localStorage
    localStorage.removeItem('selectedBranchId');
    
    // Get restaurant ID from localStorage (saved when accessing from restaurant dashboard)
    const restaurantId = localStorage.getItem('currentRestaurantId');
    
    if (restaurantId) {
      // Navigate directly to restaurant owner dashboard
      navigate(`/dashboard/${restaurantId}`);
    } else {
      // Fallback to restaurant selection page if no restaurant ID found
      navigate('/restaurants');
    }
  };

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
                  Manager Portal
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
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className="h-14 mb-1"
                  >
                    <NavLink
                      to={`${basePath}${item.url}`}
                      end={item.url === "/dashboard"}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-sidebar-accent/50 rounded-lg transition-all"
                      activeClassName="bg-sidebar-accent/80 text-primary border-l-[4px] border-primary"
                    >
                      <item.icon className={`w-5 h-5 shrink-0 ${isActive(item.url) ? 'text-primary' : ''}`} />
                      {!collapsed && (
                        <div className="flex flex-col flex-1 overflow-hidden h-full justify-center">
                          <span className={`text-sm truncate leading-tight ${isActive(item.url) ? 'font-bold text-primary' : 'font-semibold'}`}>
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
            {/* Return to Restaurant Dashboard Button - Show for Restaurant Owners */}
            {isOwner && (
              <Button
                onClick={handleReturnToRestaurant}
                variant="outline"
                className="w-full gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Return to Restaurant</span>
              </Button>
            )}

            {/* User Info block */}
            <div className="flex items-center gap-3 px-1 py-2">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary font-bold">
                {(isOwner ? user?.username : staffInfo?.username)?.charAt(0).toUpperCase() || "M"}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold text-sidebar-foreground truncate">
                  {(isOwner ? user?.username : staffInfo?.username) || "Manager"}
                </span>
                <span className="text-[10px] font-bold bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full w-fit mt-1">
                  {isOwner ? "RESTAURANT_OWNER" : (staffInfo?.role || "BRANCH_MANAGER")}
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
            {/* Return to Restaurant Dashboard Button - Collapsed */}
            {isOwner && (
              <button
                onClick={handleReturnToRestaurant}
                className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors flex items-center justify-center border border-primary/30"
                title="Return to Restaurant Dashboard"
              >
                <ArrowLeft className="w-5 h-5 shrink-0" />
              </button>
            )}

            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary font-bold">
              {(isOwner ? user?.username : staffInfo?.username)?.charAt(0).toUpperCase() || "M"}
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
