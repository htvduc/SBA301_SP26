import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-restaurant.jpg";
import { ArrowRight, BarChart3, Users, ShieldCheck, Smartphone, Clock, ChefHat, Star, Check, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { packageApi } from "@/api/packageApi";
import type { PackageFeatureDTO } from "@/types/dto/package.dto";
import { useAuthStore } from "@/stores/authStore";

const features = [
  { icon: BarChart3, title: "Revenue Analytics", desc: "Track revenue in real-time with beautiful dashboards. Drill down by dish, shift, and location.", iconStyle: "feature-icon-blue", iconColor: "text-primary" },
  { icon: Users, title: "Team Management", desc: "Smart scheduling, attendance tracking, and automated payroll — all in one place.", iconStyle: "feature-icon-teal", iconColor: "text-teal" },
  { icon: Smartphone, title: "Online Reservations", desc: "Let guests book tables online with instant SMS & email confirmations.", iconStyle: "feature-icon-violet", iconColor: "text-violet" },
  { icon: ChefHat, title: "Menu Builder", desc: "Drag-and-drop menu editor with photos, QR codes, and multi-language support.", iconStyle: "feature-icon-blue", iconColor: "text-primary" },
  { icon: Clock, title: "Live Dashboard", desc: "Real-time insights across all locations. Make data-driven decisions in seconds.", iconStyle: "feature-icon-teal", iconColor: "text-teal" },
  { icon: ShieldCheck, title: "Enterprise Security", desc: "End-to-end encryption, daily backups, role-based access, and SOC 2 compliance.", iconStyle: "feature-icon-violet", iconColor: "text-violet" },
];

const testimonials = [
  { name: "Sarah Mitchell", role: "Owner, The Golden Fork", content: "BentoX cut our management time by 30%. Revenue increased 20% within three months.", rating: 5 },
  { name: "James Chen", role: "GM, Bamboo Garden", content: "Managing 5 locations feels like managing one. The live dashboard is a game-changer.", rating: 5 },
  { name: "Maria Rodriguez", role: "Owner, Café del Sol", content: "Online reservations boosted bookings by 40%. Staff learned it in minutes.", rating: 5 },
];

const stats = [
  { value: "2,500+", label: "Restaurants" },
  { value: "15M+", label: "Orders" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9★", label: "Rating" },
];

const formatFeatureValue = (feature: any): string => {
  if (!feature.value) return feature.featureName;
  return `${feature.featureName}: ${feature.value}`;
};

const Index = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  
  // Fetch active packages from API
  const { data: packages, isLoading } = useQuery({
    queryKey: ['active-packages'],
    queryFn: packageApi.getActivePackages,
  });

  // Determine which package is most popular (middle one or highest price)
  const getPopularIndex = (pkgs: PackageFeatureDTO[]) => {
    if (pkgs.length === 3) return 1; // Middle package
    if (pkgs.length === 2) return 1; // Second package
    return Math.floor(pkgs.length / 2); // Middle package for any count
  };

  // Handle Get Started button click
  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/payment/select');
    } else {
      navigate('/login');
    }
  };
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative pt-24 pb-20 md:pt-36 md:pb-32 overflow-hidden hero-bg">
        {/* Glow orbs */}
        <div className="glow-orb w-[500px] h-[500px] bg-violet/20 top-[-100px] right-[-100px] animate-pulse-soft" />
        <div className="glow-orb w-[400px] h-[400px] bg-teal/15 bottom-[-50px] left-[-80px] animate-pulse-soft" style={{ animationDelay: "2s" }} />
        <div className="glow-orb w-[300px] h-[300px] bg-primary/15 top-[40%] left-[60%] animate-pulse-soft" style={{ animationDelay: "1s" }} />

        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt="Restaurant" className="w-full h-full object-cover opacity-[0.04] mix-blend-luminosity" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="badge-gradient inline-flex items-center gap-2 text-primary px-4 py-1.5 rounded-full text-[13px] font-medium mb-8 animate-fade-in backdrop-blur-sm">
              <Zap className="w-3.5 h-3.5" />
              Trusted by 2,500+ restaurants worldwide
            </div>

            <h1 className="text-4xl md:text-[3.5rem] lg:text-6xl font-display leading-[1.1] mb-6 text-secondary-foreground opacity-0 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Run your restaurant
              <br />
              <span className="text-gradient-hero">smarter & faster</span>
            </h1>

            <p className="text-base md:text-lg text-secondary-foreground/45 mb-10 max-w-xl mx-auto leading-relaxed opacity-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Streamline operations, boost revenue, and deliver exceptional guest experiences — all from a single platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Button 
                variant="hero" 
                size="xl"
                onClick={handleGetStarted}
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Button>
              <a href="#features">
                <Button variant="hero-outline" size="xl" className="border-white/15 text-secondary-foreground/70 hover:bg-white/[0.06] hover:text-secondary-foreground">
                  See How It Works
                </Button>
              </a>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4 mt-20 max-w-2xl mx-auto">
            {stats.map((stat, i) => (
              <div key={stat.label} className="text-center opacity-0 animate-fade-in" style={{ animationDelay: `${0.5 + i * 0.08}s` }}>
                <div className="text-2xl md:text-3xl font-display text-gradient-hero stat-glow">{stat.value}</div>
                <div className="text-[11px] uppercase tracking-widest text-secondary-foreground/30 mt-1.5 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-[13px] uppercase tracking-widest text-primary font-semibold mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-display mb-4">Everything you need, nothing you don't</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Built for restaurant operators who want to spend less time managing and more time growing.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {features.map((f, i) => (
              <div key={f.title} className="glass-card rounded-2xl p-6 hover:-translate-y-0.5 opacity-0 animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className={`w-11 h-11 rounded-xl ${f.iconStyle} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.iconColor}`} />
                </div>
                <h3 className="text-base font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-[13px] uppercase tracking-widest text-primary font-semibold mb-3">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-display mb-4">Simple, transparent pricing</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">14-day free trial on all plans. No credit card required.</p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : packages && packages.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto items-stretch">
              {packages.map((pkg, i) => {
                const isPopular = i === getPopularIndex(packages);
                return (
                  <div
                    key={pkg.packageId}
                    className={`rounded-2xl p-7 opacity-0 animate-fade-in flex flex-col ${
                      isPopular
                        ? "pricing-popular text-secondary-foreground shadow-2xl ring-1 ring-white/[0.08] scale-[1.02]"
                        : "glass-card"
                    }`}
                    style={{ animationDelay: `${i * 0.12}s` }}
                  >
                    {isPopular && (
                      <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-primary to-violet text-primary-foreground text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-5">
                        <Zap className="w-3 h-3" /> Most Popular
                      </span>
                    )}
                    <h3 className="text-lg font-bold">{pkg.name}</h3>
                    <p className={`text-sm mt-1 ${isPopular ? "text-secondary-foreground/45" : "text-muted-foreground"}`}>
                      {pkg.description || "Perfect for your business"}
                    </p>
                    <div className="mt-5 mb-6">
                      <span className={`text-4xl font-display ${isPopular ? "text-gradient-hero" : ""}`}>
                        {pkg.price}đ
                      </span>
                      <span className={`text-sm ${isPopular ? "text-secondary-foreground/35" : "text-muted-foreground"}`}>
                        /{pkg.billingPeriod} {pkg.billingPeriod === 1 ? 'month' : 'months'}
                      </span>
                    </div>
                    <ul className="space-y-2.5 mb-7 flex-grow">
                      {pkg.features && pkg.features.map((feature) => (
                        <li key={feature.featureId} className="flex items-center gap-2.5 text-sm">
                          <Check className={`w-4 h-4 flex-shrink-0 ${isPopular ? "text-teal" : "text-primary"}`} />
                          {formatFeatureValue(feature)}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      variant={isPopular ? "hero" : "default"} 
                      className="w-full mt-auto"
                      onClick={handleGetStarted}
                    >
                      Get Started
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No packages available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-[13px] uppercase tracking-widest text-primary font-semibold mb-3">Testimonials</p>
            <h2 className="text-3xl md:text-4xl font-display mb-4">Loved by restaurant owners</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">See why thousands of restaurants choose BentoX.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <div key={t.name} className="glass-card rounded-2xl p-6 opacity-0 animate-fade-in" style={{ animationDelay: `${i * 0.12}s` }}>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber text-amber" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-5 text-foreground/80">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full brand-gradient flex items-center justify-center text-primary-foreground text-xs font-bold">
                    {t.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center cta-gradient rounded-3xl p-12 md:p-16 relative">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-display text-secondary-foreground mb-4">
                Ready to transform your restaurant?
              </h2>
              <p className="text-secondary-foreground/40 mb-8 max-w-md mx-auto">
                Join 2,500+ restaurants already using BentoX. Start free — no credit card needed.
              </p>
              <Button 
                variant="hero" 
                size="xl"
                onClick={handleGetStarted}
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md brand-gradient flex items-center justify-center">
                <ChefHat className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-bold text-sm tracking-tight">BentoX</span>
            </div>
            <p className="text-xs text-muted-foreground">© 2026 BentoX. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
