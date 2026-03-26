/**
 * Generate the table URL from table ID
 * This URL is what the QR code points to
 * @param tableId - The table ID
 * @param slug - Optional restaurant slug. If not provided, will try to extract from current URL
 */
export const getTableUrl = (tableId: string, slug?: string): string => {
    const baseUrl = window.location.origin;
    
    // If slug is not provided, try to extract from current URL path
    if (!slug) {
        const pathParts = window.location.pathname.split('/').filter(Boolean);
        // Check if we're in a slug-based route (e.g., /khoine/menu or /dashboard/...)
        // For dashboard routes, we need to get the slug from somewhere else
        if (pathParts.length > 0 && !['dashboard', 'manager', 'waiter', 'receptionist', 'admin', 'owner'].includes(pathParts[0])) {
            slug = pathParts[0];
        }
    }
    
    // If we have a slug, use the slug-based URL format
    if (slug) {
        return `${baseUrl}/${slug}/menu/${tableId}`;
    }
    
    // Fallback to simple format (though this won't work with current routes)
    return `${baseUrl}/menu/${tableId}`;
};

/**
 * Generate table URL with restaurant slug fetched from API
 * This is the preferred method when you have branchId available
 * @param tableId - The table ID
 * @param restaurantSlug - The restaurant slug from API
 */
export const getTableUrlWithSlug = (tableId: string, restaurantSlug: string): string => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/${restaurantSlug}/menu/${tableId}`;
};
