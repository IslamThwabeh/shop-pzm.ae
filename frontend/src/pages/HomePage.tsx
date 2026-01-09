import { ShoppingCart, Truck, Shield, MessageCircle, Star, CheckCircle } from 'lucide-react'
import type { Product } from '@shared/types'
import ProductCard from '../components/ProductCard' 

interface HomePageProps {
  products: Product[]
  onShopClick: () => void
}

export default function HomePage({ products, onShopClick }: HomePageProps) {
  const newProducts = products.filter(p => p.condition === 'new').slice(0, 3)
  const usedProducts = products.filter(p => p.condition === 'used').slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-green-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Premium iPhones at Best Prices</h1>
          <p className="text-xl mb-2">Buy New & Used iPhones with Cash on Delivery</p>
          <p className="text-green-100 mb-8">Authentic Products • Warranty • Fast Delivery • Secure Payment</p>
          <button
            onClick={onShopClick}
            className="bg-white text-green-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-green-50 transition-colors"
          >
            Shop Now
          </button>
        </div>
      </div>

      {/* Services Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Why Choose PZM?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Service Card 1 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <ShoppingCart className="text-green-600" size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Cash on Delivery</h3>
            <p className="text-gray-600">Pay safely upon delivery. No advance payment required.</p>
          </div>

          {/* Service Card 2 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Truck className="text-green-600" size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Fast Delivery</h3>
            <p className="text-gray-600">Quick and reliable delivery across UAE within 24-48 hours.</p>
          </div>

          {/* Service Card 3 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Shield className="text-green-600" size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Warranty & Support</h3>
            <p className="text-gray-600">All phones come with warranty and dedicated customer support.</p>
          </div>

          {/* Service Card 4 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Authentic Products</h3>
            <p className="text-gray-600">100% genuine iPhones. All products verified and tested.</p>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="bg-gray-50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-gray-900">Featured Products</h2>
          
          {/* New Products */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">✨ Brand New</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {newProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>

          {/* Used Products */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-gray-900">📱 Used & Refurbished</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {usedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">What Our Customers Say</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Ahmed Al Mansouri', rating: 5, comment: 'Great quality iPhones and excellent customer service!' },
            { name: 'Fatima Al Kaabi', rating: 5, comment: 'Fast delivery and cash on delivery option is very convenient.' },
            { name: 'Mohammed Al Mazrouei', rating: 5, comment: 'Best prices in the market. Highly recommended!' }
          ].map((testimonial, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-4 italic">"{testimonial.comment}"</p>
              <p className="font-bold text-gray-900">{testimonial.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-green-600 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Your iPhone?</h2>
          <p className="text-lg mb-6">Browse our collection and find the perfect iPhone for you</p>
          <button
            onClick={onShopClick}
            className="bg-white text-green-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-green-50 transition-colors"
          >
            Start Shopping
          </button>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <MessageCircle size={32} className="mx-auto mb-3 text-green-400" />
              <h3 className="font-bold mb-2">WhatsApp</h3>
              <p className="text-gray-300">+971 50 123 4567</p>
            </div>
            <div>
              <Truck size={32} className="mx-auto mb-3 text-green-400" />
              <h3 className="font-bold mb-2">Delivery</h3>
              <p className="text-gray-300">24-48 Hours Across UAE</p>
            </div>
            <div>
              <Shield size={32} className="mx-auto mb-3 text-green-400" />
              <h3 className="font-bold mb-2">Support</h3>
              <p className="text-gray-300">support@pzm.ae</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
