import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { packageApi } from "@/api/packageApi";
import { subscriptionApi } from "@/api/subscriptionApi";
import type { PackageFeatureDTO } from "@/types/dto/package.dto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, ArrowRight, Store, Phone, Mail, Globe, ShieldCheck, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const PackageSelection = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  const restaurantId = searchParams.get('restaurantId');
  const action = searchParams.get('action'); // 'upgrade', 'subscribe', or null
  // Upgrade mode: upgrade existing active subscription
  const isUpgradeMode = Boolean(restaurantId && action === 'upgrade');
  // Subscribe mode: create new subscription for existing restaurant (no current subscription)
  const isSubscribeMode = Boolean(restaurantId && action === 'subscribe');
  
  // Clean up invalid params on mount
  useEffect(() => {
    // If we have restaurantId but invalid action, or action without restaurantId, clear params
    if ((restaurantId && action && action !== 'upgrade' && action !== 'subscribe') || 
        ((action === 'upgrade' || action === 'subscribe') && !restaurantId)) {
      setSearchParams({});
    }
  }, [restaurantId, action, setSearchParams]);
  
  const [step, setStep] = useState<"package" | "restaurant">("package");
  const [selectedPkg, setSelectedPkg] = useState<PackageFeatureDTO | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Fetch active packages from backend
  const { data: activePackages = [], isLoading } = useQuery({
    queryKey: ['packages', 'active'],
    queryFn: packageApi.getActivePackages,
  });
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    publicUrl: "",
    description: "",
  });

  const handleContinue = async () => {
    if (step === "package" && selectedPkg) {
      // If upgrade mode, directly process upgrade
      if (isUpgradeMode && restaurantId) {
        setIsProcessing(true);
        try {
          const payment = await subscriptionApi.upgradePackage(restaurantId, selectedPkg.packageId);
          
          if (payment.qrCodeUrl) {
            // Redirect to payment checkout with orderCode
            navigate(`/payment/checkout?orderCode=${payment.payOsOrderCode}`);
          } else {
            toast({
              title: "Success",
              description: "Package upgraded successfully",
            });
            navigate('/profile?tab=restaurants');
          }
        } catch (error: any) {
          toast({
            title: "Error",
            description: error?.response?.data?.message || "Failed to upgrade package",
            variant: "destructive",
          });
        } finally {
          setIsProcessing(false);
        }
      } else {
        // Normal flow - go to restaurant details
        setStep("restaurant");
        window.scrollTo(0, 0);
      }
    } else if (step === "restaurant" && form.name && form.phone && form.email) {
      navigate("/payment/confirm", { 
        state: { 
          package: selectedPkg, 
          restaurant: form 
        } 
      });
    }
  };

  const formatValue = (v?: number | null) => (v && v >= 9999 ? "Unlimited" : v);
  const formatPrice = (price?: number) => price ? price.toLocaleString('vi-VN') : '0';

  // Stepper logic
  const steps = [
    { label: "Plan", status: step === "package" ? "active" : "complete" },
    { label: "Details", status: step === "restaurant" ? "active" : step === "package" ? "pending" : "complete" },
    { label: "Confirm", status: "pending" },
    { label: "Payment", status: "pending" },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-background to-background dark:from-slate-950 dark:via-background dark:to-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="container mx-auto flex items-center h-16 px-4 justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => step === "restaurant" ? setStep("package") : navigate(-1)} 
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Store className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">BentoX</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
            Secure Checkout
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Stepper */}
          <div className="flex items-center justify-center mb-12">
            {steps.map((s, i, arr) => (
              <div key={s.label} className="flex items-center">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                      s.status === "active"
                        ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110"
                        : s.status === "complete"
                        ? "bg-green-500 border-green-500 text-white"
                        : "bg-background border-muted-foreground/20 text-muted-foreground"
                    )}
                  >
                    {s.status === "complete" ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-bold">{i + 1}</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[11px] uppercase tracking-wider font-bold",
                      s.status === "active" ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <div
                    className={cn(
                      "w-12 sm:w-20 h-[2px] mx-2 -mt-6 transition-colors duration-500",
                      s.status === "complete" ? "bg-green-500" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === "package" ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="text-center max-w-2xl mx-auto">
                  <h1 className="text-4xl font-extrabold tracking-tight mb-3">
                    {isUpgradeMode ? 'Upgrade Your Plan' : 'Choose Your Plan'}
                  </h1>
                  <p className="text-muted-foreground">
                    {isUpgradeMode 
                      ? 'Select a new plan to upgrade your restaurant subscription.'
                      : 'Unlock powerful features to grow your restaurant business efficiently.'}
                  </p>
                </div>

                {isLoading ? (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">Loading packages...</p>
                  </div>
                ) : activePackages.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No packages available</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-8">
                    {activePackages.map((pkg) => {
                      const isSelected = selectedPkg?.packageId === pkg.packageId;
                      const isPopular = pkg.name === "Pro";
                      return (
                        <Card
                          key={pkg.packageId}
                          className={cn(
                            "relative cursor-pointer transition-all duration-300 border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:scale-[1.02]",
                            isSelected
                              ? "ring-2 ring-primary shadow-primary/20"
                              : "hover:shadow-slate-200 dark:hover:shadow-slate-800"
                          )}
                          onClick={() => setSelectedPkg(pkg)}
                        >
                          {isPopular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                              <Badge className="bg-primary text-primary-foreground px-4 py-1 border-none shadow-lg">
                                Most Popular
                              </Badge>
                            </div>
                          )}
                          <div className="p-8">
                            <div className="text-center mb-6">
                              <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                              <div className="flex items-baseline justify-center gap-1">
                                <span className="text-4xl font-black">{formatPrice(pkg.price)}₫</span>
                                <span className="text-muted-foreground text-sm">
                                  /{pkg.billingPeriod === 1 ? "mo" : `${pkg.billingPeriod}mo`}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-4 line-clamp-2 min-h-[40px]">
                                {pkg.description}
                              </p>
                            </div>
                            <div className="space-y-3.5 mb-8">
                              {pkg.features.map((f) => (
                                <div key={f.featureId} className="flex items-start gap-3 text-sm">
                                  <div className="mt-1 bg-green-100 dark:bg-green-900 rounded-full p-0.5">
                                    <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                                  </div>
                                  <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {f.featureName}
                                    {f.value != null && (
                                      <span className="text-primary font-bold ml-1">
                                        ({formatValue(f.value)})
                                      </span>
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <Button
                              variant={isSelected ? "default" : "outline"}
                              className={cn(
                                "w-full h-11 font-bold",
                                isSelected && "shadow-lg shadow-primary/25"
                              )}
                            >
                              {isSelected ? "Plan Selected" : "Choose " + pkg.name}
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}

                <div className="flex justify-center pt-4">
                  <Button
                    size="lg"
                    disabled={!selectedPkg || isProcessing}
                    onClick={handleContinue}
                    className="px-12 h-12 text-md font-bold group shadow-lg shadow-primary/20"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : isUpgradeMode ? (
                      <>
                        Upgrade Package
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    ) : (
                      <>
                        Continue to Details
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-3xl mx-auto"
              >
                <div className="text-center mb-10">
                  <h1 className="text-4xl font-extrabold tracking-tight mb-3">Restaurant Details</h1>
                  <p className="text-muted-foreground">
                    Complete your profile to personalize your experience.
                  </p>
                </div>

                <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                  <div className="p-8 space-y-8">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Restaurant Name *
                        </Label>
                        <div className="relative">
                          <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
                          <Input
                            id="name"
                            placeholder="e.g. Olive Garden"
                            className="pl-10 h-11 bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Business Email *
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="contact@restaurant.com"
                            className="pl-10 h-11 bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Phone Number *
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
                          <Input
                            id="phone"
                            placeholder="+84 123 456 789"
                            className="pl-10 h-11 bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="publicUrl" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          URL Slug (Optional)
                        </Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
                          <Input
                            id="publicUrl"
                            placeholder="pho-hanoi"
                            className="pl-10 h-11 bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                            value={form.publicUrl}
                            onChange={(e) => setForm({ ...form, publicUrl: e.target.value })}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Leave empty to auto-generate from restaurant name
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="desc" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Description
                      </Label>
                      <Textarea
                        id="desc"
                        placeholder="Tell us a bit about your restaurant..."
                        className="min-h-[100px] bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <Button
                        variant="ghost"
                        onClick={() => setStep("package")}
                        className="flex-1 h-12 font-bold text-muted-foreground"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Plans
                      </Button>
                      <Button
                        disabled={!form.name || !form.phone || !form.email}
                        onClick={handleContinue}
                        className="flex-[2] h-12 font-bold shadow-lg shadow-primary/20 group"
                      >
                        Review Subscription
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Info Tip */}
                <div className="mt-8 flex items-center gap-3 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900">
                  <Info className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">
                    You can change these details later in your restaurant settings dashboard.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default PackageSelection;
