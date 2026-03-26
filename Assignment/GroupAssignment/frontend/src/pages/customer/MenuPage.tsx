import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { restaurantApi, categoryApi, branchApi, waiterOrderApi, tableApi, branchMenuItemApi, menuItemApi, areaApi } from '@/api'
import { useToast } from '@/hooks/use-toast'
import CustomerHeader from '@/components/customer/CustomerHeader'
import { Star } from 'lucide-react'
import type { RestaurantDTO, CategoryDTO, BranchDTO, CreateOrderRequest, CustomizationDTO, GuestBranchMenuItemDTO } from '@/types/dto'
import { CustomizationType } from '@/types/dto/customization.dto'

// Format currency to Vietnamese Dong
const formatVND = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}
const getEffectivePrice = (item: { price: number; discountedPrice?: number }) =>
  item.discountedPrice ?? item.price

export default function MenuPage() {
  const navigate = useNavigate()
  const { slug, tableId } = useParams<{ slug?: string; tableId?: string }>()
  const { toast } = useToast()
  
  const [restaurant, setRestaurant] = useState<RestaurantDTO | null>(null)
  const [branches, setBranches] = useState<BranchDTO[]>([])
  const [selectedBranch, setSelectedBranch] = useState<BranchDTO | null>(null)
  const [categories, setCategories] = useState<CategoryDTO[]>([])
  const [menuItems, setMenuItems] = useState<GuestBranchMenuItemDTO[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [basket, setBasket] = useState<any[]>([])
  const [orderLoading, setOrderLoading] = useState(false)
  const [showCustomizationModal, setShowCustomizationModal] = useState(false)
  const [selectedMenuItem, setSelectedMenuItem] = useState<GuestBranchMenuItemDTO | null>(null)
  const [selectedCustomizations, setSelectedCustomizations] = useState<{[key: string]: number}>({})
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [itemNote, setItemNote] = useState('')
  const [menuItemCustomizations, setMenuItemCustomizations] = useState<CustomizationDTO[]>([])
  const [loadingCustomizations, setLoadingCustomizations] = useState(false)
  const [branchId, setBranchId] = useState<string | null>(null)

  // Fetch restaurant data on mount or when slug changes
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const restaurantSlug = slug || 'default'
        
        try {
          const restaurantData = await restaurantApi.getBySlug(restaurantSlug)
          setRestaurant(restaurantData)
          
          // Get branch ID from table if tableId exists
          let currentBranchId: string | null = null
          if (tableId) {
            try {
              const tableData = await tableApi.getById(tableId)
              // Get area to find branchId
              if (tableData.areaId) {
                const areaData = await areaApi.getById(tableData.areaId)
                currentBranchId = areaData.branchId
                setBranchId(currentBranchId)
              }
            } catch (tableError) {
              console.error('Failed to fetch table data:', tableError)
            }
          }
          
          // If no branchId from table, get first branch
          if (!currentBranchId) {
            const branchesData = await branchApi.getByPublicRestaurant(restaurantData.restaurantId)
            setBranches(branchesData)
            if (branchesData.length > 0) {
              currentBranchId = branchesData[0].branchId
              setBranchId(currentBranchId)
              setSelectedBranch(branchesData[0])
            }
          }
          
          const categoriesData = await categoryApi.getAllByRestaurant(restaurantData.restaurantId)
          setCategories(categoriesData.data.result)
          // Set "All" as default (null means show all)
          setSelectedCategory(null)
          
          // Fetch menu items from branch (only available items)
          if (currentBranchId) {
            const menuResponse = await branchMenuItemApi.getGuestMenuItemsByBranch(currentBranchId)
            // Filter only available items
            setMenuItems(menuResponse.filter(item => item.available) || [])
          } else {
            setMenuItems([])
          }
         
        } catch (slugError) {
          setMenuItems([])
        }
      } catch (err) {
        setError('Failed to load restaurant data')
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurantData()
  },[slug, tableId])

  const addToBasket = async (item: GuestBranchMenuItemDTO) => {
    if (item.hasCustomization) {
      // Load customizations for this specific menu item
      setLoadingCustomizations(true)
      try {
        const customizationsResponse = await menuItemApi.getCustomizations(item.menuItemId)
        setMenuItemCustomizations(customizationsResponse.data.result || [])
        
        if (customizationsResponse.data.result && customizationsResponse.data.result.length > 0) {
          // Show customization modal
          setSelectedMenuItem(item)
          setSelectedCustomizations({})
          setSelectedVariant(null)
          setItemNote('')
          setShowCustomizationModal(true)
        } else {
          // No customizations available, add directly
          addItemToBasket(item, {}, '')
        }
      } catch (error) {
        // Add directly if error loading customizations
        addItemToBasket(item, {}, '')
      } finally {
        setLoadingCustomizations(false)
      }
    } else {
      // Add directly to basket
      addItemToBasket(item, {}, '')
    }
  }

  const addItemToBasket = (item: GuestBranchMenuItemDTO, itemCustomizations: {[key: string]: number}, note: string) => {
    // Calculate customization price (addons + variant)
    let customizationPrice = Object.entries(itemCustomizations).reduce((sum, [customizationId, quantity]) => {
      const customization = menuItemCustomizations.find(c => c.id === customizationId)
      return sum + (customization ? customization.price * quantity : 0)
    }, 0)
    
    // Add variant price if selected
    if (selectedVariant) {
      const variantCustomization = menuItemCustomizations.find(c => c.id === selectedVariant)
      if (variantCustomization) {
        customizationPrice += variantCustomization.price
      }
    }

    const totalItemPrice = getEffectivePrice(item) + customizationPrice

    // Check if same item with same customizations exists
    const existingItemIndex = basket.findIndex(b => 
      b.menuItemId === item.menuItemId && 
      JSON.stringify(b.customizations) === JSON.stringify(itemCustomizations) &&
      b.notes === note
    )
    
    if (existingItemIndex >= 0) {
      const newBasket = [...basket]
      newBasket[existingItemIndex].qty += 1
      newBasket[existingItemIndex].totalPrice = totalItemPrice * newBasket[existingItemIndex].qty
      setBasket(newBasket)
      
      toast({
        title: "Updated Selection",
        description: `Increased quantity of ${item.name}.`,
        duration: 2000,
      })
    } else {
      setBasket([
        ...basket,
        {
          ...item,
          basketId: Math.random().toString(36).substring(7),
          menuItemId: item.menuItemId,
          qty: 1,
          notes: note,
          customizations: itemCustomizations,
          customizationPrice,
          totalPrice: totalItemPrice,
        },
      ])
      
      toast({
        title: "Added to Selection",
        description: `${item.name} has been added to your order.`,
        duration: 2000,
      })
    }
  }

  const updateQty = (basketId: string, qty: number) => {
    if (qty <= 0) {
      removeFromBasket(basketId)
    } else {
      setBasket(
        basket.map(item => {
          if (item.basketId === basketId) {
            const basePrice = (item.discountedPrice ?? item.price) + (item.customizationPrice || 0)
            return { ...item, qty, totalPrice: basePrice * qty }
          }
          return item
        })
      )
    }
  }

  const updateNote = (basketId: string, notes: string) => {
    setBasket(
      basket.map(item =>
        item.basketId === basketId ? { ...item, notes } : item
      )
    )
  }

  const removeFromBasket = (basketId: string) => {
    setBasket(basket.filter(item => item.basketId !== basketId))
  }

  const subtotal = basket.reduce((sum, item) => sum + (item.totalPrice || item.price * item.qty), 0)
  const total = subtotal // Removed VAT calculation
  const totalItems = basket.reduce((sum, item) => sum + item.qty, 0)

  const filteredMenuItems = selectedCategory
    ? menuItems.filter((item: any) => item.categoryId === selectedCategory || item.category?.id === selectedCategory)
    : menuItems

  const handleCompleteOrder = async () => {
    if (!tableId) {
      toast({ title: 'Error', description: 'Table ID not found. Please access menu from a table.', variant: 'destructive' })
      return
    }

    if (basket.length === 0) {
      toast({ title: 'Error', description: 'Please add items to your order first.', variant: 'destructive' })
      return
    }

    try {
      setOrderLoading(true)
      const orderItems = basket.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.qty,
        note: item.notes || '',
        customizations: Object.entries(item.customizations || {}).map(([customizationId, quantity]) => ({
          customizationId,
          quantity: Number(quantity)
        }))
      }))
      
      const createOrderRequest: CreateOrderRequest = {
        areaTableId: tableId,
        items: orderItems,
      }
      
      await waiterOrderApi.createOrder(createOrderRequest)

      setBasket([])

      toast({
        title: 'Order Confirmed',
        description: `Your culinary journey begins shortly. Our chef is preparing your selection.`,
      })

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create order. Please try again.'
      
      // Check if error is about unavailable items
      if (errorMessage.includes('unavailable') || err.response?.data?.code === 3104) {
        // Refresh menu to get latest availability
        if (branchId) {
          const menuResponse = await branchMenuItemApi.getGuestMenuItemsByBranch(branchId)
          setMenuItems(menuResponse.filter(item => item.available) || [])
        }
        
        toast({
          title: 'Items Unavailable',
          description: 'Some items in your order are no longer available. Please review your selection.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })
      }
    } finally {
      setOrderLoading(false)
    }
  }

  const handleCustomizationConfirm = () => {
    if (selectedMenuItem) {
      // Merge addons and variant into customizations
      const finalCustomizations = { ...selectedCustomizations }
      if (selectedVariant) {
        finalCustomizations[selectedVariant] = 1
      }
      
      addItemToBasket(selectedMenuItem, finalCustomizations, itemNote)
      setShowCustomizationModal(false)
      setSelectedMenuItem(null)
      setSelectedCustomizations({})
      setSelectedVariant(null)
      setItemNote('')
    }
  }

  const updateCustomizationQuantity = (customizationId: string, quantity: number) => {
    if (quantity <= 0) {
      const newCustomizations = { ...selectedCustomizations }
      delete newCustomizations[customizationId]
      setSelectedCustomizations(newCustomizations)
    } else {
      setSelectedCustomizations({
        ...selectedCustomizations,
        [customizationId]: quantity
      })
    }
  }

  const getCustomizationTotal = () => {
    let total = Object.entries(selectedCustomizations).reduce((sum, [customizationId, quantity]) => {
      const customization = menuItemCustomizations.find(c => c.id === customizationId)
      return sum + (customization ? customization.price * quantity : 0)
    }, 0)
    
    // Add variant price
    if (selectedVariant) {
      const variantCustomization = menuItemCustomizations.find(c => c.id === selectedVariant)
      if (variantCustomization) {
        total += variantCustomization.price
      }
    }
    
    return total
  }
  
  const addonCustomizations = menuItemCustomizations.filter(c => c.customizationType === CustomizationType.ADDON)
  const variantCustomizations = menuItemCustomizations.filter(c => c.customizationType === CustomizationType.VARIANT)

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-300 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 text-gray-800 font-sans relative">
      
      <CustomerHeader 
        restaurant={restaurant} 
        slug={slug} 
        currentPage="menu"
      />

      {/* Main Content Area - Added padding bottom for mobile floating cart */}
      <main className={`flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row px-4 sm:px-6 pt-8 pb-12 gap-8 ${basket.length > 0 && tableId ? 'pb-28 lg:pb-12' : ''}`}>
        
        {/* Menu Section */}
        <div className="flex-1 space-y-8 min-w-0">
          
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-2xl min-h-[300px] md:min-h-[400px] flex flex-col justify-end p-6 md:p-12 bg-gray-900 shadow-sm">
            <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop")'}}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            <div className="relative z-10 max-w-2xl">
              <span className="inline-block text-orange-400 text-xs font-bold tracking-widest uppercase mb-3">Seasonal Menu</span>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">The Art of <br/><span className="italic text-orange-400">Fine Dining</span></h1>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed line-clamp-3 md:line-clamp-none">{restaurant?.description || 'Experience our seasonal menu crafted with passion and the finest local ingredients. From farm to table, curated for your palate.'}</p>
            </div>
          </div>

          {/* Categories Tabs */}
          <div className="pt-4 pb-2 border-b border-orange-200/60">
            <div className="flex gap-6 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none][scrollbar-width:none]">
              {/* All Category */}
              <button 
                onClick={() => setSelectedCategory(null)}
                className={`flex-none pb-2 font-semibold text-sm uppercase tracking-wider transition-all duration-300 border-b-2 whitespace-nowrap ${
                  selectedCategory === null
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                All
              </button>
              {categories.map(category => (
                <button 
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex-none pb-2 font-semibold text-sm uppercase tracking-wider transition-all duration-300 border-b-2 whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-8 pt-2">
            {filteredMenuItems.map((item) => (
              <div key={item.menuItemId} className="group flex flex-col bg-white border border-gray-200 rounded-xl hover:shadow-xl hover:border-orange-200 transition-all duration-300 h-full overflow-hidden">
                
                {/* Image Box */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <img 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    src={item.imageUrl || ''} 
                  />
                  {item.bestSeller && (
                    <div
                      className="pointer-events-none absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 shadow-md ring-2 ring-white/90"
                      title="Best seller"
                    >
                      <Star className="h-6 w-6 fill-yellow-600 text-yellow-700 drop-shadow-sm" aria-hidden />
                    </div>
                  )}
                  {item.hasCustomization && (
                    <div className="absolute top-3 right-3 bg-blue-500 shadow-md text-white px-2 py-1 text-[10px] font-bold tracking-wider rounded-full uppercase">
                      Customizable
                    </div>
                  )}
                </div>

                {/* Content Box */}
                <div className="p-5 flex flex-col grow">
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors leading-tight line-clamp-2">{item.name}</h3>
                    <span className="text-orange-600 font-bold text-base whitespace-nowrap bg-orange-50 px-2 py-0.5 rounded-md">{formatVND(getEffectivePrice(item))}</span>
                  </div>
                  
                  <p className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed">{item.description}</p>
                  
                  {tableId && (
                    <div className="mt-auto">
                      <button 
                        onClick={() => addToBasket(item)} 
                        disabled={loadingCustomizations}
                        className="w-full h-11 border-2 border-gray-200 text-gray-700 font-semibold hover:bg-orange-500 hover:border-orange-500 hover:text-white transition-all flex items-center justify-center gap-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingCustomizations ? (
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                        )}
                        {loadingCustomizations ? 'Loading...' : (item.hasCustomization ? 'Customize & Add' : 'Add to Selection')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {filteredMenuItems.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                <span className="text-5xl mb-4">🍽️</span>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No items found</h3>
                <p className="text-gray-500 text-sm">We're updating our menu. Please check another category.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar / Shopping Basket (Desktop) */}
        {tableId && (
          <aside id="basket-section" className="w-full lg:w-[380px] shrink-0">
            <div className="sticky top-[88px] flex flex-col bg-white border border-gray-200 rounded-2xl shadow-lg shadow-gray-200/50 h-[calc(100vh-120px)] min-h-[500px] overflow-hidden">
              
              {/* Basket Header */}
              <div className="p-5 border-b border-gray-100 bg-orange-50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                    <span className="material-symbols-outlined">shopping_basket</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 leading-none">Your Selection</h2>
                    <p className="text-xs text-gray-500 mt-1">Table Order</p>
                  </div>
                </div>
                {totalItems > 0 && (
                  <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-sm">
                    {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
                  </span>
                )}
              </div>

              {/* Basket Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/50">
                {basket.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                    <span className="material-symbols-outlined text-6xl text-gray-300">restaurant_menu</span>
                    <p className="text-sm text-center font-medium">Your selection is empty.<br/>Add some delicious items!</p>
                  </div>
                ) : (
                  basket.map(item => (
                    <div key={item.basketId} className="flex flex-col gap-2 p-3 bg-white border border-gray-200 shadow-sm rounded-xl transition-all hover:border-orange-300">
                      <div className="flex gap-3">
                        <div className="size-16 bg-gray-100 shrink-0 rounded-lg overflow-hidden border border-gray-100">
                          <img className="w-full h-full object-cover" src={item.imageUrl || ''} alt={item.name} />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2">{item.name}</h4>
                            <button onClick={() => removeFromBasket(item.basketId)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-1 -mt-1 -mr-1 transition-colors">
                              <span className="material-symbols-outlined text-[18px] block">close</span>
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-orange-600 text-sm font-bold">{formatVND(item.totalPrice || item.price * item.qty)}</span>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3 bg-gray-50 rounded-md p-1 border border-gray-200">
                              <button onClick={() => updateQty(item.basketId, item.qty - 1)} className="size-6 flex items-center justify-center bg-white border border-gray-200 shadow-sm text-gray-600 hover:text-orange-600 hover:border-orange-300 transition-colors text-sm rounded">-</button>
                              <span className="text-sm font-bold text-gray-900 w-4 text-center">{item.qty}</span>
                              <button onClick={() => updateQty(item.basketId, item.qty + 1)} className="size-6 flex items-center justify-center bg-white border border-gray-200 shadow-sm text-gray-600 hover:text-orange-600 hover:border-orange-300 transition-colors text-sm rounded">+</button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Customizations Display */}
                      {item.customizations && Object.keys(item.customizations).length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          {Object.entries(item.customizations).map(([customizationId, quantity]) => {
                            const customization = menuItemCustomizations.find(c => c.id === customizationId)
                            const qty = Number(quantity)
                            return customization ? (
                              <div key={customizationId} className="flex justify-between">
                                <span>+ {customization.name} x{qty}</span>
                                <span>{formatVND(customization.price * qty)}</span>
                              </div>
                            ) : null
                          })}
                        </div>
                      )}
                      
                      {/* Note Input */}
                      <div className="mt-1">
                        <input 
                          type="text" 
                          placeholder="Add a note (e.g. no onions, less spicy...)"
                          value={item.notes || ''}
                          onChange={(e) => updateNote(item.basketId, e.target.value)}
                          className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 focus:bg-white transition-colors placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Order Summary & Checkout */}
              <div className="p-5 bg-white border-t border-gray-200 shrink-0">
                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-sm text-gray-500 font-medium">
                    <span>Subtotal</span>
                    <span className="text-gray-900">{formatVND(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-2">
                    <span className='text-sm font-bold text-gray-900 uppercase tracking-wider'>Total Amount</span>
                    <span className="text-orange-600 text-xl font-black">{formatVND(total)}</span>
                  </div>
                </div>
                
                <button 
                  onClick={handleCompleteOrder}
                  disabled={orderLoading || basket.length === 0}
                  className="w-full h-12 bg-gray-900 hover:bg-black disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {orderLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      PROCESSING...
                    </span>
                  ) : 'CONFIRM ORDER'}
                </button>
              </div>
            </div>
          </aside>
        )}
      </main>

      {/* Floating Bottom Bar for Mobile (Jumps to cart) */}
      {tableId && basket.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] z-50 animate-in slide-in-from-bottom-full duration-300">
          <button
            onClick={() => {
              document.getElementById('basket-section')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="w-full h-12 flex items-center justify-between bg-orange-500 hover:bg-orange-600 text-white px-5 rounded-xl font-bold shadow-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 bg-white text-orange-600 rounded-full flex items-center justify-center text-sm shadow-sm">{totalItems}</span>
              <span className="tracking-wide">View Selection</span>
            </div>
            <span className="text-lg">{formatVND(total)}</span>
          </button>
        </div>
      )}

      {/* Customization Modal */}
      {showCustomizationModal && selectedMenuItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full my-8 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Customize Your Order</h3>
                <button 
                  onClick={() => setShowCustomizationModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="mt-2">
                <h4 className="font-semibold text-gray-800">{selectedMenuItem.name}</h4>
                <p className="text-sm text-gray-500">
                  {selectedMenuItem.discountedPrice != null && selectedMenuItem.discountedPrice < selectedMenuItem.price ? (
                    <span className="flex items-center gap-2">
                      <span className="font-semibold text-orange-600">{formatVND(selectedMenuItem.discountedPrice)}</span>
                      <span className="line-through text-gray-400">{formatVND(selectedMenuItem.price)}</span>
                    </span>
                  ) : (
                    formatVND(selectedMenuItem.price)
                  )}
                </p>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Variants Section */}
              {variantCustomizations.length > 0 && (
                <div className="space-y-3 mb-6">
                  <h5 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">Choose Option</h5>
                  <p className="text-xs text-gray-500">Select one option (required)</p>
                  <div className="space-y-2">
                    {variantCustomizations.map(customization => (
                      <label 
                        key={customization.id}
                        className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedVariant === customization.id 
                            ? 'border-orange-500 bg-orange-50' 
                            : 'border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="radio"
                            name="variant"
                            checked={selectedVariant === customization.id}
                            onChange={() => setSelectedVariant(customization.id)}
                            className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                          />
                          <div className="flex-1">
                            <h6 className="font-medium text-gray-900">{customization.name}</h6>
                            {customization.price > 0 && (
                              <p className="text-sm text-orange-600 font-semibold">+{formatVND(customization.price)}</p>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Add-ons Section */}
              {addonCustomizations.length > 0 && (
                <div className="space-y-3">
                  <h5 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">Add-ons</h5>
                  <p className="text-xs text-gray-500">Optional extras (select multiple)</p>
                  {addonCustomizations.map(customization => (
                    <div key={customization.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h6 className="font-medium text-gray-900">{customization.name}</h6>
                        <p className="text-sm text-orange-600 font-semibold">+{formatVND(customization.price)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => updateCustomizationQuantity(customization.id, (selectedCustomizations[customization.id] || 0) - 1)}
                          className="size-8 flex items-center justify-center bg-gray-100 border border-gray-200 text-gray-600 hover:text-orange-600 hover:border-orange-300 transition-colors text-sm rounded"
                        >
                          -
                        </button>
                        <span className="text-sm font-bold text-gray-900 w-6 text-center">
                          {selectedCustomizations[customization.id] || 0}
                        </span>
                        <button 
                          onClick={() => updateCustomizationQuantity(customization.id, (selectedCustomizations[customization.id] || 0) + 1)}
                          className="size-8 flex items-center justify-center bg-gray-100 border border-gray-200 text-gray-600 hover:text-orange-600 hover:border-orange-300 transition-colors text-sm rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {menuItemCustomizations.length === 0 && (
                <p className="text-sm text-gray-500 italic">No customizations available for this item.</p>
              )}

              {/* Special Instructions */}
              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-800 mb-2 uppercase tracking-wider">Special Instructions</label>
                <textarea
                  value={itemNote}
                  onChange={(e) => setItemNote(e.target.value)}
                  placeholder="Any special requests? (e.g., no onions, extra spicy...)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 text-sm resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* Modal Footer - Fixed at bottom */}
            <div className="p-6 border-t border-gray-200 shrink-0 bg-white">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-semibold text-gray-800">Total Price:</span>
                <span className="text-lg font-bold text-orange-600">
                  {formatVND(getEffectivePrice(selectedMenuItem) + getCustomizationTotal())}
                </span>
              </div>
              <button
                onClick={handleCustomizationConfirm}
                className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors"
              >
                Add to Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-950 text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">🍽️</span>
                </div>
                <span className="text-xl font-bold tracking-tight">{restaurant?.name || 'Warm Hearth Bistro'}</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Dedicated to serving authentic culinary experiences using only the freshest local ingredients. Join us for a journey of flavors.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Explore</h4>
              <div className="space-y-4 text-sm text-gray-400">
                <Link to={slug ? `/${slug}/menu` : '/menu'} className="block hover:text-orange-400 transition-colors">Our Menu</Link>
                <a href="#" className="block hover:text-orange-400 transition-colors">Weekly Specials</a>
                <Link to={slug ? `/${slug}/reservations` : '/reservations'} className="block hover:text-orange-400 transition-colors">Reservations</Link>
                <a href="#" className="block hover:text-orange-400 transition-colors">Gift Cards</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Legal</h4>
              <div className="space-y-4 text-sm text-gray-400">
                <a href="#" className="block hover:text-orange-400 transition-colors">Privacy Policy</a>
                <a href="#" className="block hover:text-orange-400 transition-colors">Terms of Service</a>
                <a href="#" className="block hover:text-orange-400 transition-colors">Cookie Policy</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Safety</h4>
              <div className="space-y-4 text-sm text-gray-400">
                <a href="#" className="block hover:text-orange-400 transition-colors">Allergen Guide</a>
                <a href="#" className="block hover:text-orange-400 transition-colors">Food Hygiene</a>
                <a href="#" className="block hover:text-orange-400 transition-colors">Sustainable Sourcing</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} {restaurant?.name || 'Warm Hearth Bistro'}. All rights reserved.</p>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 hover:text-white hover:bg-orange-500 transition-all cursor-pointer">
                <span className="text-sm">fb</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 hover:text-white hover:bg-orange-500 transition-all cursor-pointer">
                <span className="text-sm">ig</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}