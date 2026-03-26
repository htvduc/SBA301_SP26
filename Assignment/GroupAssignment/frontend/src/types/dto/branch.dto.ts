export interface BranchDTO {
    branchId?: string;
    restaurantId: string;
    restaurantName?: string;
    address: string;
    branchPhone: string;
    openingTime: string; // Format: "HH:mm:ss"
    closingTime: string; // Format: "HH:mm:ss"
    isActive?: boolean;
    mail: string;
    staffCount?: number;
}
