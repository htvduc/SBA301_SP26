import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { CustomizationDTO } from "@/types/dto";
import { CustomizationType } from "@/types/dto/customization.dto";

interface CustomizationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customization: CustomizationDTO | null;
  onSave: (data: { name: string; price: number; customizationType: CustomizationType }) => Promise<void>;
  isSaving?: boolean;
}

export function CustomizationFormDialog({
  open,
  onOpenChange,
  customization,
  onSave,
  isSaving = false,
}: CustomizationFormDialogProps) {
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formType, setFormType] = useState<CustomizationType>(CustomizationType.ADDON);

  useEffect(() => {
    if (customization) {
      setFormName(customization.name);
      setFormPrice(customization.price.toString());
      setFormType(customization.customizationType || CustomizationType.ADDON);
    } else {
      setFormName("");
      setFormPrice("");
      setFormType(CustomizationType.ADDON);
    }
  }, [customization, open]);

  const handleSave = async () => {
    if (!formName.trim()) return;
    const price = parseFloat(formPrice) || 0;
    await onSave({ name: formName, price, customizationType: formType });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {customization ? "Edit Customization" : "New Customization"}
          </DialogTitle>
          <DialogDescription>
            {customization
              ? "Update customization details"
              : "Add a new topping, size, or add-on"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              placeholder="e.g. Extra Cheese, Size M, Hot/Cold"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={formType} onValueChange={(value) => setFormType(value as CustomizationType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CustomizationType.ADDON}>
                  Add-on (multiple selections allowed, with quantity)
                </SelectItem>
                <SelectItem value={CustomizationType.VARIANT}>
                  Variant (single selection only, no quantity)
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {formType === CustomizationType.ADDON 
                ? "Ví dụ: Trân châu, topping, thạch... (khách có thể chọn nhiều và điều chỉnh số lượng)"
                : "Ví dụ: Size M/L/XL, Đá/Nóng, Ít đường/Nhiều đường... (khách chỉ chọn 1 option)"
              }
            </p>
          </div>
          <div className="space-y-2">
            <Label>Price (đ)</Label>
            <Input
              type="number"
              min="0"
              step="0.5"
              placeholder="0.00"
              value={formPrice}
              onChange={(e) => setFormPrice(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!formName.trim() || isSaving}>
            {isSaving ? "Saving..." : customization ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
