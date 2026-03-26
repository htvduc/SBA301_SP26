import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Menu, X, LogOut, User, Store, Shield } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useLogout } from "@/hooks/queries/useAuthQueries";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogout();

  const isAdmin = user?.role?.name === "ADMIN";

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Contact", href: "#contact" },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-secondary/90 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center">
            <UtensilsCrossed className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-secondary-foreground">BentoX</span>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="text-[13px] font-medium text-secondary-foreground/50 hover:text-secondary-foreground transition-colors duration-200">
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {isAdmin && (
            <Link to="/admin/dashboard/statistics">
              <Button variant="ghost" size="sm" className="text-secondary-foreground/60 hover:text-secondary-foreground hover:bg-white/[0.06] gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Admin
              </Button>
            </Link>
          )}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-secondary-foreground/60 hover:text-secondary-foreground hover:bg-white/[0.06]">
                  <User className="w-4 h-4 mr-2" />
                  {user?.email}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/restaurants')}>
                  <Store className="w-4 h-4 mr-2" />
                  My Restaurants
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
                  <LogOut className="w-4 h-4 mr-2" />
                  {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-secondary-foreground/60 hover:text-secondary-foreground hover:bg-white/[0.06]">Sign In</Button>
              </Link>
              <Link to="/login">
                <Button variant="hero" size="sm">Start Free Trial</Button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-secondary-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-secondary border-b border-white/[0.06] px-4 pb-4 animate-fade-in">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="block py-2.5 text-secondary-foreground/50 hover:text-secondary-foreground transition-colors" onClick={() => setMobileOpen(false)}>
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 mt-3">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link to="/admin/dashboard/statistics">
                    <Button variant="ghost" className="w-full text-secondary-foreground/60 justify-start gap-2" onClick={() => setMobileOpen(false)}>
                      <Shield className="w-4 h-4" />
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
                <div className="text-sm text-secondary-foreground/60 px-3 py-2">
                  {user?.email}
                </div>
                <Button variant="ghost" className="w-full text-secondary-foreground/60 justify-start" onClick={() => { navigate('/profile'); setMobileOpen(false); }}>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
                <Button variant="ghost" className="w-full text-secondary-foreground/60 justify-start" onClick={() => { navigate('/restaurants'); setMobileOpen(false); }}>
                  <Store className="w-4 h-4 mr-2" />
                  My Restaurants
                </Button>
                <Button variant="ghost" className="w-full text-secondary-foreground/60 justify-start" onClick={handleLogout} disabled={logoutMutation.isPending}>
                  <LogOut className="w-4 h-4 mr-2" />
                  {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                </Button>
              </>
            ) : (
              <>
                <Link to="/login"><Button variant="ghost" className="w-full text-secondary-foreground/60">Sign In</Button></Link>
                <Link to="/login"><Button variant="hero" className="w-full">Start Free Trial</Button></Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
