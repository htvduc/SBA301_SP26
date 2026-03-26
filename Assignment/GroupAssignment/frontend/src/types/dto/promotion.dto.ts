import { MenuItemDTO } from './menu-item.dto';

export enum PromotionType {
  MENU_ITEM = 'MENU_ITEM',
  ORDER = 'ORDER',
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export enum PromotionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
  DELETED = 'DELETED',
}

export interface PromotionDTO {
  promotionId: string;
  name: string;
  description: string;
  code: string;
  promotionType: PromotionType;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscountValue?: number;
  startDate: string;
  endDate: string;
  status: PromotionStatus;
  menuItems: MenuItemDTO[];
}

export interface CreatePromotionRequest {
  name: string;
  description: string;
  code: string;
  promotionType: PromotionType;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscountValue?: number;
  startDate: string;
  endDate: string;
  restaurantId: string;
  menuItemIds?: string[];
}
