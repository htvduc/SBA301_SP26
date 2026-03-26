export type FeatureCode =
  | "LIMIT_MENU_ITEMS"
  | "LIMIT_BRANCH_CREATION"
  | "LIMIT_CUSTOMIZATION_PER_CATEGORY"
  | "UNLIMITED_BRANCH_CREATION";

export interface FeatureDTO {
  id?: string;
  name: string;
  description?: string;
  code?: FeatureCode;
  hasValue: boolean;
}

export interface FeatureValueDTO {
  featureId?: string;
  featureName: string;
  description?: string;
  featureCode?: FeatureCode;
  value?: number | null;
}

export interface PackageFeatureDTO {
  packageId?: string;
  name: string;
  description?: string;
  price: number;
  billingPeriod: number;
  available: boolean;
  features: FeatureValueDTO[];
  activeSubscriptionCount?: number;
}

