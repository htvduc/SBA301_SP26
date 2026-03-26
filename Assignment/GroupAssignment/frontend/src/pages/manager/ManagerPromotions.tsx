import { useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Search, Tag, Percent, Banknote, Gift, Clock,
  Sparkles, Info, ShieldCheck
} from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { usePromotionQueries } from "@/hooks/queries/usePromotionQueries";
import { useAuthStore } from "@/stores/authStore";
import { useBranchContext } from "@/hooks/useBranchContext";

export default function ManagerPromotions() {
  const { restaurantId } = useBranchContext();
  const [search, setSearch] = useState("");

  const { promotions = [], isLoading } = usePromotionQueries(restaurantId, true);

  const filtered = promotions.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground font-medium">Loading promotions...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 bg-background min-h-screen">
      {/* Header */}
      <div className="space-y-1 pb-2">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] px-2 py-0.5 font-bold tracking-widest uppercase">
            View Only
          </Badge>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-bold">
            <ShieldCheck className="w-3 h-3" /> READ ONLY
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
          Promotions
        </h1>
        <p className="text-muted-foreground text-sm max-w-xl">
          Check active promotions here. Only the owner can change these.
        </p>
      </div>

      {/* Diagnostics / Safeguard */}
      {!restaurantId && !isLoading && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive animate-pulse">
          <Info className="w-5 h-5 shrink-0" />
          <p className="text-xs font-bold leading-relaxed">
            SYSTEM ALERT: Missing Restaurant context. Please <button onClick={() => useAuthStore.getState().clearAuthData()} className="underline hover:opacity-80">LOG OUT</button> and Log In again to refresh your session.
          </p>
        </div>
      )}

      {/* Control Bar */}
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60" />
        <Input
          placeholder="Search by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10 bg-muted/30 border-muted rounded-lg focus-visible:ring-primary/20"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed rounded-2xl bg-muted/5 border-primary/20">
          <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mb-4">
            <Info className="w-8 h-8 text-muted-foreground/30" />
          </div>
          <h3 className="text-lg font-bold">No active promotions</h3>
          <p className="text-muted-foreground text-center max-w-xs text-sm">
            There are currently no active promotions for this restaurant.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((promo) => (
            <Card
              key={promo.promotionId}
              className={`border border-border/60 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all flex flex-col h-full shadow-none overflow-hidden relative ${promo.status !== 'ACTIVE' ? "bg-muted/30 opacity-75 grayscale-[0.5]" : "bg-card"}`}
            >
              {/* Colored Top Border Accent */}
              <div className={`absolute top-0 left-0 w-full h-1 ${promo.status === 'ACTIVE' ? "bg-primary" : "bg-muted"}`} />

              <CardContent className="p-0 flex flex-col h-full">
                {/* Top Bar */}
                <div className="p-5 pb-3 flex justify-between items-start pt-6">
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] font-bold border-none px-2 py-0.5 ${
                      promo.promotionType === 'MENU_ITEM' 
                        ? "bg-teal-500/10 text-teal-600 dark:text-teal-400" 
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {promo.promotionType === 'MENU_ITEM' ? (
                      <Tag className="w-3 h-3 mr-1" />
                    ) : (
                      <Gift className="w-3 h-3 mr-1" />
                    )}
                    {promo.promotionType === 'MENU_ITEM' ? 'ITEM' : 'BILL'}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                     <span className={`w-2 h-2 rounded-full ${promo.status === 'ACTIVE' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-muted-foreground"}`} />
                     <span className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">{promo.status}</span>
                  </div>
                </div>
                
                {/* Title & Code */}
                <div className="px-5 pb-2">
                  <h3 className="font-bold text-lg mb-1 line-clamp-1">{promo.name}</h3>
                  <code className="inline-flex px-2 py-0.5 rounded bg-primary/5 text-primary font-mono text-[10px] font-black border border-primary/10 tracking-wider">
                    {promo.code}
                  </code>
                </div>
                
                {/* Description */}
                <div className="px-5 py-3 flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {promo.description}
                  </p>
                </div>

                {/* Info Section */}
                <div className="px-5 pb-6">
                  <div className="bg-primary/[0.02] rounded-lg p-3 border border-primary/5">
                     <div className="flex items-end justify-between">
                        <div className="space-y-1">
                           <div className="flex items-center gap-1 text-[9px] text-muted-foreground uppercase font-black tracking-widest">
                              <Clock className="w-3 h-3 text-primary/60" /> Ends
                           </div>
                           <div className="text-xs font-bold text-foreground">{format(new Date(promo.endDate), 'MMM d, yyyy')}</div>
                        </div>
                        <div className="text-right">
                           <div className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-0.5">Discount</div>
                           <div className="text-xl font-black text-primary">
                              {promo.discountType === 'PERCENTAGE' ? (
                                `${promo.discountValue}%`
                              ) : (
                                `${promo.discountValue.toLocaleString()} ₫`
                              )}
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
