// ============ INTERFACES ============

export interface MenuCategory {
  id: string;
  name: string;
  order: number;
  customizationIds: string[];
}

export interface Customization {
  id: string;
  name: string;
  price: number;
  assignType: "category" | "menuItem";
  assignId: string; // categoryId or menuItemId
}

export interface MenuItemFull {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  isBestSeller: boolean;
  isActive: boolean;
  hasCustomization: boolean; // use category customizations
  customizationIds: string[]; // additional item-specific customization ids
}

// ============ MOCK DATA ============

export const mockCategories: MenuCategory[] = [
  { id: "cat1", name: "Appetizers", order: 1, customizationIds: ["cust1", "cust2"] },
  { id: "cat2", name: "Main Course", order: 2, customizationIds: ["cust1", "cust3"] },
  { id: "cat3", name: "Beverages", order: 3, customizationIds: ["cust4", "cust5"] },
  { id: "cat4", name: "Desserts", order: 4, customizationIds: ["cust2"] },
];

export const mockCustomizations: Customization[] = [
  { id: "cust1", name: "Extra Cheese", price: 1.5, assignType: "category", assignId: "cat1" },
  { id: "cust2", name: "Spicy Level", price: 0, assignType: "category", assignId: "cat1" },
  { id: "cust3", name: "Large Size", price: 3.0, assignType: "category", assignId: "cat2" },
  { id: "cust4", name: "Ice", price: 0, assignType: "category", assignId: "cat3" },
  { id: "cust5", name: "Extra Sugar", price: 0.5, assignType: "category", assignId: "cat3" },
  { id: "cust6", name: "Add Egg", price: 1.0, assignType: "menuItem", assignId: "mi1" },
  { id: "cust7", name: "Truffle Oil", price: 2.5, assignType: "menuItem", assignId: "mi3" },
  { id: "cust8", name: "Whipped Cream", price: 0.5, assignType: "menuItem", assignId: "mi7" },
];

export const mockMenuItems: MenuItemFull[] = [
  { id: "mi1", name: "Spring Rolls", description: "Crispy golden spring rolls with dipping sauce", price: 6.5, image: "", categoryId: "cat1", isBestSeller: true, isActive: true, hasCustomization: true, customizationIds: ["cust6"] },
  { id: "mi2", name: "Bruschetta", description: "Toasted bread with fresh tomatoes and basil", price: 7.0, image: "", categoryId: "cat1", isBestSeller: false, isActive: true, hasCustomization: true, customizationIds: [] },
  { id: "mi3", name: "Grilled Salmon", description: "Atlantic salmon with lemon butter sauce", price: 22.0, image: "", categoryId: "cat2", isBestSeller: true, isActive: true, hasCustomization: true, customizationIds: ["cust7"] },
  { id: "mi4", name: "Beef Steak", description: "Premium Wagyu with garlic mashed potatoes", price: 35.0, image: "", categoryId: "cat2", isBestSeller: true, isActive: true, hasCustomization: true, customizationIds: [] },
  { id: "mi5", name: "Pad Thai", description: "Stir-fried noodles with shrimp and peanuts", price: 14.0, image: "", categoryId: "cat2", isBestSeller: false, isActive: false, hasCustomization: false, customizationIds: [] },
  { id: "mi6", name: "Mango Smoothie", description: "Fresh mango blended with coconut milk", price: 5.5, image: "", categoryId: "cat3", isBestSeller: false, isActive: true, hasCustomization: true, customizationIds: [] },
  { id: "mi7", name: "Iced Coffee", description: "Vietnamese-style drip coffee with condensed milk", price: 4.0, image: "", categoryId: "cat3", isBestSeller: true, isActive: true, hasCustomization: true, customizationIds: ["cust8"] },
  { id: "mi8", name: "Tiramisu", description: "Classic Italian tiramisu with mascarpone cream", price: 8.5, image: "", categoryId: "cat4", isBestSeller: false, isActive: true, hasCustomization: true, customizationIds: [] },
  { id: "mi9", name: "Chocolate Lava Cake", description: "Warm chocolate cake with molten center", price: 9.0, image: "", categoryId: "cat4", isBestSeller: true, isActive: true, hasCustomization: false, customizationIds: [] },
  { id: "mi10", name: "Chicken Wings", description: "Buffalo wings with ranch dipping sauce", price: 10.0, image: "", categoryId: "cat1", isBestSeller: false, isActive: false, hasCustomization: true, customizationIds: [] },
];
