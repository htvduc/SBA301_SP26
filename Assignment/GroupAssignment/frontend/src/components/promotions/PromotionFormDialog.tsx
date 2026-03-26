import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tag, Calendar, Info, Search,
  Zap,
  LayoutGrid,
  Clock,
  CheckCircle2,
  Sparkles,
  Plus,
  ChevronRight,
  Pencil,
  AlertCircle,
} from "lucide-react";
import type { PromotionDTO, MenuItemDTO } from "@/types/dto";
import { PromotionType, DiscountType } from "@/types/dto/promotion.dto";

interface PromotionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promotion: PromotionDTO | null;
  existingPromotions: PromotionDTO[];
  menuItems: MenuItemDTO[];
  onSave: (data: any) => Promise<void>;
  isSaving?: boolean;
}

export function PromotionFormDialog({
  open,
  onOpenChange,
  promotion,
  existingPromotions,
  menuItems,
  onSave,
  isSaving = false,
}: PromotionFormDialogProps) {
  const [fName, setFName] = useState("");
  const [fDesc, setFDesc] = useState("");
  const [fCode, setFCode] = useState("");
  const [fPromoType, setFPromoType] = useState<PromotionType>(PromotionType.MENU_ITEM);
  const [fDiscType, setFDiscType] = useState<DiscountType>(DiscountType.PERCENTAGE);
  const [fDiscValue, setFDiscValue] = useState("");
  const [fMinOrder, setFMinOrder] = useState("");
  const [fMaxDisc, setFMaxDisc] = useState("");
  const [fStartDate, setFStartDate] = useState("");
  const [fEndDate, setFEndDate] = useState("");
  const [selectedMenuItemIds, setSelectedMenuItemIds] = useState<Set<string>>(new Set());
  const [searchItem, setSearchItem] = useState("");

  useEffect(() => {
    if (promotion) {
      setFName(promotion.name);
      setFDesc(promotion.description);
      setFCode(promotion.code);
      setFPromoType(promotion.promotionType);
      setFDiscType(promotion.discountType);
      setFDiscValue(promotion.discountValue.toString());
      setFMinOrder(promotion.minOrderValue?.toString() || "");
      setFMaxDisc(promotion.maxDiscountValue?.toString() || "");
      setFStartDate(promotion.startDate.split('T')[0]);
      setFEndDate(promotion.endDate.split('T')[0]);
      setSelectedMenuItemIds(new Set(promotion.menuItems.map(m => (m as any).menuItemId || m.id)));
    } else {
      setFName("");
      setFDesc("");
      setFCode("");
      setFPromoType(PromotionType.MENU_ITEM);
      setFDiscType(DiscountType.PERCENTAGE);
      setFDiscValue("");
      setFMinOrder("");
      setFMaxDisc("");
      setFStartDate(new Date().toISOString().split('T')[0]);
      setFEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setSelectedMenuItemIds(new Set());
    }
  }, [promotion, open]);

  // Keep disabled fields clean to avoid accidental submit
  useEffect(() => {
    if (fPromoType === PromotionType.MENU_ITEM && fMinOrder) setFMinOrder("");
  }, [fPromoType, fMinOrder]);

  useEffect(() => {
    if (fDiscType === DiscountType.FIXED_AMOUNT && fMaxDisc) setFMaxDisc("");
  }, [fDiscType, fMaxDisc]);

  const toggleMenuItem = (id: string) => {
    setSelectedMenuItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    if (!canSave) return;

    await onSave({
      name: fName.trim(),
      description: fDesc?.trim?.() ?? fDesc,
      code: normalizedCode,
      promotionType: fPromoType,
      discountType: fDiscType,
      discountValue: parseFloat(fDiscValue),
      minOrderValue: fMinOrder ? parseFloat(fMinOrder) : undefined,
      maxDiscountValue: fMaxDisc ? parseFloat(fMaxDisc) : undefined,
      startDate: new Date(fStartDate).toISOString(),
      endDate: new Date(fEndDate).toISOString(),
      menuItemIds: fPromoType === PromotionType.MENU_ITEM ? Array.from(selectedMenuItemIds) : [],
    });
  };

  const filteredMenuItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchItem.toLowerCase())
  );

  const getConflictingPromotions = (itemId: string) => {
    if (fPromoType !== PromotionType.MENU_ITEM || !fStartDate || !fEndDate) return [];
    
    const start = new Date(fStartDate).getTime();
    const end = new Date(fEndDate).getTime();
    
    return existingPromotions.filter(p => {
        // Skip current promotion if editing
        if (promotion && p.promotionId === promotion.promotionId) return false;
        
        // Only active promotions
        if (p.status !== 'ACTIVE') return false;
        
        // Check date overlap: (StartA < EndB) && (EndA > StartB)
        const pStart = new Date(p.startDate).getTime();
        const pEnd = new Date(p.endDate).getTime();
        const datesOverlap = start < pEnd && end > pStart;
        
        if (!datesOverlap) return false;
        
        // Check if item is in that promotion
        return p.menuItems.some(item => ((item as any).menuItemId || item.id) === itemId);
    });
  };

  const hasConflicts = fPromoType === PromotionType.MENU_ITEM && 
    Array.from(selectedMenuItemIds).some(id => getConflictingPromotions(id).length > 0);

  // Validations
  const normalizedName = fName.trim();
  const normalizedCode = fCode.trim().replace(/\s+/g, "").toUpperCase();
  const isNameMissing = normalizedName.length === 0;
  const isCodeMissing = normalizedCode.length === 0;
  const isCodeFormatInvalid = !!normalizedCode && !/^[A-Z0-9_-]{3,20}$/.test(normalizedCode);
  const isCodeDuplicate = !!normalizedCode && existingPromotions.some((p) => {
    if (promotion && p.promotionId === promotion.promotionId) return false;
    return (p.code || "").trim().toUpperCase() === normalizedCode;
  });

  const startMs = fStartDate ? new Date(fStartDate).getTime() : NaN;
  const endMs = fEndDate ? new Date(fEndDate).getTime() : NaN;
  const areDatesMissing = !fStartDate || !fEndDate;
  const areDatesUnparseable = (!Number.isFinite(startMs) && !!fStartDate) || (!Number.isFinite(endMs) && !!fEndDate);
  const isDateInvalid = Number.isFinite(startMs) && Number.isFinite(endMs) && startMs > endMs;
  const todayStr = new Date().toISOString().split("T")[0];
  const todayMs = new Date(todayStr).getTime();
  const isStartInPast = Number.isFinite(startMs) && startMs < todayMs;

  const isAmountInvalid = fDiscValue && (parseFloat(fDiscValue) <= 0 || (fDiscType === DiscountType.PERCENTAGE && parseFloat(fDiscValue) > 100));
  const isMinBillInvalid = fMinOrder && parseFloat(fMinOrder) < 0;
  const isMaxOffInvalid = fMaxDisc && parseFloat(fMaxDisc) < 0;

  const isAmountMissing = !fDiscValue;
  const canSave = !isNameMissing &&
                 !isCodeMissing &&
                 !isAmountMissing &&
                 !areDatesMissing &&
                 !areDatesUnparseable &&
                 !isDateInvalid &&
                 !isStartInPast &&
                 !isCodeFormatInvalid &&
                 !isCodeDuplicate &&
                 !isAmountInvalid &&
                 !isMinBillInvalid &&
                 !isMaxOffInvalid &&
                 (fPromoType === PromotionType.ORDER || selectedMenuItemIds.size > 0) &&
                 !hasConflicts &&
                 !isSaving;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-hidden p-0 bg-background border-border shadow-2xl overflow-y-auto rounded-xl">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/60 z-50" />
        
        <div className="relative flex flex-col h-full">
          <DialogHeader className="p-6 border-b bg-muted/5">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                  {promotion ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
               </div>
               <div>
                  <DialogTitle className="text-xl font-bold tracking-tight">
                    {promotion ? "Edit Promotion" : "Add Promotion"}
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground text-xs font-medium">
                    {promotion ? "Update promotion info." : "Add a new discount for your customers."}
                  </DialogDescription>
               </div>
            </div>
          </DialogHeader>

          <div className="flex-1 p-6 space-y-8">
            {/* Section 1: Basic Information */}
            <div className="space-y-4 p-4 rounded-xl bg-primary/[0.02] border border-primary/5">
              <div className="flex items-center gap-2 pb-1 border-b border-primary/10">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Info</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground">Name</Label>
                  <Input
                    placeholder="e.g. Summer Discount"
                    value={fName}
                    onChange={(e) => setFName(e.target.value)}
                    className="h-10 rounded-md focus-visible:ring-primary/20 bg-background"
                  />
                  {isNameMissing && (
                    <p className="text-[10px] text-destructive font-bold mt-1">Name is required.</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground">Code</Label>
                  <Input
                    placeholder="SUMMER20"
                    value={fCode}
                    onChange={(e) => setFCode(e.target.value.replace(/\s+/g, "").toUpperCase())}
                    className={`h-10 rounded-md focus-visible:ring-primary/20 font-mono font-black uppercase bg-background tracking-wider ${isCodeMissing || isCodeFormatInvalid || isCodeDuplicate ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
                  />
                  {isCodeMissing && (
                    <p className="text-[10px] text-destructive font-bold mt-1">Code is required.</p>
                  )}
                  {!isCodeMissing && isCodeFormatInvalid && (
                    <p className="text-[10px] text-destructive font-bold mt-1">
                      Use 3–20 chars: A–Z, 0–9, _ or - (no spaces).
                    </p>
                  )}
                  {!isCodeMissing && !isCodeFormatInvalid && isCodeDuplicate && (
                    <p className="text-[10px] text-destructive font-bold mt-1">
                      Code already exists. Choose another.
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground">Description</Label>
                <Textarea
                  placeholder="Simple description..."
                  value={fDesc}
                  onChange={(e) => setFDesc(e.target.value)}
                  rows={2}
                  className="rounded-md focus-visible:ring-primary/20 resize-none text-sm bg-background"
                />
              </div>
            </div>

            {/* Section 2: Discount Details */}
            <div className="space-y-4 p-4 rounded-xl bg-teal-500/[0.02] border border-teal-500/5">
               <div className="flex items-center gap-2 pb-1 border-b border-teal-500/10">
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-600 dark:text-teal-400">Discount</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground">Apply For</Label>
                  <Select value={fPromoType} onValueChange={(v) => setFPromoType(v as PromotionType)}>
                    <SelectTrigger className="h-10 rounded-md bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PromotionType.MENU_ITEM}>
                        <div className="flex items-center gap-2">
                           <Tag className="w-3.5 h-3.5 text-teal-500" />
                           <span className="font-semibold">Selected Items</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={PromotionType.ORDER}>
                         <div className="flex items-center gap-2">
                           <LayoutGrid className="w-3.5 h-3.5 text-blue-500" />
                           <span className="font-semibold">Whole Bill</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground">Type</Label>
                  <Select value={fDiscType} onValueChange={(v) => setFDiscType(v as DiscountType)}>
                    <SelectTrigger className="h-10 rounded-md bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={DiscountType.PERCENTAGE} className="font-semibold">Percent (%)</SelectItem>
                      <SelectItem value={DiscountType.FIXED_AMOUNT} className="font-semibold">Money (VND)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground">Amount</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={fDiscValue}
                      onChange={(e) => setFDiscValue(e.target.value)}
                      className={`h-10 rounded-md focus-visible:ring-primary/20 pl-7 font-black bg-background text-primary ${isAmountInvalid ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-black text-xs">
                       {fDiscType === DiscountType.PERCENTAGE ? '%' : '₫'}
                    </div>
                  </div>
                  {isAmountMissing && (
                    <p className="text-[10px] text-destructive font-bold mt-1">Amount is required.</p>
                  )}
                  {isAmountInvalid && (
                    <p className="text-[10px] text-destructive font-bold mt-1">
                      {parseFloat(fDiscValue) <= 0 ? "Must be &gt; 0" : "Max 100%"}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground">Min Bill</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="Optional"
                      value={fMinOrder}
                      onChange={(e) => setFMinOrder(e.target.value)}
                      disabled={fPromoType === PromotionType.MENU_ITEM}
                      className={`h-10 rounded-md focus-visible:ring-primary/20 disabled:opacity-50 bg-background font-semibold ${isMinBillInvalid ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
                    />
                  </div>
                  {isMinBillInvalid && (
                    <p className="text-[10px] text-destructive font-bold mt-1">Must be &gt;= 0</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground">Max Off</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="Optional"
                      value={fMaxDisc}
                      onChange={(e) => setFMaxDisc(e.target.value)}
                      disabled={fDiscType === DiscountType.FIXED_AMOUNT}
                      className={`h-10 rounded-md focus-visible:ring-primary/20 disabled:opacity-50 bg-background font-semibold ${isMaxOffInvalid ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
                    />
                  </div>
                  {isMaxOffInvalid && (
                    <p className="text-[10px] text-destructive font-bold mt-1">Must be &gt;= 0</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Schedule */}
            <div className="space-y-4 p-4 rounded-xl bg-orange-500/[0.02] border border-orange-500/5">
              <div className="flex items-center gap-2 pb-1 border-b border-orange-500/10">
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400">Time</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground">From</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orange-500" />
                    <Input
                      type="date"
                      value={fStartDate}
                      onChange={(e) => setFStartDate(e.target.value)}
                      className={`h-10 rounded-md focus-visible:ring-primary/20 pl-9 bg-background font-medium ${isDateInvalid ? 'border-destructive focus-visible:ring-destructive/20 text-destructive' : ''}`}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground">To</Label>
                   <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orange-500" />
                    <Input
                      type="date"
                      value={fEndDate}
                      onChange={(e) => setFEndDate(e.target.value)}
                      className={`h-10 rounded-md focus-visible:ring-primary/20 pl-9 bg-background font-medium ${isDateInvalid ? 'border-destructive focus-visible:ring-destructive/20 text-destructive' : ''}`}
                    />
                  </div>
                </div>
              </div>
              {areDatesMissing && (
                <div className="flex items-center gap-2 mt-2 text-destructive">
                   <AlertCircle className="w-3.5 h-3.5" />
                   <p className="text-[10px] font-black uppercase">Start/End date is required.</p>
                </div>
              )}
              {!areDatesMissing && areDatesUnparseable && (
                <div className="flex items-center gap-2 mt-2 text-destructive">
                   <AlertCircle className="w-3.5 h-3.5" />
                   <p className="text-[10px] font-black uppercase">Invalid date value.</p>
                </div>
              )}
              {!areDatesMissing && !areDatesUnparseable && isStartInPast && (
                <div className="flex items-center gap-2 mt-2 text-destructive">
                   <AlertCircle className="w-3.5 h-3.5" />
                   <p className="text-[10px] font-black uppercase">"From" date cannot be in the past.</p>
                </div>
              )}
              {!areDatesMissing && !areDatesUnparseable && isDateInvalid && (
                <div className="flex items-center gap-2 mt-2 text-destructive">
                   <AlertCircle className="w-3.5 h-3.5" />
                   <p className="text-[10px] font-black uppercase">"From" date must be before "To" date.</p>
                </div>
              )}
            </div>

            {/* Section 4: Item Targeting */}
            <AnimatePresence mode="wait">
              {fPromoType === PromotionType.MENU_ITEM && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 pt-4 border-t"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-teal-600">Choose Items</span>
                    </div>
                    <div className="relative w-48 group">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-teal-500 transition-colors" />
                      <Input 
                        placeholder="Search items..." 
                        value={searchItem}
                        onChange={(e) => setSearchItem(e.target.value)}
                        className="h-8 pl-8 text-xs rounded-md bg-muted/20 border-muted focus-visible:ring-teal-500/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[200px] overflow-y-auto pr-1">
                    {filteredMenuItems.map((item) => {
                      const itemId = (item as any).menuItemId || item.id;
                      const isSelected = selectedMenuItemIds.has(itemId);
                      const conflicts = getConflictingPromotions(itemId);
                      const hasConflict = conflicts.length > 0;
                      
                      return (
                        <div 
                          key={itemId}
                          onClick={() => toggleMenuItem(itemId)}
                          className={`p-3 rounded-lg border transition-all cursor-pointer relative flex flex-col justify-between h-24 ${
                            isSelected
                              ? hasConflict 
                                ? "border-destructive bg-destructive/5 shadow-sm shadow-destructive/5"
                                : "border-teal-500 bg-teal-500/5 shadow-sm shadow-teal-500/5"
                              : "border-border bg-card hover:bg-muted/50"
                          }`}
                        >
                          {isSelected && (
                             <div className="absolute top-2 right-2">
                                {hasConflict ? (
                                   <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                                ) : (
                                   <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                                )}
                             </div>
                          )}
                          <div className="space-y-1">
                            <span className={`text-[11px] font-bold leading-tight line-clamp-2 ${isSelected ? hasConflict ? 'text-destructive' : 'text-teal-600' : 'text-foreground'}`}>
                              {item.name}
                            </span>
                            {isSelected && hasConflict && (
                               <p className="text-[9px] text-destructive font-black uppercase leading-tight animate-pulse">
                                 Time overlaps: {conflicts[0].name}
                               </p>
                            )}
                          </div>
                          <span className="text-[10px] font-black text-muted-foreground">
                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.price)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {selectedMenuItemIds.size === 0 && (
                    <div className="flex items-center gap-2 p-2 rounded-md bg-destructive/10 border border-destructive/20 text-destructive">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <p className="text-[10px] font-black uppercase tracking-tight">Please select items.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-6 border-t flex justify-end gap-3 bg-muted/5">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={isSaving} 
              className="h-10 px-4 rounded-lg font-bold hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 transition-all"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!canSave}
              className="h-10 px-8 rounded-lg font-black bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 shadow-md shadow-primary/10 border-none disabled:grayscale disabled:opacity-50"
            >
              {isSaving ? "Saving..." : (promotion ? "Save Changes" : "Add Promotion")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
