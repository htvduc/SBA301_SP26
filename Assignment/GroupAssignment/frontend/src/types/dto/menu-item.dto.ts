// Backend response types
interface MenuItemBackendDTO {
  menuItemId: string;
  name: string;
  description: string;
  price: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  bestSeller: boolean;
  hasCustomization: boolean;
  categoryId: string;
  restaurantId: string;
  customizationIds: string[];
  imageUrl: string | null;
  discountedPrice?: number;
}

export interface MediaDTO {
  id: string;
  url: string;
  publicId: string;
  targetType: string;
  targetId: string;
}

// Frontend types (mapped from backend)
export interface MenuItemDTO {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  restaurantId: string;
  isBestSeller: boolean;
  isActive: boolean;
  hasCustomization: boolean;
  media: MediaDTO | null;
  customizations: string[];
  discountedPrice?: number;
}

export interface MenuItemCreateRequest {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  restaurantId: string;
  isBestSeller: boolean;
  customizationIds: string[];
}

// Mapper function
export function mapMenuItemFromBackend(backend: MenuItemBackendDTO): MenuItemDTO {
  return {
    id: backend.menuItemId,
    name: backend.name,
    description: backend.description,
    price: backend.price,
    categoryId: backend.categoryId,
    restaurantId: backend.restaurantId,
    isBestSeller: backend.bestSeller,
    isActive: backend.status === 'ACTIVE',
    hasCustomization: backend.hasCustomization,
    media: backend.imageUrl ? {
      id: '',
      url: backend.imageUrl,
      publicId: '',
      targetType: 'MENU_ITEM_IMAGE',
      targetId: backend.menuItemId,
    } : null,
    customizations: backend.customizationIds || [],
    discountedPrice: backend.discountedPrice,
  };
}
