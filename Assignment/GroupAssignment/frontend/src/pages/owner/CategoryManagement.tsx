import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, FolderOpen, Loader2 } from "lucide-react";
import { useCategoryQueries } from "@/hooks/queries/useCategoryQueries";
import { useCustomizationQueries } from "@/hooks/queries/useCustomizationQueries";
import { useMenuItemQueries } from "@/hooks/queries/useMenuItemQueries";
import { CategoryFormDialog } from "@/components/menu/CategoryFormDialog";
import { CategoryDeleteDialog } from "@/components/menu/CategoryDeleteDialog";
import type { CategoryDTO } from "@/types/dto";

const CategoryManagement = () => {
  const { id: restaurantId } = useParams<{ id: string }>();
  const { categories, isLoading, createCategory, updateCategory, deleteCategory, isCreating, isUpdating, isDeleting } = useCategoryQueries(restaurantId);
  const { customizations, isLoading: isLoadingCustomizations } = useCustomizationQueries(restaurantId);
  const { menuItems } = useMenuItemQueries(restaurantId);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryDTO | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (cat: CategoryDTO) => {
    setEditing(cat);
    setDialogOpen(true);
  };

  const handleSave = async (data: { name: string; customizationIds: string[] }) => {
    if (!restaurantId) return;
    
    try {
      if (editing) {
        await updateCategory({
          id: editing.id,
          data: {
            id: editing.id,
            name: data.name,
            restaurantId,
            customizationIds: data.customizationIds,
          },
        });
      } else {
        await createCategory({
          name: data.name,
          restaurantId,
          customizationIds: data.customizationIds,
        });
      }
      setDialogOpen(false);
    } catch (error) {
    }
  };

  const openDeleteDialog = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await deleteCategory(deletingId);
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  const getItemCount = (catId: string) => menuItems.filter((mi) => mi.categoryId === catId).length;

  if (isLoading || isLoadingCustomizations) {
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
          <h1 className="text-2xl font-display">Categories</h1>
          <p className="text-sm text-muted-foreground">Organize your menu into categories</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1" /> Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <Card className="glass-card border-border/60">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderOpen className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground font-medium">No categories yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Card key={cat.id} className="glass-card border-border/60 group hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground">{getItemCount(cat.id)} items</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => openDeleteDialog(cat.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cat.customizationIds.length === 0 && (
                    <span className="text-xs text-muted-foreground italic">No customizations</span>
                  )}
                  {cat.customizationIds.map((cid) => {
                    const c = customizations.find((x) => x.id === cid);
                    return c ? (
                      <Badge key={cid} variant="outline" className="text-xs">{c.name}</Badge>
                    ) : null;
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editing}
        customizations={customizations}
        onSave={handleSave}
        isSaving={isCreating || isUpdating}
      />

      <CategoryDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default CategoryManagement;
