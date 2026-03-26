import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Settings2, Search, Loader2, Info } from "lucide-react";
import { useCustomizationQueries } from "@/hooks/queries/useCustomizationQueries";
import { useCustomizationLimit } from "@/hooks/useFeatureLimits";
import { CustomizationFormDialog } from "@/components/menu/CustomizationFormDialog";
import { CustomizationDeleteDialog } from "@/components/menu/CustomizationDeleteDialog";
import type { CustomizationDTO } from "@/types/dto";
import { CustomizationType } from "@/types/dto/customization.dto";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formatVND = (value: number): string =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const CustomizationManagement = () => {
  const { id: restaurantId } = useParams<{ id: string }>();
  const { customizations, isLoading, createCustomization, updateCustomization, deleteCustomization, isCreating, isUpdating, isDeleting } = useCustomizationQueries(restaurantId);
  const { data: customizationLimit } = useCustomizationLimit(restaurantId);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CustomizationDTO | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (c: CustomizationDTO) => {
    setEditing(c);
    setDialogOpen(true);
  };

  const handleSave = async (data: { name: string; price: number; customizationType: CustomizationType }) => {
    if (!restaurantId) return;
    
    if (editing) {
      await updateCustomization({
        id: editing.id,
        data: {
          id: editing.id,
          name: data.name,
          price: data.price,
          restaurantId,
          customizationType: data.customizationType,
        },
      });
    } else {
      await createCustomization({
        name: data.name,
        price: data.price,
        restaurantId,
        customizationType: data.customizationType,
      });
    }
    setDialogOpen(false);
  };

  const openDeleteDialog = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await deleteCustomization(deletingId);
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  const filtered = useMemo(() => {
    return customizations.filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [customizations, search]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display">Customizations</h1>
          <p className="text-sm text-muted-foreground">Manage toppings, sizes, and add-ons</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1" /> Add Customization
        </Button>
      </div>

      {/* Limit Info */}
      {customizationLimit !== null && customizationLimit !== undefined && customizationLimit !== -1 && customizationLimit > 0 && (
        <Alert className="mb-6 border-primary/50 bg-primary/5">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            Limit: {customizationLimit} customizations per category. This limit applies when assigning customizations to categories.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card className="glass-card border-border/60">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Settings2 className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground font-medium">No customizations found</p>
            <p className="text-xs text-muted-foreground">Create one to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <Card key={c.id} className="glass-card border-border/60 group hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{c.name}</h3>
                      <Badge variant={c.customizationType === CustomizationType.VARIANT ? "secondary" : "default"} className="text-[10px]">
                        {c.customizationType === CustomizationType.VARIANT ? "Variant" : "Add-on"}
                      </Badge>
                    </div>
                    <p className="text-lg font-display text-primary mt-1">
                      {c.price > 0 ? formatVND(c.price) : "Free"}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => openDeleteDialog(c.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CustomizationFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customization={editing}
        onSave={handleSave}
        isSaving={isCreating || isUpdating}
      />

      <CustomizationDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default CustomizationManagement;
