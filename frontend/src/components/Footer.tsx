export default function Footer() {
  // Get current year dynamically - this will automatically update every year!
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">PZM Computers & Phones Store</h3>
            <p className="text-gray-400 text-sm">
              Your trusted source for premium iPhones and accessories in the UAE.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="/" className="hover:text-white transition">Home</a></li>
              <li><a href="/shop" className="hover:text-white transition">Shop</a></li>
              <li><a href="/cart" className="hover:text-white transition">Cart</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="mailto:support@pzm.ae" className="hover:text-white transition">support@pzm.ae</a></li>
              <li><a href="tel:+971" className="hover:text-white transition">+971 (0) XXX XXXX</a></li>
              <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="/terms" className="hover:text-white transition">Terms & Conditions</a></li>
              <li><a href="mailto:support@pzm.ae" className="hover:text-white transition">Privacy & Data Requests</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          {/* Copyright with Dynamic Year */}
          <div className="text-center text-gray-400 text-sm">
            <p>
              &copy; {currentYear} PZM Computers & Phones Store. All rights reserved.
            </p>
            <p className="mt-2">
              Made with ❤️ for iPhone enthusiasts
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
