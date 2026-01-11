import { ShoppingCart, Truck, Shield, MessageCircle, CheckCircle, Phone, MapPin } from 'lucide-react'
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
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <ShoppingCart className="text-green-600" size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Cash on Delivery</h3>
            <p className="text-gray-600">Pay safely upon delivery. No advance payment required.</p>
          </div>

          {/* Service Card 2 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Truck className="text-green-600" size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Fast Delivery</h3>
            <p className="text-gray-600">Quick and reliable delivery across UAE within 24-48 hours.</p>
          </div>

          {/* Service Card 3 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Shield className="text-green-600" size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Warranty & Support</h3>
            <p className="text-gray-600">All phones come with warranty and dedicated customer support.</p>
          </div>

          {/* Service Card 4 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
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

      {/* Testimonials Section with Real Google Reviews */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">What Our Customers Say</h2>
        
        {/* Elfsight Google Reviews Widget */}
        <div className="elfsight-app-69b4a752-7f66-44fe-8388-276e68bc6823" data-elfsight-app-lazy></div>
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
      <div className="bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Contact Us</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left Column - Contact Methods */}
            <div>
              <p className="text-gray-600 text-lg mb-8">Need help with our services or products? Get in touch!</p>
              
              <div className="space-y-6">
                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="bg-gray-100 p-3 rounded-full">
                    <Phone size={24} className="text-green-600" />
                  </div>
                  <div>
                    <a href="tel:+971528026677" className="text-green-600 font-semibold hover:underline">
                      +971 528026677
                    </a>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start gap-4">
                  <div className="bg-gray-100 p-3 rounded-full">
                    <MessageCircle size={24} className="text-green-600" />
                  </div>
                  <div>
                    <a href="https://wa.me/971528026677" className="text-green-600 font-semibold hover:underline">
                      Chat on WhatsApp
                    </a>
                  </div>
                </div>

                {/* Google Maps */}
                <div className="flex items-start gap-4">
                  <div className="bg-gray-100 p-3 rounded-full">
                    <MapPin size={24} className="text-green-600" />
                  </div>
                  <div>
                    <a href="https://maps.app.goo.gl/e5Rhfo8YY3i8CatM7?g_st=ic" className="text-green-600 font-semibold hover:underline">
                      Find us on Google Maps
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Store Info & Hours */}
            <div>
              <h3 className="text-2xl font-bold text-green-600 mb-6">Visit Our Store</h3>
              
              <div className="mb-8">
                <p className="text-gray-700 font-semibold mb-2">PZM Computers & Phones Store -Buy•Sell•Fix•Used•PC•Build</p>
                <p className="text-gray-600 mb-2">Hessa Street Branch</p>
                <p className="text-gray-600 mb-6">Inside Hessa Union Coop Hypermarket, Ground floor</p>
              </div>

              {/* Business Hours Table */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="inline-block bg-pink-400 text-white px-3 py-1 rounded-full text-sm font-bold">Business Hours</span>
                </h4>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Monday</span>
                    <span className="text-green-600 font-semibold">08:00 AM – 11:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Tuesday</span>
                    <span className="text-green-600 font-semibold">08:00 AM – 11:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Wednesday</span>
                    <span className="text-green-600 font-semibold">08:00 AM – 11:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Thursday</span>
                    <span className="text-green-600 font-semibold">08:00 AM – 11:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Friday</span>
                    <span className="text-green-600 font-semibold">09:30 AM – 11:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Saturday</span>
                    <span className="text-green-600 font-semibold">07:00 AM – 01:00 AM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Sunday</span>
                    <span className="text-green-600 font-semibold">07:00 AM – 01:00 AM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Google Map */}
          <div className="mt-12 rounded-lg overflow-hidden shadow-lg h-96">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3608.231830114033!2d55.1992671!3d25.0848627!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f6dc0bc49a6d5%3A0x158c13f2d688b32e!2sPZM%20Computer%20Phone%20Trading%20%26%20Repair%20(Sell%2CUsed%2CNew%2CBuild)!5e0!3m2!1sen!2sae!4v1715590341023!5m2!1sen!2sae"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-green-600 h-1"></div>
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {/* WhatsApp */}
            <div>
              <MessageCircle size={40} className="mx-auto mb-4 text-green-400" />
              <h3 className="text-xl font-bold mb-3">WhatsApp</h3>
              <a href="https://wa.me/971528026677" className="text-green-300 hover:text-green-200 transition-colors">
                +971 528026677
              </a>
            </div>

            {/* Delivery */}
            <div>
              <Truck size={40} className="mx-auto mb-4 text-green-400" />
              <h3 className="text-xl font-bold mb-3">Delivery</h3>
              <p className="text-gray-300">24-48 Hours Across UAE</p>
            </div>

            {/* Support */}
            <div>
              <Shield size={40} className="mx-auto mb-4 text-green-400" />
              <h3 className="text-xl font-bold mb-3">Support</h3>
              <a href="mailto:support@pzm.ae" className="text-green-300 hover:text-green-200 transition-colors">
                support@pzm.ae
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p className="text-gray-400">PZM Computers & Phones Store -Buy•Sell•Fix•Used•PC•Build</p>
            <p className="text-gray-400">© {new Date().getFullYear()} All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
