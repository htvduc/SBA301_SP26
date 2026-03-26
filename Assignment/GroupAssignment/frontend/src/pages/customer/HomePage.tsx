import { Link, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { restaurantApi, menuItemApi, branchApi } from '@/api'
import CustomerHeader from '@/components/customer/CustomerHeader'
import type { RestaurantDTO, MenuItemDTO, BranchDTO } from '@/types/dto'

// Format currency to Vietnamese Dong
const formatVND = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

export default function HomePage() {
  const { slug } = useParams<{ slug?: string }>()
  const [restaurant, setRestaurant] = useState<RestaurantDTO | null>(null)
  const [branches, setBranches] = useState<BranchDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [menuItems, setMenuItems] = useState<MenuItemDTO[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const restaurantSlug = slug || 'default'
        
        try {
          const restaurantData = await restaurantApi.getBySlug(restaurantSlug)
          setRestaurant(restaurantData)
          
          const branchesData = await branchApi.getByPublicRestaurant(restaurantData.restaurantId)
          setBranches(branchesData)
          
          const menuResponse = await menuItemApi.getAllByRestaurant(restaurantData.restaurantId)
          setMenuItems(menuResponse.data.result ||[])
        } catch (err) {
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug])

  const navigateTo = (path: string) => {
    if (slug) {
      return `/${slug}${path}`
    }
    return path
  }

  const restaurantName = restaurant?.name || 'Warm Hearth Bistro'
  const restaurantDescription = restaurant?.description || 'Experience the warmth of home-cooked meals in every bite. Our bistro brings people together with friendly service and a welcoming atmosphere.'
  const restaurantPhone = restaurant?.restaurantPhone || '+84 123 456 789'
  const restaurantEmail = restaurant?.email || 'hello@warmhearthbistro.com'
  
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
        currentPage="home"
      />
      <main>
        {/* Hero Section */}
        <section className="bg-orange-50 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="mb-6">
                  <span className="inline-block bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full mb-4">
                    Est. 2012
                  </span>
                  <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                    Deliciously Cozy, Heartfelt Flavors
                  </h1>
                  <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    {restaurantDescription}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    to={navigateTo('/menu')} 
                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium text-center transition-colors"
                  >
                    View Menu
                  </Link>
                  <Link 
                    to={navigateTo('/reservations')} 
                    className="border border-orange-500 text-orange-600 hover:bg-orange-50 px-8 py-3 rounded-lg font-medium text-center transition-colors"
                  >
                    Book a Table
                  </Link>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=2070&auto=format&fit=crop" 
                    alt="Restaurant Interior" 
                    className="w-full h-80 lg:h-96 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white rounded-lg p-3 shadow-lg">
                    <div className="flex items-center space-x-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-sm">★</span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 max-w-32">
                      "The most comforting meal I've had in years. Feels just like Sunday dinner at grandma's."
                    </p>
                    <p className="text-xs text-gray-500 mt-1">— Sarah Jenkins</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Dishes Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Popular Dishes</h2>
                <p className="text-gray-600">Our community favorites, prepared fresh daily.</p>
              </div>
              <Link 
                to={navigateTo('/menu')} 
                className="text-orange-600 hover:text-orange-700 font-medium flex items-center space-x-2"
              >
                <span>See Full Menu</span>
                <span>→</span>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {menuItems.filter(item => item.isBestSeller).slice(0, 4).map((item, index) => (
                <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="aspect-w-4 aspect-h-3">
                    <img 
                      src={item.media?.url || `https://images.unsplash.com/photo-${1544025162 + index}-d76694265947?q=80&w=1738&auto=format&fit=crop`} 
                      alt={item.name} 
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                      <span className="text-orange-600 font-bold">{formatVND(item.price)}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                    <button className="w-full bg-orange-50 hover:bg-orange-100 text-orange-600 py-2 px-4 rounded-lg font-medium transition-colors">
                      + Add to Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section id="story" className="py-16 lg:py-24 bg-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="bg-orange-500 rounded-full w-24 h-24 flex items-center justify-center text-white font-bold text-lg absolute -top-4 -left-4 z-10">
                  <div className="text-center">
                    <div className="text-sm">Since</div>
                    <div className="text-lg">2012</div>
                  </div>
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=2070&auto=format&fit=crop" 
                  alt="Chef preparing food" 
                  className="w-full h-96 object-cover rounded-2xl"
                />
              </div>
              
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Born from a passion for bringing families together, our bistro started in a small family kitchen and grew into the cozy community hub it is today. We believe in the magic that happens around a dining table.
                </p>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  We pride ourselves on using locally sourced ingredients, slow-cooking methods, and a personal touch in every recipe. To us, you're not just a customer; you're a guest in our home.
                </p>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <span className="text-orange-600 text-xl">🌾</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Locally Sourced</h3>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <span className="text-orange-600 text-xl">❤️</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Made with Love</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Branches Section */}
        {branches.length > 0 && (
          <section className="py-16 lg:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Visit Us</h2>
                <p className="text-gray-600">Find us at these welcoming locations</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {branches.map(branch => (
                  <div key={branch.branchId} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{branch.address}</h3>
                    <div className="space-y-3 text-sm text-gray-600 mb-6">
                      <div className="flex items-center space-x-3">
                        <span className="text-orange-500">📞</span>
                        <span>{branch.branchPhone}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-orange-500">🕒</span>
                        <span>{branch.openingTime} - {branch.closingTime}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-orange-500">👥</span>
                        <span>Staff: {branch.staffCount}</span>
                      </div>
                    </div>
                    <Link 
                      to={navigateTo('/reservations')} 
                      className="text-orange-600 hover:text-orange-700 font-medium flex items-center space-x-2"
                    >
                      <span>Reserve Here</span>
                      <span>→</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
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
                <span className="text-xl font-bold">{restaurantName}</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Bringing the warmth of home-style cooking to your neighborhood since 2012. Join us for a meal that feeds your soul.
              </p>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <span>📍</span>
                  <span>123 Bistro Lane, Gastronomy City</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>📞</span>
                  <span>{restaurantPhone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>✉️</span>
                  <span>{restaurantEmail}</span>
                </div>
              </div>
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
              <h4 className="font-semibold mb-4">About</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <a href="#story" className="block hover:text-white">Our Story</a>
                <a href="#" className="block hover:text-white">The Team</a>
                <a href="#" className="block hover:text-white">Careers</a>
                <a href="#" className="block hover:text-white">Sustainability</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Find Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700">
                  <span>🌐</span>
                </a>
                <a href={`mailto:${restaurantEmail}`} className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700">
                  <span>📧</span>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© {new Date().getFullYear()} {restaurantName}. All rights reserved.</p>
            <div className="flex space-x-6 text-sm text-gray-400 mt-4 md:mt-0">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
              <a href="#" className="hover:text-white">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}