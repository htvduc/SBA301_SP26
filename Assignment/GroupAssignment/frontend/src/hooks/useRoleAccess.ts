import { useAuthStore } from '@/stores/authStore';

export const useRoleAccess = () => {
    const user = useAuthStore((state) => state.user);
    const staffInfo = useAuthStore((state) => state.staffInfo);

    // Check if current user is Restaurant Owner
    const isRestaurantOwner = !!user && user.role?.name === 'RESTAURANT_OWNER';

    // Check if current user is Branch Manager
    const isBranchManager = !!staffInfo && staffInfo.role === 'BRANCH_MANAGER';

    // Check if current user is Waiter
    const isWaiter = !!staffInfo && staffInfo.role === 'WAITER';

    // Check if current user is Receptionist
    const isReceptionist = !!staffInfo && staffInfo.role === 'RECEPTIONIST';

    // Check if user has both Restaurant Owner and Branch Manager roles
    // This happens when owner also manages a specific branch
    const hasOwnerAndManagerRole = isRestaurantOwner && isBranchManager;

    // Restaurant Owner can only MANAGE areas/tables if they're also a Branch Manager
    // Otherwise they can only VIEW
    const canManageAreas = isBranchManager;
    const canManageTables = isBranchManager;

    // All authenticated users can view areas and tables
    const canViewAreas = !!user || !!staffInfo;
    const canViewTables = !!user || !!staffInfo;

    // Get current user role name for display
    const currentRole = user?.role?.name || staffInfo?.role || null;

    return {
        isRestaurantOwner,
        isBranchManager,
        isWaiter,
        isReceptionist,
        hasOwnerAndManagerRole,
        canManageAreas,
        canManageTables,
        canViewAreas,
        canViewTables,
        currentRole,
    };
};