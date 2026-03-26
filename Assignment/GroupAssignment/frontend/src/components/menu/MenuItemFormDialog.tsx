import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
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
import { ImageIcon, X, Settings2 } from "lucide-react";
import type { MenuItemDTO, CategoryDTO, CustomizationDTO } from "@/types/dto";

const formatVND = (value: number): string =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

interface MenuItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuItem: MenuItemDTO | null;
  categories: CategoryDTO[];
  customizations: CustomizationDTO[];
  onSave: (data: {
    name: string;
    description: string;
    price: number;
    categoryId: string;
    isBestSeller: boolean;
    customizationIds: string[];
    imageFile?: File;
  }) => Promise<void>;
  isSaving?: boolean;
}

export function MenuItemFormDialog({
  open,
  onOpenChange,
  menuItem,
  categories,
  customizations,
  onSave,
  isSaving = false,
}: MenuItemFormDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fName, setFName] = useState("");
  const [fDesc, setFDesc] = useState("");
  const [fPrice, setFPrice] = useState("");
  const [fImageFile, setFImageFile] = useState<File | null>(null);
  const [fImagePreview, setFImagePreview] = useState("");
  const [fCatId, setFCatId] = useState("");
  const [fBestSeller, setFBestSeller] = useState(false);
  const [fActive, setFActive] = useState(true);
  const [selectedCustIds, setSelectedCustIds] = useState<Set<string>>(new Set());

  const categoryCustomizations = useMemo(() => {
    if (!fCatId) return [];
    const selectedCategory = categories.find((c) => c.id === fCatId);
    if (!selectedCategory) return [];

    // Get customizations that belong to this category
    const categoryCustomizationIds = selectedCategory.customizationIds || [];
    return customizations.filter((cust) =>
      categoryCustomizationIds.includes(cust.id)
    );
  }, [fCatId, categories, customizations]);

  // All available customizations for the restaurant (not filtered by category)
  const allCustomizations = useMemo(() => {
    const filtered = customizations.filter((cust) => cust.restaurantId === (menuItem?.restaurantId || categories[0]?.restaurantId));
    return filtered;
  }, [customizations, menuItem, categories, selectedCustIds]);

  useEffect(() => {
    if (menuItem) {
      setFName(menuItem.name);
      setFDesc(menuItem.description);
      setFPrice(menuItem.price.toString());
      setFImageFile(null);
      setFImagePreview(menuItem.media?.url || "");
      setFCatId(menuItem.categoryId);
      setFBestSeller(menuItem.isBestSeller);
      setFActive(menuItem.isActive);
      // Fix: Make sure to use the customizations array from the menuItem
      const custIds = new Set(menuItem.customizations || []);
      setSelectedCustIds(custIds);
    } else {
      setFName("");
      setFDesc("");
      setFPrice("");
      setFImageFile(null);
      setFImagePreview("");
      setFCatId("");
      setFBestSeller(false);
      setFActive(true);
      setSelectedCustIds(new Set());
    }
  }, [menuItem, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFImageFile(null);
    setFImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleCustomization = (id: string) => {
    setSelectedCustIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!fName.trim() || !fCatId) return;
    const price = parseFloat(fPrice) || 0;

    await onSave({
      name: fName,
      description: fDesc,
      price,
      categoryId: fCatId,
      isBestSeller: fBestSeller,
      customizationIds: Array.from(selectedCustIds),
      imageFile: fImageFile || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{menuItem ? "Edit Menu Item" : "New Menu Item"}</DialogTitle>
          <DialogDescription>
            {menuItem ? "Update item details" : "Add a new dish to your menu"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-2">
          {/* Image */}
          <div className="space-y-2">
            <Label>Image</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              {fImageFile ? "Change Image" : "Upload Image"}
            </Button>
            {fImagePreview && (
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-muted/50 shadow-sm">
                <img
                  src={fImagePreview}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={handleRemoveImage}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                placeholder="e.g. Spring Rolls"
                value={fName}
                onChange={(e) => setFName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Price *</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                placeholder="0.00"
                value={fPrice}
                onChange={(e) => setFPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Describe the dish..."
              value={fDesc}
              onChange={(e) => setFDesc(e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={fCatId} onValueChange={setFCatId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex flex-col justify-end gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={fBestSeller}
                  onCheckedChange={(v) => setFBestSeller(!!v)}
                />
                <span className="text-sm">Best Seller</span>
              </label>
              <div className="flex items-center gap-2">
                <Switch checked={fActive} onCheckedChange={setFActive} />
                <span className="text-sm">
                  {fActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Customizations - show both category and individual customizations */}
          {fCatId && (
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-primary" />
                <Label className="text-base font-semibold">Customizations</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Select which customizations are available for this item. This includes both category-level and item-specific customizations.
              </p>


              {/* Category Customizations */}
              {categoryCustomizations.length > 0 && (
                <div className="space-y-2">
                  <h6 className="text-sm font-medium text-gray-700">From Category ({categories.find(c => c.id === fCatId)?.name})</h6>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {categoryCustomizations.map((c) => (
                      <label
                        key={c.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedCustIds.has(c.id)
                            ? "border-primary/50 bg-primary/5"
                            : "border-border/60 hover:bg-muted/30"
                        }`}
                      >
                        <Checkbox
                          checked={selectedCustIds.has(c.id)}
                          onCheckedChange={() => toggleCustomization(c.id)}
                          className="rounded-none"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium">{c.name}</span>
                        </div>
                        {c.price > 0 && (
                          <Badge variant="secondary" className="text-xs shrink-0">
                            +{formatVND(c.price)}
                          </Badge>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* All Restaurant Customizations */}
              {allCustomizations.length > 0 && (
                <div className="space-y-2">
                  <h6 className="text-sm font-medium text-gray-700">Additional Customizations</h6>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {allCustomizations
                      .filter(c => !categoryCustomizations.some(cc => cc.id === c.id)) // Exclude already shown category customizations
                      .map((c) => (
                      <label
                        key={c.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedCustIds.has(c.id)
                            ? "border-primary/50 bg-primary/5"
                            : "border-border/60 hover:bg-muted/30"
                        }`}
                      >
                        <Checkbox
                          checked={selectedCustIds.has(c.id)}
                          onCheckedChange={() => toggleCustomization(c.id)}
                          className="rounded-none"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium">{c.name}</span>
                        </div>
                        {c.price > 0 && (
                          <Badge variant="secondary" className="text-xs shrink-0">
                            +{formatVND(c.price)}
                          </Badge>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {selectedCustIds.size > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedCustIds.size} customization{selectedCustIds.size > 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          )}

          {fCatId && categoryCustomizations.length === 0 && allCustomizations.length === 0 && (
            <div className="space-y-3 border-t pt-4">
              <Label className="text-base font-semibold">Customizations</Label>
              <p className="text-xs text-muted-foreground italic">
                No customizations available for this restaurant.
              </p>
            </div>
          )}

          {!fCatId && (
            <div className="space-y-3 border-t pt-4">
              <Label className="text-base font-semibold">Customizations</Label>
              <p className="text-xs text-muted-foreground italic">
                Select a category first to see available customizations.
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!fName.trim() || !fCatId || isSaving}>
            {isSaving ? "Saving..." : menuItem ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
