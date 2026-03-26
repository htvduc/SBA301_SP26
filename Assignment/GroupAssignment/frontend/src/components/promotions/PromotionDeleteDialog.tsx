import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, AlertTriangle, Trash2, X } from "lucide-react";

interface PromotionDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isDeleting?: boolean;
}

export function PromotionDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: PromotionDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md bg-background border-border shadow-2xl p-0 overflow-hidden rounded-xl">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-destructive z-50" />
        
        <div className="p-8">
          <div className="flex flex-col items-center text-center space-y-4 mb-8">
             <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center shadow-lg shadow-destructive/5 mb-2 border border-destructive/20 scale-110 transition-transform hover:scale-125">
                <Trash2 className="w-8 h-8 text-destructive" />
             </div>
             <div className="space-y-2">
                <AlertDialogTitle className="text-2xl font-black text-foreground tracking-tight">
                  Delete Promotion
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground text-sm font-medium px-4 leading-relaxed">
                  Are you sure you want to delete this promotion? This action is permanent and cannot be undone.
                </AlertDialogDescription>
             </div>
          </div>

          <div className="flex flex-col gap-3">
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                onConfirm();
              }}
              className="h-12 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 font-black shadow-lg shadow-destructive/20 transition-all border-none"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </div>
              ) : (
                "Delete Permanent"
              )}
            </AlertDialogAction>
            <AlertDialogCancel className="h-12 rounded-lg border-border bg-muted/30 hover:bg-muted font-bold transition-all">
              Cancel
            </AlertDialogCancel>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
