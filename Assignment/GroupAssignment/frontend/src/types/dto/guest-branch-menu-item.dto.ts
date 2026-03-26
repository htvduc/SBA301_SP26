export interface GuestBranchMenuItemDTO {
  branchMenuItemId: string;
  branchId: string;
  menuItemId: string;
  available: boolean;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  categoryId: string;
  imageUrl?: string;
  bestSeller: boolean;
  hasCustomization?: boolean;
}
