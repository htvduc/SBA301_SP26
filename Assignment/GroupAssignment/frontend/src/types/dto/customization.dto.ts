export enum CustomizationType {
  ADDON = 'ADDON',     // Có thể chọn nhiều, có quantity (trân châu, topping...)
  VARIANT = 'VARIANT'  // Chỉ chọn 1, không có quantity (size M/L/XL, đá/nóng...)
}

export interface CustomizationDTO {
  id: string;
  name: string;
  price: number;
  restaurantId: string;
  customizationType: CustomizationType;
}

export interface CustomizationCreateRequest {
  name: string;
  price: number;
  restaurantId: string;
  customizationType: CustomizationType;
}
