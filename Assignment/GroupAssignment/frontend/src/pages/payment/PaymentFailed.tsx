import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  XCircle, ArrowLeft, RotateCcw, Clock, 
  ShieldCheck, Store, AlertCircle, Check, 
  HelpCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const PaymentFailed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const reason = (location.state as { reason?: string })?.reason || "unknown";

  const config = {
    cancelled: { 
      title: "Transaction Cancelled", 
      desc: "The payment process was cancelled by the user. No funds have been deducted from your account.", 
      icon: XCircle,
      statusColor: "text-slate-500",
      bgColor: "bg-slate-50"
    },
    timeout: { 
      title: "Payment Timed Out", 
      desc: "The payment window has expired for security reasons. Please initiate a new transaction.", 
      icon: Clock,
      statusColor: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    failed: { 
      title: "Payment Declined", 
      desc: "The transaction was declined by the payment provider. Please check your balance or try a different method.", 
      icon: AlertCircle,
      statusColor: "text-red-600",
      bgColor: "bg-red-50"
    },
    unknown: { 
      title: "Something went wrong", 
      desc: "An unexpected error occurred during the process. Please contact support if this persists.", 
      icon: AlertCircle,
      statusColor: "text-red-600",
      bgColor: "bg-red-50"
    },
  }[reason] || { title: "Payment Failed", desc: "An error occurred.", icon: XCircle, statusColor: "text-red-600", bgColor: "bg-red-50" };

  const Icon = config.icon;

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
            Secure System
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 flex flex-col items-center">
        {/* Stepper đồng bộ - Hiển thị lỗi ở bước cuối */}
        <div className="flex items-center justify-center mb-16">
          {[
            { label: "Plan", status: "complete" },
            { label: "Details", status: "complete" },
            { label: "Confirm", status: "complete" },
            { label: "Payment", status: "failed" },
          ].map((step, i, arr) => (
            <div key={step.label} className="flex items-center">
              <div className="flex flex-col items-center gap-2">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                  step.status === "complete" ? "bg-green-500 border-green-500 text-white" : 
                  step.status === "failed" ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-200" : 
                  "bg-background border-muted-foreground/20 text-muted-foreground"
                )}>
                  {step.status === "complete" ? <Check className="w-5 h-5" /> : 
                   step.status === "failed" ? <XCircle className="w-5 h-5" /> : <span className="text-sm font-bold">{i + 1}</span>}
                </div>
                <span className={cn(
                  "text-[11px] uppercase tracking-wider font-bold",
                  step.status === "failed" ? "text-red-500" : 
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
          {/* Status Icon */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-8"
          >
            <div className={cn("inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 border animate-pulse-subtle", config.bgColor, config.statusColor, "border-current/10")}>
              <Icon className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-3">{config.title}</h1>
            <p className="text-slate-500 text-base leading-relaxed max-w-sm mx-auto">
              {config.desc}
            </p>
          </motion.div>

          {/* Error Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white/70 backdrop-blur-md overflow-hidden mb-8">
              <div className="p-8">
                <div className="flex items-center gap-2 mb-6">
                  <Badge variant="outline" className="text-slate-400 border-slate-200 font-bold px-3">ERROR LOG</Badge>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Code: {reason.toUpperCase()}</span>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <HelpCircle className="w-3 h-3 text-primary" />
                      What can I do?
                    </h4>
                    <ul className="text-sm text-slate-500 space-y-1.5 list-disc list-inside">
                      <li>Check your internet connection</li>
                      <li>Verify your payment account balance</li>
                      <li>Try a different payment method</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50/50 border-t border-slate-100 p-4 flex justify-center gap-6">
                <button className="text-[10px] font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-widest">
                  Contact Support
                </button>
                <button className="text-[10px] font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-widest">
                  View FAQ
                </button>
              </div>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button 
              size="lg" 
              variant="outline"
              className="flex-1 h-14 text-md font-bold bg-white border-slate-200 gap-2"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
            <Button 
              size="lg" 
              className="flex-[1.5] h-14 text-md font-bold shadow-xl shadow-primary/20 gap-2 group"
              onClick={() => navigate("/payment/select")}
            >
              <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              Try Again
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default PaymentFailed;