import { useLocation, useNavigate } from "react-router-dom";
import { useSubscriptionQueries } from "@/hooks/queries/useSubscriptionQueries";
import { useAuthStore } from "@/stores/authStore";
import { subscriptionApi } from "@/api/subscriptionApi";
import type { PackageFeatureDTO } from "@/types/dto/package.dto";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, Store, MapPin, Phone, Mail, Globe, Check, Package, ShieldCheck, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface LocationState {
  package: PackageFeatureDTO;
  restaurant?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    publicUrl: string;
    description: string;
  };
  restaurantId?: string;
  restaurantName?: string;
  action?: "new" | "upgrade";
}

const PaymentConfirm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const { user } = useAuthStore();
  const { createRestaurantWithSubscription } = useSubscriptionQueries();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!state) {
    navigate("/payment/select");
    return null;
  }

  const { package: pkg, restaurant, restaurantId, restaurantName, action = "new" } = state;
  const isUpgrade = action === "upgrade";
  
  const formatValue = (v?: number | null) => (v && v >= 9999 ? "Unlimited" : v);
  const formatPrice = (price: number) => price.toLocaleString('vi-VN');

  const handleProceedToPayment = async () => {
    if (!user?.userId) {
      navigate("/login");
      return;
    }

    setIsProcessing(true);
    try {
      let paymentResponse: any;

      if (isUpgrade && restaurantId) {
        // Upgrade existing subscription
        paymentResponse = await subscriptionApi.upgradePackage(restaurantId, pkg.packageId!);
      } else if (restaurant) {
        // Create new restaurant with subscription
        paymentResponse = await createRestaurantWithSubscription.mutateAsync({
          restaurantRequest: {
            userId: user.userId,
            name: restaurant.name,
            email: restaurant.email,
            restaurantPhone: restaurant.phone,
            publicUrl: restaurant.publicUrl,
            description: restaurant.description,
          },
          packageId: pkg.packageId!,
        });
      }

      // Navigate to checkout with payment info
      navigate("/payment/checkout", {
        state: {
          package: pkg,
          restaurant: restaurant || { name: restaurantName },
          payment: paymentResponse,
          action,
        },
      });
    } catch (error) {
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-background to-background dark:from-slate-950 dark:via-background dark:to-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="container mx-auto flex items-center h-16 px-4 justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
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
        <div className="max-w-4xl mx-auto">
          {/* Modern Stepper */}
          <div className="flex items-center justify-center mb-12">
            {[
              { label: "Plan", status: "complete" },
              { label: "Details", status: "complete" },
              { label: "Confirm", status: "active" },
              { label: "Payment", status: "pending" },
            ].map((step, i, arr) => (
              <div key={step.label} className="flex items-center">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                      step.status === "active"
                        ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110"
                        : step.status === "complete"
                        ? "bg-green-500 border-green-500 text-white"
                        : "bg-background border-muted-foreground/20 text-muted-foreground"
                    }`}
                  >
                    {step.status === "complete" ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-bold">{i + 1}</span>
                    )}
                  </div>
                  <span
                    className={`text-[11px] uppercase tracking-wider font-bold ${
                      step.status === "active" ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <div
                    className={`w-12 sm:w-20 h-[2px] mx-2 -mt-6 transition-colors duration-500 ${
                      i < 2 ? "bg-green-500" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h1 className="text-4xl font-extrabold tracking-tight mb-2">
                  {isUpgrade ? "Confirm Upgrade" : "Review your order"}
                </h1>
                <p className="text-muted-foreground">
                  {isUpgrade 
                    ? "Review your package upgrade before proceeding to payment."
                    : "Double check the information below before finalizing your subscription."}
                </p>
              </motion.div>

              {/* Restaurant Info Card - Only show for new subscriptions */}
              {!isUpgrade && restaurant && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="overflow-hidden border-none shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg text-blue-600 dark:text-blue-400">
                          <Store className="w-5 h-5" />
                        </div>
                        <h2 className="font-semibold text-lg">Restaurant Details</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                        <DetailItem icon={<Store className="w-4 h-4" />} label="Name" value={restaurant.name} />
                        <DetailItem icon={<Mail className="w-4 h-4" />} label="Email" value={restaurant.email} />
                        <DetailItem icon={<Phone className="w-4 h-4" />} label="Phone" value={restaurant.phone} />
                        <DetailItem icon={<MapPin className="w-4 h-4" />} label="Address" value={restaurant.address} />
                        {restaurant.publicUrl && (
                          <DetailItem icon={<Globe className="w-4 h-4" />} label="Website" value={restaurant.publicUrl} />
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Upgrade Info Card - Only show for upgrades */}
              {isUpgrade && restaurantName && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="overflow-hidden border-none shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg text-blue-600 dark:text-blue-400">
                          <Store className="w-5 h-5" />
                        </div>
                        <h2 className="font-semibold text-lg">Restaurant</h2>
                      </div>
                      <p className="text-2xl font-bold">{restaurantName}</p>
                      <Badge className="mt-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                        Upgrading Subscription
                      </Badge>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Package Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="overflow-hidden border-none shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-purple-50 dark:bg-purple-950 rounded-lg text-purple-600 dark:text-purple-400">
                        <Package className="w-5 h-5" />
                      </div>
                      <h2 className="font-semibold text-lg">Subscription Plan</h2>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 mb-6 flex items-center justify-between">
                      <div>
                        <Badge className="mb-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900 border-none px-3">
                          Selected Plan
                        </Badge>
                        <h3 className="text-2xl font-bold">{pkg.name}</h3>
                        <p className="text-sm text-muted-foreground">{pkg.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black text-primary">{formatPrice(pkg.price!)}₫</div>
                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">
                          Per {pkg.billingPeriod === 1 ? "Month" : `${pkg.billingPeriod} Months`}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {pkg.features.map((f) => (
                        <div
                          key={f.featureId}
                          className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <div className="bg-green-100 dark:bg-green-900 rounded-full p-1">
                            <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-sm font-medium">
                            {f.featureName}
                            {f.value != null && (
                              <span className="text-primary ml-1.5 font-bold">({formatValue(f.value)})</span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <Card className="border-none shadow-2xl shadow-primary/10 bg-slate-900 dark:bg-slate-950 text-slate-50 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -mr-16 -mt-16 rounded-full" />
                  <div className="p-8 relative">
                    <h3 className="text-lg font-semibold mb-6">Summary</h3>
                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between text-slate-400">
                        <span>{pkg.name} Plan</span>
                        <span>{formatPrice(pkg.price!)}₫</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Setup Fee</span>
                        <span className="text-green-400">Free</span>
                      </div>
                      <Separator className="bg-slate-700" />
                      <div className="flex justify-between items-end">
                        <span className="text-slate-100 font-medium">Total due today</span>
                        <div className="text-right">
                          <span className="text-3xl font-bold text-white">{formatPrice(pkg.price!)}₫</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="lg"
                      onClick={handleProceedToPayment}
                      disabled={isProcessing || createRestaurantWithSubscription.isPending}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-md font-bold shadow-lg shadow-primary/20 group"
                    >
                      {(isProcessing || createRestaurantWithSubscription.isPending) ? "Processing..." : "Proceed to Payment"}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                      <CreditCard className="w-3 h-3" />
                      Secured by PayOS
                    </div>
                  </div>
                </Card>
                <Button
                  variant="ghost"
                  onClick={() => navigate(-1)}
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  Change details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Component con hỗ trợ hiển thị chi tiết
const DetailItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
    <div className="flex items-center gap-2.5">
      <div className="text-primary/60">{icon}</div>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  </div>
);

export default PaymentConfirm;
