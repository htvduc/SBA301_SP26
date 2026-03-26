import { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useSubscriptionQueries } from "@/hooks/queries/useSubscriptionQueries";
import type { PackageFeatureDTO } from "@/types/dto/package.dto";
import type { SubscriptionPaymentResponse } from "@/types/dto/subscription.dto";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, Store, Clock, Copy, CheckCircle2, 
  QrCode, X, ShieldCheck, Check, CreditCard,
  AlertCircle, Badge, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QRCodeCanvas } from "qrcode.react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LocationState {
  package: PackageFeatureDTO;
  restaurant: { name: string; address: string; phone: string; email: string; website: string; description: string };
  payment: SubscriptionPaymentResponse;
}

const PaymentCheckout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const state = location.state as LocationState | null;
  const { toast } = useToast();
  const { cancelPayment, usePaymentStatusByOrderCode } = useSubscriptionQueries();
  
  const [copied, setCopied] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Get orderCode from query params or state
  const orderCodeFromQuery = searchParams.get('orderCode');
  const orderCode = orderCodeFromQuery || state?.payment?.payOsOrderCode;

  // Fetch payment status using orderCode
  const { data: paymentStatus, isLoading } = usePaymentStatusByOrderCode(orderCode);

  // Use payment data from state or fetched data
  const payment = state?.payment || paymentStatus;
  const pkg = state?.package;

  useEffect(() => {
    if (!orderCode) {
      navigate("/payment/select");
      return;
    }

    if (!payment) return;

    const expiredAt = new Date(payment.expiredAt).getTime();
    const now = Date.now();
    const remainingSeconds = Math.floor((expiredAt - now) / 1000);
    
    if (remainingSeconds <= 0) {
      navigate("/payment/failed", { state: { reason: "timeout" } });
      return;
    }

    setCountdown(remainingSeconds);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/payment/failed", { state: { reason: "timeout" } });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [payment, navigate, orderCode]);

  useEffect(() => {
    if (paymentStatus?.subscriptionPaymentStatus === "SUCCESS") {
      navigate("/payment/success", { state });
    } else if (paymentStatus?.subscriptionPaymentStatus === "FAILED") {
      navigate("/payment/failed", { state: { reason: "failed" } });
    } else if (paymentStatus?.subscriptionPaymentStatus === "CANCELED") {
      navigate("/payment/cancel");
    }
  }, [paymentStatus, navigate, state]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading payment information...</p>
        </div>
      </div>
    );
  }

  if (!payment) return null;

  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;
  const isExpiringSoon = countdown < 120;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text.toString().replace(/\s/g, ""));
    setCopied(label);
    toast({ title: "Copied!", description: `${label} copied to clipboard.` });
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-background to-background">
      {/* Header đồng bộ */}
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
              <span className="text-xl font-bold tracking-tight">RestoHub</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
            Secure Payment
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Stepper đồng bộ - Bước cuối */}
          <div className="flex items-center justify-center mb-12">
            {[
              { label: "Plan", status: "complete" },
              { label: "Details", status: "complete" },
              { label: "Confirm", status: "complete" },
              { label: "Payment", status: "active" },
            ].map((step, i, arr) => (
              <div key={step.label} className="flex items-center">
                <div className="flex flex-col items-center gap-2">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                    step.status === "active" ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110" : 
                    "bg-green-500 border-green-500 text-white"
                  )}>
                    {step.status === "complete" ? <Check className="w-5 h-5" /> : <span className="text-sm font-bold">{i + 1}</span>}
                  </div>
                  <span className={cn("text-[11px] uppercase tracking-wider font-bold", step.status === "active" ? "text-primary" : "text-muted-foreground")}>
                    {step.label}
                  </span>
                </div>
                {i < arr.length - 1 && <div className="w-12 sm:w-20 h-[2px] mx-2 -mt-6 bg-green-500" />}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left side: QR Code */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-5 space-y-6"
            >
              <Card className="border-none shadow-2xl bg-white overflow-hidden">
                <div className="p-8 flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-6 self-start">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <h2 className="font-bold text-lg">Scan to Pay</h2>
                  </div>

                  <div className="relative group p-4 bg-white border-2 border-slate-100 rounded-3xl shadow-inner">
                    {payment.qrCodeUrl ? (
                      <QRCodeCanvas value={payment.qrCodeUrl} size={240} level="H" />
                    ) : (
                      <div className="w-[240px] h-[240px] flex items-center justify-center bg-slate-50 rounded-xl border-2 border-dashed">
                         <AlertCircle className="w-10 h-10 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  <div className="mt-6 text-center space-y-2">
                    <p className="text-sm font-medium text-slate-600">Scan this QR with any Banking App</p>
                    <div className={cn(
                      "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-tighter transition-colors",
                      isExpiringSoon ? "bg-red-50 text-red-600 animate-pulse" : "bg-slate-100 text-slate-500"
                    )}>
                      <Clock className="w-3.5 h-3.5" />
                      Expires in {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                    </div>
                  </div>
                </div>
              </Card>

              <Button 
                variant="ghost" 
                className="w-full text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all rounded-xl h-12"
                onClick={() => {
                   if(confirm("Are you sure you want to cancel this payment?")) {
                      cancelPayment.mutate(payment.payOsOrderCode);
                      navigate("/payment/cancel");
                   }
                }}
              >
                <X className="w-4 h-4 mr-2" /> Cancel Transaction
              </Button>
            </motion.div>

            {/* Right side: Summary & Details */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="lg:col-span-7 space-y-6"
            >
              {/* Amount Summary Card - Đồng bộ style Dark với Summary ở trang Confirm */}
              <Card className="border-none shadow-2xl shadow-primary/10 bg-slate-900 text-slate-50 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -mr-16 -mt-16 rounded-full" />
                <div className="p-8 relative">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <Badge className="bg-primary/20 text-primary border-none mb-2">Order #{payment.payOsOrderCode}</Badge>
                      <h3 className="text-2xl font-bold">{payment.restaurantName || pkg?.name || 'Subscription'}</h3>
                      <p className="text-sm text-slate-400 mt-1">{payment.purpose === 'RENEW' ? 'Renewal' : payment.purpose === 'UPGRADE' ? 'Upgrade' : 'New Subscription'}</p>
                    </div>
                    <CreditCard className="w-6 h-6 text-slate-500" />
                  </div>
                  
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">{payment.amount.toLocaleString()}</span>
                    <span className="text-slate-400 font-medium">đ</span>
                  </div>
                  
                  <Separator className="my-6 bg-slate-800" />
                  
                  <div className="space-y-4">
                    <TransferDetail
                      label="Bank Account" 
                      value={payment.accountNumber || "N/A"} 
                      onCopy={() => copyToClipboard(payment.accountNumber || "", "Account Number")}
                      isCopied={copied === "Account Number"}
                    />
                    <TransferDetail 
                      label="Account Name" 
                      value={payment.accountName || "N/A"} 
                      onCopy={() => copyToClipboard(payment.accountName || "", "Account Name")}
                      isCopied={copied === "Account Name"}
                    />
                    <TransferDetail 
                      label="Transfer Note" 
                      value={payment.description || payment.payOsOrderCode.toString()} 
                      onCopy={() => copyToClipboard(payment.description || payment.payOsOrderCode.toString(), "Note")}
                      isCopied={copied === "Note"}
                      highlight
                    />
                  </div>
                </div>
              </Card>

              {/* Status Info Card */}
              <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm p-6">
                 <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                       <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping" />
                    </div>
                    <div>
                       <h4 className="font-bold text-slate-900">Waiting for payment...</h4>
                       <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                          Please do not close this window. System will automatically redirect once your transaction is verified (usually takes 10-30 seconds).
                       </p>
                    </div>
                 </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Sub-component cho các dòng chi tiết chuyển khoản
const TransferDetail = ({ 
  label, 
  value, 
  onCopy, 
  isCopied, 
  highlight = false 
}: { 
  label: string; 
  value: string; 
  onCopy: () => void; 
  isCopied: boolean;
  highlight?: boolean;
}) => (
  <div className="flex items-center justify-between group">
    <div className="flex flex-col">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
      <span className={cn("text-sm font-semibold tracking-wide", highlight ? "text-primary" : "text-slate-200")}>
        {value}
      </span>
    </div>
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-8 w-8 rounded-lg hover:bg-slate-800 hover:text-white text-slate-500 transition-all"
      onClick={onCopy}
    >
      {isCopied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
    </Button>
  </div>
);

export default PaymentCheckout;