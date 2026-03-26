import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
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
import {
  Plus, Pencil, Trash2, Star, Search, ImageIcon, X, Loader2,
} from "lucide-react";
import { useMenuItemQueries } from "@/hooks/queries/useMenuItemQueries";
import { useCategoryQueries } from "@/hooks/queries/useCategoryQueries";
import { useCustomizationQueries } from "@/hooks/queries/useCustomizationQueries";
import { useMenuItemLimit, useCanCreateMenuItem } from "@/hooks/useFeatureLimits";
import { MenuItemFormDialog } from "@/components/menu/MenuItemFormDialog";
import { MenuItemDeleteDialog } from "@/components/menu/MenuItemDeleteDialog";
import type { MenuItemDTO } from "@/types/dto";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";

const formatVND = (value: number): string =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const MenuItemManagement = () => {
  const { id: restaurantId } = useParams<{ id: string }>();
  const { menuItems, isLoading, createMenuItem, updateMenuItem, deleteMenuItem, setActiveStatus, isCreating, isUpdating, isDeleting } = useMenuItemQueries(restaurantId);
  const { categories, isLoading: isLoadingCategories } = useCategoryQueries(restaurantId);
  const { customizations } = useCustomizationQueries(restaurantId);
  const { data: menuItemLimit } = useMenuItemLimit(restaurantId);
  const { data: canCreate } = useCanCreateMenuItem(restaurantId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItemDTO | null>(null);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  // Filters
  const [searchQ, setSearchQ] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterBestSeller, setFilterBestSeller] = useState(false);
  

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (item: MenuItemDTO) => {
    setEditing(item);
    setDialogOpen(true);
  };

  const handleSave = async (data: {
    name: string;
    description: string;
    price: number;
    categoryId: string;
    isBestSeller: boolean;
    customizationIds: string[];
    imageFile?: File;
  }) => {
    if (!restaurantId) return;

    const requestData = {
      name: data.name,
      description: data.description,
      price: data.price,
      categoryId: data.categoryId,
      restaurantId,
      isBestSeller: data.isBestSeller,
      customizationIds: data.customizationIds,
    };

    if (editing) {
      await updateMenuItem({
        id: editing.id,
        data: requestData,
        imageFile: data.imageFile,
      });
    } else {
      await createMenuItem({
        data: requestData,
        imageFile: data.imageFile,
      });
    }
    setDialogOpen(false);
  };

  const openDeleteDialog = (ids: string[]) => {
    setDeletingIds(ids);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    for (const id of deletingIds) {
      await deleteMenuItem(id);
    }
    setDeletingIds([]);
    setSelectedIds(new Set());
    setDeleteDialogOpen(false);
  };

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

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    await setActiveStatus({ menuItemId: id, active: newStatus });
    
    const { toast } = await import('@/hooks/use-toast');
    const item = menuItems.find(i => i.id === id);
    toast({
      title: newStatus ? 'Item activated' : 'Item deactivated',
      description: `${item?.name || 'Menu item'} has been ${newStatus ? 'activated' : 'deactivated'} successfully`,
    });
  };

  const bulkStatusChange = async (active: boolean) => {
    setIsBulkUpdating(true);
    try {
      const ids = Array.from(selectedIds);
      let successCount = 0;
      
      for (const id of ids) {
        try {
          await setActiveStatus({ menuItemId: id, active });
          successCount++;
        } catch (error) {
        }
      }
      
      if (successCount > 0) {
        const { toast } = await import('@/hooks/use-toast');
        toast({
          title: 'Success',
          description: `${successCount} item${successCount > 1 ? 's' : ''} ${active ? 'activated' : 'deactivated'} successfully`,
        });
      }
      
      setSelectedIds(new Set());
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const filtered = useMemo(() => {
    return menuItems.filter((i) => {
      if (searchQ && !i.name.toLowerCase().includes(searchQ.toLowerCase())) return false;
      if (filterCat !== "all" && i.categoryId !== filterCat) return false;
      if (filterStatus === "active" && !i.isActive) return false;
      if (filterStatus === "inactive" && i.isActive) return false;
      if (filterBestSeller && !i.isBestSeller) return false;
      return true;
    });
  }, [menuItems, searchQ, filterCat, filterStatus, filterBestSeller]);

  const getCatName = (catId: string) => categories.find((c) => c.id === catId)?.name ?? "Uncategorized";

  const limitInfo = useMemo(() => {
    if (menuItemLimit === null || menuItemLimit === undefined) return null;
    if (menuItemLimit === -1) return { type: 'unlimited', message: 'Unlimited menu items' };
    if (menuItemLimit === 0) return { type: 'no-subscription', message: 'No active subscription' };
    return {
      type: 'limited',
      message: `${menuItems.length} / ${menuItemLimit} menu items used`,
      isNearLimit: menuItems.length >= menuItemLimit * 0.8,
      isAtLimit: !canCreate
    };
  }, [menuItemLimit, menuItems.length, canCreate]);

  if (isLoading || isLoadingCategories) {
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
          <h1 className="text-2xl font-display">Menu Items</h1>
          <p className="text-sm text-muted-foreground">{menuItems.length} items total · {menuItems.filter((i) => i.isActive).length} active</p>
        </div>
        <Button onClick={openCreate} disabled={canCreate === false}>
          <Plus className="w-4 h-4 mr-1" /> Add Item
        </Button>
      </div>

      {/* Limit Info */}
      {limitInfo && limitInfo.type === 'limited' && (
        <Alert className={`mb-6 ${limitInfo.isAtLimit ? 'border-destructive/50 bg-destructive/5' : limitInfo.isNearLimit ? 'border-amber/50 bg-amber/5' : 'border-primary/50 bg-primary/5'}`}>
          {limitInfo.isAtLimit ? (
            <AlertCircle className="h-4 w-4 text-destructive" />
          ) : limitInfo.isNearLimit ? (
            <AlertCircle className="h-4 w-4 text-amber" />
          ) : (
            <Info className="h-4 w-4 text-primary" />
          )}
          <AlertDescription className="text-sm">
            {limitInfo.message}
            {limitInfo.isAtLimit && (
              <span className="ml-2 font-medium">
                You've reached your menu item limit. Upgrade your plan to add more items.
              </span>
            )}
            {limitInfo.isNearLimit && !limitInfo.isAtLimit && (
              <span className="ml-2">
                You're approaching your limit. Consider upgrading your plan.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => bulkStatusChange(true)}
            disabled={isBulkUpdating}
          >
            {isBulkUpdating ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : null}
            Activate
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => bulkStatusChange(false)}
            disabled={isBulkUpdating}
          >
            {isBulkUpdating ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : null}
            Deactivate
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => openDeleteDialog(Array.from(selectedIds))}
            disabled={isBulkUpdating}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
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
          <Input placeholder="Search by name..." value={searchQ} onChange={(e) => setSearchQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox checked={filterBestSeller} onCheckedChange={(v) => setFilterBestSeller(!!v)} />
          <span className="text-sm">Best Sellers Only</span>
        </label>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <Card className="glass-card border-border/60">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ImageIcon className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground font-medium">No menu items found</p>
            <p className="text-xs text-muted-foreground">Try adjusting filters or add a new item</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <Card
              key={item.id}
              className={`glass-card border-border/60 group hover:shadow-md transition-all overflow-hidden ${selectedIds.has(item.id) ? "ring-2 ring-primary" : ""
                } ${!item.isActive ? "opacity-70" : ""}`}
            >
              {/* Image */}
              <div className="relative h-40 bg-muted/50 flex items-center justify-center overflow-hidden">
                {item.media?.url ? (
                  <img src={item.media.url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
                )}
                {/* Select checkbox */}
                <div className="absolute top-2 left-2">
                  <Checkbox
                    checked={selectedIds.has(item.id)}
                    onCheckedChange={() => toggleSelect(item.id)}
                    className="bg-background/80 backdrop-blur-sm"
                  />
                </div>
                {item.isBestSeller && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-amber/90 text-foreground text-xs gap-1">
                      <Star className="w-3 h-3 fill-current" /> Best Seller
                    </Badge>
                  </div>
                )}
                <div className="absolute bottom-2 right-2">
                  <Badge variant={item.isActive ? "default" : "secondary"} className={`text-xs ${item.isActive ? "bg-teal text-foreground" : ""}`}>
                    {item.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                    <Badge variant="outline" className="text-[10px] mt-1">{getCatName(item.categoryId)}</Badge>
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
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openEdit(item)}>
                    <Pencil className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toggleStatus(item.id, item.isActive)}>
                    {item.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => openDeleteDialog([item.id])}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <MenuItemFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        menuItem={editing}
        categories={categories}
        customizations={customizations}
        onSave={handleSave}
        isSaving={isCreating || isUpdating}
      />

      <MenuItemDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        itemCount={deletingIds.length}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default MenuItemManagement;
