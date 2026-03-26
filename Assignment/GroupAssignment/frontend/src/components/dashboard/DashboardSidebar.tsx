import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, UtensilsCrossed, BarChart3, Users, Settings,
  Store, ChevronLeft, MapPin, LogOut, Tag
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarTrigger, useSidebar, SidebarHeader, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useRestaurant } from "@/hooks/queries/useRestaurantQueries";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useLogout } from "@/hooks/queries/useAuthQueries";

const menuItems = [
  { title: "Overview", description: "Dashboard overview", url: "", icon: LayoutDashboard },
  {
    title: "Menu Management",
    description: "Manage menu items",
    url: "/menu",
    icon: UtensilsCrossed,
    subItems: [
      { title: "Menu Items", url: "/menu" },
      { title: "Categories", url: "/categories" },
      { title: "Customizations", url: "/customizations" },
    ]
  },
  { title: "Areas & Tables", description: "Manage areas & tables", url: "/areas", icon: MapPin },
  { title: "Promotions", description: "Manage offers & discounts", url: "/promotions", icon: Tag },
  { title: "Analytics", description: "Revenue & insights", url: "/analytics", icon: BarChart3 },
  { title: "Staff", description: "Manage staff", url: "/staff", icon: Users },
];

export function DashboardSidebar() {
  const { id } = useParams<{ id: string }>();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { data: restaurant } = useRestaurant(id || '');
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();

  // Restaurant Owners can access branch dashboard
  const isRestaurantOwner = user?.role?.name === 'RESTAURANT_OWNER';

  const basePath = `/dashboard/${id}`;

  const isActive = (url: string) => {
    const fullPath = `${basePath}${url}`;
    return url === ""
      ? location.pathname === basePath || location.pathname === `${basePath}/`
      : location.pathname.startsWith(fullPath);
  };

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
                <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-base font-bold tracking-tight text-sidebar-foreground truncate">
                  BentoX
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  Owner Portal
                </span>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <Link to="/restaurants" className="text-muted-foreground hover:text-foreground transition-colors p-1">
                  <ChevronLeft className="w-4 h-4" />
                </Link>
                <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
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
                  {item.subItems ? (
                    <Collapsible defaultOpen={item.subItems.some(sub => isActive(sub.url))}>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title} className="h-14 mb-1">
                          <item.icon className={`w-5 h-5 shrink-0 ${item.subItems.some(sub => isActive(sub.url)) ? 'text-primary' : ''}`} />
                          {!collapsed && (
                            <div className="flex flex-col flex-1 overflow-hidden h-full justify-center">
                              <span className={`text-sm truncate leading-tight ${item.subItems.some(sub => isActive(sub.url)) ? 'font-bold text-primary' : 'font-semibold'}`}>
                                {item.title}
                              </span>
                              <span className="text-xs text-muted-foreground truncate leading-tight mt-0.5">
                                {item.description}
                              </span>
                            </div>
                          )}
                          <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.subItems.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActive(subItem.url)}
                              >
                                <NavLink
                                  to={`${basePath}${subItem.url}`}
                                  className="hover:bg-sidebar-accent/50 rounded-lg transition-all"
                                  activeClassName="bg-sidebar-accent/80 text-primary border-l-[4px] border-primary"
                                >
                                  <span>{subItem.title}</span>
                                </NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                      className="h-14 mb-1"
                    >
                      <NavLink
                        to={`${basePath}${item.url}`}
                        end={item.url === ""}
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
                  )}
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
                {user?.username?.charAt(0).toUpperCase() || "O"}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold text-sidebar-foreground truncate">
                  {user?.username || "Owner"}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {restaurant?.name || "Restaurant"}
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
              {user?.username?.charAt(0).toUpperCase() || "O"}
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
