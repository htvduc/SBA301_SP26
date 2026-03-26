import { useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Search, Pencil, Trash2, Tag, Percent, 
  Banknote, Gift, Clock, Filter, ArrowUpRight
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { usePromotionQueries, usePromotionActions } from "@/hooks/queries/usePromotionQueries";
import { useMenuItemQueries } from "@/hooks/queries/useMenuItemQueries";
import { PromotionFormDialog, PromotionDeleteDialog } from "@/components/promotions";
import type { PromotionDTO } from "@/types/dto";

export default function PromotionManagement() {
  const { id: restaurantId } = useParams<{ id: string }>();
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<PromotionDTO | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { promotions, isLoading } = usePromotionQueries(restaurantId || "");
  const { createPromo, updatePromo, deletePromo, togglePromoStatus } = usePromotionActions(restaurantId || "");
  const { menuItems = [] } = useMenuItemQueries(restaurantId || ""); 

  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'UPCOMING' | 'EXPIRED' | 'INACTIVE'>('ALL');

  const now = new Date();

  const getStatusCounts = () => {
    return promotions.reduce((acc, p) => {
      if (p.status !== 'ACTIVE') {
        acc.INACTIVE++;
      } else {
        const start = new Date(p.startDate);
        const end = new Date(p.endDate);
        if (now < start) acc.UPCOMING++;
        else if (now > end) acc.EXPIRED++;
        else acc.ACTIVE++;
      }
      return acc;
    }, { ACTIVE: 0, UPCOMING: 0, EXPIRED: 0, INACTIVE: 0 });
  };

  const counts = getStatusCounts();

  const filtered = promotions.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.code.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === 'ALL') return true;
    if (activeTab === 'INACTIVE') return p.status !== 'ACTIVE';
    
    if (p.status !== 'ACTIVE') return false;
    const start = new Date(p.startDate);
    const end = new Date(p.endDate);
    
    if (activeTab === 'ACTIVE') return now >= start && now <= end;
    if (activeTab === 'UPCOMING') return now < start;
    if (activeTab === 'EXPIRED') return now > end;
    
    return true;
  });

  const openEdit = (promo: PromotionDTO) => {
    setSelectedPromo(promo);
    setIsFormOpen(true);
  };

  const openCreate = () => {
    setSelectedPromo(null);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const handleSave = async (data: any) => {
    const payload = { ...data, restaurantId };
    if (selectedPromo) {
      await updatePromo.mutateAsync({ promotionId: selectedPromo.promotionId, request: payload });
    } else {
      await createPromo.mutateAsync(payload);
    }
    setIsFormOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground font-medium">Loading promotions...</p>
      </div>
    );
  }

  const StatCard = ({ label, count, icon: Icon, color, active, onClick }: any) => (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
        active 
          ? `bg-gradient-to-br from-card to-muted/20 border-${color}-500 shadow-lg shadow-${color}-500/10` 
          : "bg-card border-border hover:border-border/80"
      }`}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-[0.05] bg-${color}-500 group-hover:scale-110 transition-transform`} />
      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-1">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
          <h4 className="text-3xl font-black italic tracking-tighter">{count}</h4>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${color}-500/10 text-${color}-600 dark:text-${color}-400 group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {active && (
        <motion.div 
          layoutId="active-indicator"
          className={`absolute bottom-0 left-0 h-1.5 bg-${color}-500 w-full`} 
        />
      )}
    </motion.div>
  );

  return (
    <div className="p-6 lg:p-8 space-y-8 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-br from-foreground to-muted-foreground">
            Promotions
          </h1>
          <p className="text-muted-foreground text-sm font-medium italic">
            Manage your restaurant promotions here.
          </p>
        </div>

        <Button 
          onClick={openCreate} 
          className="h-12 px-8 rounded-xl shadow-xl shadow-primary/20 font-black bg-primary hover:scale-[1.02] active:scale-[0.98] transition-all border-none"
        >
          <Plus className="w-5 h-5 mr-2" />
          NEW PROMOTION
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard 
          label="Active" count={counts.ACTIVE} icon={Tag} color="green" 
          active={activeTab === 'ACTIVE'} onClick={() => setActiveTab('ACTIVE')}
        />
        <StatCard 
          label="Upcoming" count={counts.UPCOMING} icon={Clock} color="blue" 
          active={activeTab === 'UPCOMING'} onClick={() => setActiveTab('UPCOMING')}
        />
        <StatCard 
          label="Expired" count={counts.EXPIRED} icon={ArrowUpRight} color="orange" 
          active={activeTab === 'EXPIRED'} onClick={() => setActiveTab('EXPIRED')}
        />
        <StatCard 
          label="Inactive" count={counts.INACTIVE} icon={Pencil} color="slate" 
          active={activeTab === 'INACTIVE'} onClick={() => setActiveTab('INACTIVE')}
        />
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search promotions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 bg-muted/50 border-border/50 rounded-2xl focus-visible:ring-primary/20 focus-visible:border-primary transition-all font-medium"
          />
        </div>
        <div className="flex gap-3">
          <Button 
            variant={activeTab === 'ALL' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('ALL')}
            className={`h-12 px-6 rounded-2xl font-bold transition-all shadow-sm ${activeTab === 'ALL' ? "shadow-primary/20" : ""}`}
          >
            All Promotions
          </Button>
          <Button variant="outline" className="h-12 w-12 p-0 rounded-2xl border-border/50 hover:bg-muted/50 hover:text-primary transition-all shadow-sm">
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-32 border border-dashed rounded-[32px] bg-muted/5 border-border/50"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-8 rotate-3">
              <Gift className="w-10 h-10 text-primary/60" />
            </div>
            <h3 className="text-2xl font-black mb-2 tracking-tight">No promotions found</h3>
            <p className="text-muted-foreground text-center max-w-sm px-8 text-sm font-medium leading-relaxed">
              Create a new promotion to get more customers!
            </p>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filtered.map((promo) => {
              const pStatus = promo.status !== 'ACTIVE' ? 'INACTIVE' : (
                now < new Date(promo.startDate) ? 'UPCOMING' : 
                now > new Date(promo.endDate) ? 'EXPIRED' : 'ACTIVE'
              );

              const statusColor = {
                ACTIVE: 'green',
                UPCOMING: 'blue',
                EXPIRED: 'orange',
                INACTIVE: 'slate'
              }[pStatus];

              return (
                <Card
                  key={promo.promotionId}
                  className={`border-none ring-1 ring-border/50 hover:ring-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all flex flex-col h-full shadow-lg overflow-hidden relative group ${pStatus !== 'ACTIVE' ? "bg-muted/30 grayscale-[0.2]" : "bg-card"}`}
                >
                  <div className={`absolute top-0 left-0 w-full h-1.5 bg-${statusColor}-500/50`} />
                  
                  <CardContent className="p-0 flex flex-col h-full">
                    <div className="p-6 pb-4 flex justify-between items-start pt-8">
                      <Badge 
                        variant="secondary" 
                        className={`text-[10px] font-black px-3 py-1 border-none rounded-lg tracking-widest ${
                          promo.promotionType === 'MENU_ITEM' 
                            ? "bg-teal-500/10 text-teal-600 dark:text-teal-400" 
                            : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                        }`}
                      >
                        {promo.promotionType === 'MENU_ITEM' ? (
                          <Tag className="w-3.5 h-3.5 mr-1.5" />
                        ) : (
                          <Gift className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        {promo.promotionType === 'MENU_ITEM' ? 'FOR ITEMS' : 'FOR BILLS'}
                      </Badge>
                      <div className="flex items-center gap-2 bg-background/50 px-2 py-1 rounded-full ring-1 ring-border/10 backdrop-blur-sm">
                        <div className={`w-2.5 h-2.5 rounded-full bg-${statusColor}-500 shadow-[0_0_8px_rgba(var(--${statusColor}),0.4)] animate-pulse`} />
                        <span className={`text-[10px] font-black uppercase text-${statusColor}-600 tracking-tighter`}>{pStatus}</span>
                      </div>
                    </div>
                    
                    <div className="px-6 pb-2">
                      <h3 className="font-black text-xl mb-1.5 text-foreground line-clamp-1 group-hover:text-primary transition-colors leading-none tracking-tight">
                        {promo.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <code className="px-2.5 py-1 rounded-lg bg-primary/5 text-primary font-mono text-[10px] font-black border border-primary/10 tracking-widest leading-none">
                          {promo.code}
                        </code>
                      </div>
                    </div>
                    
                    <div className="px-6 py-4 flex-1">
                      <p className="text-sm text-muted-foreground line-clamp-2 italic leading-relaxed font-medium">
                        "{promo.description}"
                      </p>
                    </div>

                    <div className="px-6 pb-6 pt-2 space-y-4">
                      <div className="bg-muted/10 dark:bg-muted/5 rounded-[24px] p-5 border border-border/20 shadow-inner">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-[0.2em]">Discount</span>
                          <span className="text-3xl font-black text-primary italic tracking-tighter">
                            {promo.discountType === 'PERCENTAGE' ? (
                              <span className="flex items-center">
                                {promo.discountValue}<Percent className="w-6 h-6 ml-0.5 mt-1" />
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <Banknote className="w-6 h-6 mr-1.5 text-teal-600 dark:text-teal-400" />
                                {promo.discountValue.toLocaleString()}
                              </span>
                            )}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-[11px]">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-muted-foreground uppercase font-black tracking-tight flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-blue-500" /> From
                            </span>
                            <span className="font-black text-foreground">
                              {format(new Date(promo.startDate), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1.5 text-right">
                            <span className="text-muted-foreground uppercase font-black tracking-tight flex items-center gap-1.5 justify-end">
                              To <Clock className="w-3.5 h-3.5 text-orange-500" />
                            </span>
                            <span className="font-black text-foreground">
                              {format(new Date(promo.endDate), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 mt-auto bg-muted/20 border-t border-border/50 flex gap-3 backdrop-blur-sm">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`flex-1 h-12 text-xs font-black rounded-2xl transition-all shadow-sm ${
                          promo.status === 'ACTIVE' 
                            ? "text-orange-600 hover:bg-orange-500 hover:text-white dark:text-orange-400" 
                            : "text-green-600 hover:bg-green-500 hover:text-white dark:text-green-400"
                        }`}
                        onClick={() => togglePromoStatus.mutateAsync({ 
                          promotionId: promo.promotionId, 
                          status: promo.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' 
                        })}
                        disabled={togglePromoStatus.isPending}
                      >
                        {promo.status === 'ACTIVE' ? 'STOP' : 'START'}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-12 w-12 p-0 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-2xl transition-all border border-border/50"
                        onClick={() => openEdit(promo)}
                      >
                        <Pencil className="w-5 h-5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-12 w-12 p-0 text-destructive hover:bg-destructive hover:text-white rounded-2xl transition-all border border-border/50"
                        onClick={() => openDeleteDialog(promo.promotionId)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <PromotionFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        promotion={selectedPromo}
        existingPromotions={promotions}
        menuItems={menuItems}
        onSave={handleSave}
        isSaving={createPromo.isPending || updatePromo.isPending}
      />

      <PromotionDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={async () => {
          if (deleteId) {
            await deletePromo.mutateAsync(deleteId);
            setIsDeleteOpen(false);
          }
        }}
        isDeleting={deletePromo.isPending}
      />
    </div>
  );
}
