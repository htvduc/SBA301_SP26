export interface CategoryDTO {
  id: string;
  name: string;
  restaurantId: string;
  customizationIds: string[];
}

export interface CategoryCreateRequest {
  name: string;
  restaurantId: string;
  customizationIds: string[];
}
