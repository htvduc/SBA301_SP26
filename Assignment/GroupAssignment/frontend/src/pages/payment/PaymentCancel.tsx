import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft, Store, ShieldCheck, 
  XCircle, Check
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-background to-background">
      {/* Header đồng bộ */}
      <header className="border-b border-border/40 bg-background/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="container mx-auto flex items-center h-16 px-4 justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Store className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">RestoHub</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            Secure Checkout
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 flex flex-col items-center">
        {/* Stepper trạng thái Cancelled */}
        <div className="flex items-center justify-center mb-16">
          {[
            { label: "Plan", status: "complete" },
            { label: "Details", status: "complete" },
            { label: "Confirm", status: "complete" },
            { label: "Payment", status: "cancelled" },
          ].map((step, i, arr) => (
            <div key={step.label} className="flex items-center">
              <div className="flex flex-col items-center gap-2">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                  step.status === "complete" ? "bg-green-500 border-green-500 text-white" : 
                  step.status === "cancelled" ? "bg-slate-200 border-slate-300 text-slate-500" : 
                  "bg-background border-muted-foreground/20 text-muted-foreground"
                )}>
                  {step.status === "complete" ? <Check className="w-5 h-5" /> : 
                   step.status === "cancelled" ? <XCircle className="w-4 h-4" /> : <span className="text-sm font-bold">{i + 1}</span>}
                </div>
                <span className={cn(
                  "text-[11px] uppercase tracking-wider font-bold",
                  step.status === "cancelled" ? "text-slate-500" : 
                  step.status === "complete" ? "text-green-600" : "text-muted-foreground"
                )}>
                  {step.label}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div className={cn("w-12 sm:w-20 h-[2px] mx-2 -mt-6", i < 2 ? "bg-green-500" : "bg-muted")} />
              )}
            </div>
          ))}
        </div>

        <div className="max-w-xl w-full">
          {/* Status Icon Section */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-100 text-slate-500 mb-6 border border-slate-200 shadow-inner">
              <XCircle className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-3">Payment Cancelled</h1>
            <p className="text-slate-500 text-base leading-relaxed max-w-sm mx-auto">
              You have cancelled the transaction. No charges were made to your account.
            </p>
          </motion.div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white/70 backdrop-blur-md overflow-hidden mb-8">
              <div className="p-8">
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    If you experienced any issues during payment or would like to try again later, you can always return to select a subscription plan.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Action Button */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button 
              size="lg" 
              className="w-full h-14 text-md font-bold shadow-xl shadow-primary/20 gap-2"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default PaymentCancel;
