import { useNavigate, useLocation } from "react-router-dom";
import type { PackageFeatureDTO } from "@/types/dto/package.dto";
import type { SubscriptionPaymentResponse } from "@/types/dto/subscription.dto";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Check, Store, ShieldCheck, Download,
  LayoutDashboard, Home, ArrowRight, FileText
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    package: PackageFeatureDTO;
    restaurant: { name: string };
    payment: SubscriptionPaymentResponse
  } | null;

  const transactionId = state?.payment?.payOsOrderCode || "TXN-" + Math.random().toString(36).substr(2, 9).toUpperCase();

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-background to-background">
      {/* Header đồng bộ */}
      <header className="border-b border-border/40 bg-background/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="container mx-auto flex items-center h-16 px-4 justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Store className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">BentoX</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
            <ShieldCheck className="w-3.5 h-3.5" />
            System Verified
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 flex flex-col items-center">
        {/* Stepper Hoàn tất */}
        <div className="flex items-center justify-center mb-16">
          {[
            { label: "Plan" },
            { label: "Details" },
            { label: "Confirm" },
            { label: "Payment" },
          ].map((step, i, arr) => (
            <div key={step.label} className="flex items-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-500 border-2 border-green-500 text-white shadow-lg shadow-green-100">
                  <Check className="w-5 h-5" />
                </div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-green-600">
                  {step.label}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div className="w-12 sm:w-20 h-[2px] mx-2 -mt-6 bg-green-500" />
              )}
            </div>
          ))}
        </div>

        <div className="max-w-xl w-full">
          {/* Main Status Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-green-50 text-green-600 mb-6 border border-green-100">
              <Check className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-3">Subscription Active</h1>
            <p className="text-slate-500 text-base leading-relaxed">
              Your payment has been processed successfully. <br />
              <span className="font-semibold text-slate-800">{state?.restaurant?.name}</span> is now on the <span className="font-semibold text-primary">{state?.package?.name}</span> plan.
            </p>
          </motion.div>

          {/* Clean Receipt Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white/70 backdrop-blur-md overflow-hidden mb-8">
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <h2 className="font-bold text-sm uppercase tracking-widest text-slate-400">Transaction Receipt</h2>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-bold">
                    PAID
                  </Badge>
                </div>

                <div className="space-y-5">
                  <SummaryRow label="Reference Number" value={transactionId.toString()} isCode />
                  <SummaryRow label="Restaurant" value={state?.restaurant?.name || "N/A"} />
                  <SummaryRow label="Plan" value={state?.package?.name || "N/A"} />
                  <SummaryRow label="Billing Term" value={state?.package?.billingPeriod === 1 ? "Monthly" : `${state?.package?.billingPeriod} Months`} />

                  <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-900">Total Amount</span>
                    <span className="text-2xl font-black text-slate-900">${state?.payment?.amount || state?.package?.price}.00</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Smooth Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <Button
              size="lg"
              className="h-14 text-md font-bold shadow-lg shadow-primary/20 gap-2 group order-2 sm:order-1"
              variant="outline"
              onClick={() => navigate("/")}
            >
              <Home className="w-4 h-4" />
              Home
            </Button>
            <Button
              size="lg"
              className="h-14 text-md font-bold shadow-xl shadow-primary/25 gap-2 group order-1 sm:order-2"
              onClick={() => navigate("/restaurants")}
            >
              <LayoutDashboard className="w-4 h-4" />
              Go to Dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          <p className="text-center text-slate-400 text-xs mt-12 font-medium">
            A confirmation email has been sent to your registered address.
          </p>
        </div>
      </main>
    </div>
  );
};

// Sub-component cho các dòng tóm tắt (Clean version)
const SummaryRow = ({
  label,
  value,
  isCode = false
}: {
  label: string;
  value: string;
  isCode?: boolean;
}) => (
  <div className="flex justify-between items-center">
    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
    <span className={cn(
      "text-sm font-semibold text-slate-700",
      isCode && "font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-100 text-[11px]"
    )}>
      {value}
    </span>
  </div>
);

export default PaymentSuccess;