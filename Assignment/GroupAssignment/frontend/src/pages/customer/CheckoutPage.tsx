import { useNavigate, useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { restaurantApi } from '@/api'
import CustomerHeader from '@/components/customer/CustomerHeader'
import type { RestaurantDTO } from '@/types/dto'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { slug } = useParams<{ slug?: string }>()
  const [restaurant, setRestaurant] = useState<RestaurantDTO | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setLoading(true)
        const restaurantSlug = slug || 'default'
        
        try {
          const restaurantData = await restaurantApi.getBySlug(restaurantSlug)
          setRestaurant(restaurantData)
        } catch (err) {
        }
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurantData()
  }, [slug])

  const navigateTo = (path: string) => {
    if (slug) {
      return `/${slug}${path}`
    }
    return path
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-300 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 text-gray-800 font-sans">
      
      {/* Navigation */}
      <CustomerHeader 
        restaurant={restaurant} 
        slug={slug} 
        currentPage="checkout"
      />

      <main className="flex-1 flex justify-center pt-8 pb-12 px-6">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Payment Details */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <div>
              <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
                <Link to={navigateTo('/home')} className="hover:text-orange-500 transition-colors">Home</Link>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                <Link to={navigateTo('/reservations')} className="hover:text-orange-500 transition-colors">Reservations</Link>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                <span className="text-orange-500">Checkout</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Secure Checkout</h1>
              <p className="text-gray-600 text-base">Complete your luxury dining reservation at the {restaurant?.name || 'Warm Hearth Bistro'}.</p>
            </div>

            {/* Payment Method Selection */}
            <section className="flex flex-col gap-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-orange-500">payments</span>
                <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="relative flex items-center justify-between p-4 rounded-lg border-2 border-orange-500 bg-orange-50 cursor-pointer transition-all">
                  <input defaultChecked className="hidden" name="payment" type="radio" />
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-orange-500">credit_card</span>
                    <span className="font-medium text-gray-900">Credit Card</span>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-orange-500 bg-orange-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                </label>
                
                <label className="relative flex items-center justify-between p-4 rounded-lg border-2 border-gray-200 bg-white cursor-pointer hover:border-gray-300 transition-all">
                  <input className="hidden" name="payment" type="radio" />
                  <div className="flex items-center gap-3 text-gray-600">
                    <span className="material-symbols-outlined">account_balance_wallet</span>
                    <span className="font-medium">Digital Wallet</span>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                </label>
              </div>

              {/* Card Inputs */}
              <div className="space-y-6 mt-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 uppercase tracking-wide">Cardholder Name</label>
                  <input className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all" placeholder="Johnathan Doe" type="text" />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 uppercase tracking-wide">Card Number</label>
                  <div className="relative">
                    <input className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all font-mono" placeholder="0000 0000 0000 0000" type="text" />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <span className="material-symbols-outlined text-gray-400">credit_card</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700 uppercase tracking-wide">Expiry Date</label>
                    <input className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all font-mono" placeholder="MM / YY" type="text" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700 uppercase tracking-wide">CVV</label>
                    <input className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all font-mono" placeholder="***" type="password" />
                  </div>
                </div>
              </div>
            </section>

            {/* Security Badge */}
            <div className="flex items-start gap-3 p-4 mt-4 rounded-lg bg-green-50 border border-green-200">
              <span className="material-symbols-outlined text-green-600 text-xl">lock</span>
              <div>
                <p className="text-sm font-semibold text-green-800 mb-1">Encrypted & Secure - 256-bit SSL encryption</p>
              </div>
            </div>
          </div>

          {/* Right Column: Reservation Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-white border border-gray-200 rounded-xl p-6 lg:p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Reservation Summary</h2>
              
              <div className="space-y-6">
                {/* Restaurant Section */}
                <div className="flex gap-4 pb-6 border-b border-gray-200">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-orange-500">event_seat</span>
                  </div>
                  <div className="flex flex-col justify-center gap-1">
                    <p className="text-gray-900 font-semibold text-base">The Grand Hall</p>
                    <p className="text-gray-600 text-sm">Friday, Oct 24, 2024 • 8:30 PM</p>
                    <p className="text-gray-500 text-sm">Table for Two</p>
                  </div>
                </div>

                {/* Line Items */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Signature Tasting Menu (x2)</span>
                    <span className="text-gray-900 font-medium">$650.00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Vintage Wine Pairing (x2)</span>
                    <span className="text-gray-900 font-medium">$180.00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Service Charge (10%)</span>
                    <span className="text-gray-900 font-medium">$65.00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Booking Fee</span>
                    <span className="text-gray-900 font-medium">$0.00</span>
                  </div>
                </div>

                {/* Total */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-900 font-semibold">Total Amount</span>
                    <span className="text-orange-500 text-2xl font-bold">$895.00</span>
                  </div>
                  
                  <button onClick={() => navigate(navigateTo('/home'))} className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm rounded-lg transition-all flex items-center justify-center gap-2">
                    Complete Reservation
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                  
                  <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
                    <a className="hover:text-orange-500 transition-colors" href="#">Terms of Service</a>
                    <span>•</span>
                    <a className="hover:text-orange-500 transition-colors" href="#">Cancellation Policy</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🍽️</span>
                </div>
                <span className="text-xl font-bold">{restaurant?.name || 'Warm Hearth Bistro'}</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Dedicated to serving authentic culinary experiences using only the freshest local ingredients.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Explore</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <Link to={navigateTo('/menu')} className="block hover:text-white">Our Menu</Link>
                <a href="#" className="block hover:text-white">Weekly Specials</a>
                <Link to={navigateTo('/reservations')} className="block hover:text-white">Reservations</Link>
                <a href="#" className="block hover:text-white">Gift Cards</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <a href="#" className="block hover:text-white">Privacy Policy</a>
                <a href="#" className="block hover:text-white">Terms of Service</a>
                <a href="#" className="block hover:text-white">Cookie Policy</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <a href="#" className="block hover:text-white">Help Center</a>
                <a href="#" className="block hover:text-white">Contact Us</a>
                <a href="#" className="block hover:text-white">FAQ</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 text-sm">© {new Date().getFullYear()} {restaurant?.name || 'Warm Hearth Bistro'}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}