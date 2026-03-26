import { useState, useMemo } from "react";
import { useBranchContext } from "@/hooks/useBranchContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ImageIcon, X, Loader2, Star } from "lucide-react";
import { useBranchMenuItemQueries } from "@/hooks/queries/useBranchMenuItemQueries";
import type { BranchMenuItemDTO } from "@/types/dto/branch-menu-item.dto";

const formatVND = (value: number): string =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const ManagerMenuManagement = () => {
  const { branchId } = useBranchContext();

  const { menuItems, isLoading, updateAvailability, isUpdating } = useBranchMenuItemQueries(branchId);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  // Filters
  const [searchQ, setSearchQ] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterAvailability, setFilterAvailability] = useState("all");
  const [filterBestSeller, setFilterBestSeller] = useState(false);

  const categories = useMemo(() => {
    const catMap = new Map<string, string>();
    menuItems.forEach((item) => {
      if (item.categoryId && item.categoryName) {
        catMap.set(item.categoryId, item.categoryName);
      }
    });
    return Array.from(catMap.entries()).map(([id, name]) => ({ id, name }));
  }, [menuItems]);

  const filtered = useMemo(() => {
    return menuItems.filter((i) => {
      if (searchQ && !i.name.toLowerCase().includes(searchQ.toLowerCase())) return false;
      if (filterCat !== "all" && i.categoryId !== filterCat) return false;
      if (filterStatus === "active" && i.status !== "ACTIVE") return false;
      if (filterStatus === "inactive" && i.status === "ACTIVE") return false;
      if (filterAvailability === "available" && !i.available) return false;
      if (filterAvailability === "unavailable" && i.available) return false;
      if (filterBestSeller && !i.bestSeller) return false;
      return true;
    });
  }, [menuItems, searchQ, filterCat, filterStatus, filterAvailability, filterBestSeller]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAvailability = async (menuItemId: string, currentAvailability: boolean) => {
    await updateAvailability({ menuItemId, available: !currentAvailability });
  };

  const bulkAvailabilityChange = async (available: boolean) => {
    setIsBulkUpdating(true);
    try {
      const ids = Array.from(selectedIds);
      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      for (const id of ids) {
        try {
          await updateAvailability({ menuItemId: id, available });
          successCount++;
        } catch (error: any) {
          failedCount++;
          const errorMsg = error?.response?.data?.message;
          if (errorMsg && !errors.includes(errorMsg)) {
            errors.push(errorMsg);
          }
        }
      }

      const { toast } = await import('@/hooks/use-toast');
      
      if (successCount > 0) {
        toast({
          title: 'Success',
          description: `${successCount} item${successCount > 1 ? 's' : ''} ${available ? 'made available' : 'made unavailable'}`,
        });
      }
      
      if (failedCount > 0) {
        toast({
          title: 'Warning',
          description: `${failedCount} item${failedCount > 1 ? 's' : ''} could not be updated. ${errors.length > 0 ? errors[0] : ''}`,
          variant: 'destructive',
        });
      }

      setSelectedIds(new Set());
    } finally {
      setIsBulkUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display">Menu Management</h1>
          <p className="text-sm text-muted-foreground">
            {menuItems.length} items total · {menuItems.filter((i) => i.available).length} available
          </p>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => bulkAvailabilityChange(true)}
            disabled={isBulkUpdating}
          >
            {isBulkUpdating ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : null}
            Make Available
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => bulkAvailabilityChange(false)}
            disabled={isBulkUpdating}
          >
            {isBulkUpdating ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : null}
            Make Unavailable
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => setSelectedIds(new Set())}
            disabled={isBulkUpdating}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterAvailability} onValueChange={setFilterAvailability}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="unavailable">Unavailable</SelectItem>
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={filterBestSeller}
            onCheckedChange={(v) => setFilterBestSeller(!!v)}
          />
          <span className="text-sm">Best Sellers Only</span>
        </label>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <Card className="glass-card border-border/60">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ImageIcon className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground font-medium">No menu items found</p>
            <p className="text-xs text-muted-foreground">Try adjusting filters</p>
          </CardContent>đ
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <MenuItemCard
              key={item.menuItemId}
              item={item}
              isSelected={selectedIds.has(item.menuItemId)}
              onToggleSelect={() => toggleSelect(item.menuItemId)}
              onToggleAvailability={() => toggleAvailability(item.menuItemId, item.available)}
              isUpdating={isUpdating}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface MenuItemCardProps {
  item: BranchMenuItemDTO;
  isSelected: boolean;
  onToggleSelect: () => void;
  onToggleAvailability: () => void;
  isUpdating: boolean;
}

const MenuItemCard = ({
  item,
  isSelected,
  onToggleSelect,
  onToggleAvailability,
  isUpdating,
}: MenuItemCardProps) => {
  return (
    <Card
      className={`glass-card border-border/60 group hover:shadow-md transition-all overflow-hidden ${
        isSelected ? "ring-2 ring-primary" : ""
      } ${!item.available ? "opacity-70" : ""}`}
    >
      {/* Image */}
      <div className="relative h-40 bg-muted/50 flex items-center justify-center overflow-hidden">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
        )}
        {/* Select checkbox */}
        <div className="absolute top-2 left-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelect}
            className="bg-background/80 backdrop-blur-sm"
          />
        </div>
        {item.bestSeller && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-amber/90 text-foreground text-xs gap-1">
              <Star className="w-3 h-3 fill-current" /> Best Seller
            </Badge>
          </div>
        )}
        <div className="absolute bottom-2 right-2 flex gap-1">
          <Badge
            variant={item.status === "ACTIVE" ? "default" : "secondary"}
            className={`text-xs ${item.status === "ACTIVE" ? "bg-teal text-foreground" : ""}`}
          >
            {item.status === "ACTIVE" ? "Active" : "Inactive"}
          </Badge>
          <Badge
            variant={item.available ? "default" : "secondary"}
            className={`text-xs ${item.available ? "bg-green-600 text-white" : ""}`}
          >
            {item.available ? "Available" : "Unavailable"}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-1">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{item.name}</h3>
            <Badge variant="outline" className="text-[10px] mt-1">
              {item.categoryName}
            </Badge>
          </div>
          <div className="ml-2 text-right">
            {item.discountedPrice != null && item.discountedPrice < item.price ? (
              <>
                <p className="font-display text-primary">{formatVND(item.discountedPrice)}</p>
                <p className="text-[11px] text-muted-foreground line-through">{formatVND(item.price)}</p>
              </>
            ) : (
              <p className="font-display text-primary">{formatVND(item.price)}</p>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-2 mb-3">{item.description}</p>
        {item.customizations && item.customizations.length > 0 && (
          <p className="text-xs text-muted-foreground mb-3">
            {item.customizations.length} customization{item.customizations.length > 1 ? 's' : ''}
          </p>
        )}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs flex-1"
            onClick={onToggleAvailability}
            disabled={isUpdating || item.status !== "ACTIVE"}
          >
            {item.available ? "Make Unavailable" : "Make Available"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManagerMenuManagement;
