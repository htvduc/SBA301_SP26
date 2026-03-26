import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";

/**
 * Hook to get branch ID and restaurant ID for manager dashboard
 * - For staff accounts: uses branchId and restaurantId from staffInfo
 * - For restaurant owners: uses IDs from localStorage (set when accessing from branch selection)
 */
export const useBranchContext = () => {
  const { user, staffInfo } = useAuthStore();
  const navigate = useNavigate();
  
  const isOwner = user?.role?.name === 'RESTAURANT_OWNER';
  const selectedBranchId = isOwner ? localStorage.getItem('selectedBranchId') : null;
  const currentRestaurantId = isOwner ? localStorage.getItem('currentRestaurantId') : null;

  useEffect(() => {
    // Redirect owner to /restaurants if they access branch dashboard without selecting a branch
    if (isOwner && !selectedBranchId) {
      toast.error("Missing Branch Context", {
        description: "Please select a specific branch to manage its data."
      });
      navigate('/restaurants');
    }
  }, [isOwner, selectedBranchId, navigate]);

  // If user is staff, use their assigned branch
  if (staffInfo?.branchId) {
    return {
      branchId: staffInfo.branchId,
      restaurantId: staffInfo.restaurantId,
      isStaff: true,
      isOwner: false
    };
  }
  
  // If user is restaurant owner, use selected branch from localStorage
  if (isOwner) {
    return {
      branchId: selectedBranchId,
      restaurantId: currentRestaurantId,
      isStaff: false,
      isOwner: true
    };
  }
  
  return {
    branchId: null,
    restaurantId: null,
    isStaff: false,
    isOwner: false
  };
};