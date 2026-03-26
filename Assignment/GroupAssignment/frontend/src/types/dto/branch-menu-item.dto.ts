// Branch Menu Item types for manager
export interface BranchMenuItemDTO {
  menuItemId: string;
  name: string;
  description: string;
  price: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  bestSeller: boolean;
  hasCustomization: boolean;
  restaurantId: string;
  categoryId: string;
  categoryName: string;
  imageUrl: string | null;
  available: boolean;
  discountedPrice?: number;
  branchId: string;
  branchMenuItemId: string | null;
  customizations: CustomizationInfo[];
}

export interface CustomizationInfo {
  customizationId: string;
  name: string;
  price: number;
}
