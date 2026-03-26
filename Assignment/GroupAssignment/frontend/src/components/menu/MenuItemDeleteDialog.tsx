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

interface MenuItemDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  itemCount: number;
  isDeleting?: boolean;
}

export function MenuItemDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  itemCount,
  isDeleting = false,
}: MenuItemDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete {itemCount} menu item{itemCount > 1 ? "s" : ""}?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              {itemCount > 1 
                ? `You are about to permanently delete ${itemCount} menu items from your restaurant.`
                : "You are about to permanently delete this menu item from your restaurant."
              }
            </p>
            <p className="text-destructive font-medium">
              This action cannot be undone. The {itemCount > 1 ? "items" : "item"} will be removed from all branches and any active orders.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
