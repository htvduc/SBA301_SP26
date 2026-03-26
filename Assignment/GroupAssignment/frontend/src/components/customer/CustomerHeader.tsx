import { Link } from 'react-router-dom'
import type { RestaurantDTO } from '@/types/dto'

interface CustomerHeaderProps {
  restaurant?: RestaurantDTO | null
  slug?: string
  currentPage?: 'home' | 'menu' | 'reservations' | 'about' | 'checkout'
}

export default function CustomerHeader({ 
  restaurant, 
  slug, 
  currentPage = 'home',
}: CustomerHeaderProps) {
  const navigateTo = (path: string) => {
    if (slug) {
      return `/${slug}${path}`
    }
    return path
  }

  const restaurantName = restaurant?.name || 'Warm Hearth Bistro'

  return (
    <header className="bg-white shadow-sm border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={navigateTo('/home')} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🍽️</span>
            </div>
            <span className="text-xl font-bold text-gray-900">{restaurantName}</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to={navigateTo('/home')} 
              className={`font-medium transition-colors ${
                currentPage === 'home' 
                  ? 'text-orange-600' 
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              Home
            </Link>
            <Link 
              to={navigateTo('/menu')} 
              className={`font-medium transition-colors ${
                currentPage === 'menu' 
                  ? 'text-orange-600' 
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              Menu
            </Link>
            <Link 
              to={navigateTo('/reservations')} 
              className={`font-medium transition-colors ${
                currentPage === 'reservations' || currentPage === 'checkout'
                  ? 'text-orange-600' 
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              Reservations
            </Link>
            <a 
              href="#story" 
              className={`font-medium transition-colors ${
                currentPage === 'about' 
                  ? 'text-orange-600' 
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              About
            </a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Link 
              to={navigateTo('/reservations')} 
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Book reservation now
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}