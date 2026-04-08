import Seo from '../components/Seo'

export default function Terms() {
  return (
    <div className="rounded-[28px] border border-brandBorder bg-white p-8 shadow-sm md:p-10">
      <Seo
        title="Terms & Conditions | PZM Dubai"
        description="Read the terms and conditions for PZM Computers & Phones Store in Dubai, including ordering, payment, delivery, warranty, and returns."
        canonicalPath="/terms"
      />
      <h1 className="mb-4 text-3xl font-bold text-primary">Terms & Conditions</h1>

      <p className="mb-8 text-brandTextDark">Last updated: March 24, 2026</p>

      <section className="mb-10 space-y-3">
        <p className="text-brandTextMedium">
          Welcome to PZM Computers &amp; Phones Store -New•Used•Repair•PC•Build. By accessing our website (<a href="https://pzm.ae" className="text-primary hover:underline">pzm.ae</a>) or purchasing products from our store, you agree to be bound by the following terms and conditions.
        </p>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-bold text-brandTextDark">1. Business Information</h2>
        <p className="text-brandTextMedium">
          <strong className="font-bold">PZM Computers &amp; Phones Store -New•Used•Repair•PC•Build</strong><br/>
          Al Barsha, Hessa Street, Inside Hessa Union Coop Hypermarket, Ground Floor<br/>
          Dubai, United Arab Emirates<br/><br/>
          Phone/WhatsApp: <a href="tel:+971528026677" className="font-bold text-primary hover:underline">+971 52 802 6677</a>
        </p>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-bold text-brandTextDark">2. Products &amp; Pricing</h2>
        <ul className="list-disc space-y-2 pl-5 text-brandTextMedium">
          <li>All prices displayed on our website are in United Arab Emirates Dirhams (AED).</li>
          <li>Prices are subject to change without prior notice.</li>
          <li>Product details, colors, and configurations may vary.</li>
          <li>Images are for illustration purposes; actual product color and appearance may vary slightly.</li>
          <li>Products marked &quot;Contact for Price&quot; require a direct inquiry for the latest pricing.</li>
        </ul>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-bold text-brandTextDark">3. How to Order</h2>
        <p className="text-brandTextMedium">We offer multiple convenient ways to place an order:</p>
        <ul className="list-disc space-y-2 pl-5 text-brandTextMedium">
          <li>WhatsApp Order: Message us on <a href="https://wa.me/971528026677?text=Hi%2C%20I%20would%20like%20to%20place%20an%20order.%20(via%20pzm.ae)" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">+971 52 802 6677</a> with the product you want.</li>
          <li>Phone Order: Call us at <a href="tel:+971528026677" className="text-primary hover:underline">+971 52 802 6677</a>.</li>
          <li>Walk-in: Visit our store in Al Barsha, Dubai.</li>
        </ul>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-bold text-brandTextDark">4. Payment Methods</h2>
        <p className="text-brandTextMedium">We accept the following payment methods:</p>
        <ul className="list-disc space-y-2 pl-5 text-brandTextMedium">
          <li>Cash on Delivery (COD): Pay in cash when you receive your product at your door.</li>
          <li>Pay-by-Link: After order confirmation, we send a secure payment link to complete payment online.</li>
          <li>In-store Payment: Cash or card payment at our Al Barsha store location.</li>
        </ul>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-bold text-brandTextDark">5. Delivery</h2>
        <ul className="list-disc space-y-2 pl-5 text-brandTextMedium">
          <li>We offer same-day delivery within Dubai, subject to order time and driver scheduling.</li>
          <li>Delivery across the UAE is available with estimated delivery of 1 to 3 business days.</li>
          <li>Free delivery is available on eligible orders within Dubai.</li>
          <li>Delivery charges, if applicable, will be communicated before order confirmation.</li>
          <li>You must be available at the delivery address to receive and inspect the product.</li>
        </ul>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-bold text-brandTextDark">6. Warranty</h2>
        <ul className="list-disc space-y-2 pl-5 text-brandTextMedium">
          <li>New devices come with the manufacturer&apos;s official warranty.</li>
          <li>Used and pre-owned devices are sold with a store warranty as disclosed at the time of purchase.</li>
          <li>Warranty does not cover damage caused by misuse, accidents, or unauthorized modifications.</li>
          <li>Custom-built PCs carry component-level warranties as specified by each manufacturer.</li>
        </ul>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-bold text-brandTextDark">7. Returns &amp; Refunds</h2>
        <p className="text-brandTextMedium">
          Please refer to our <a href="/return-policy/" className="text-primary hover:underline">Return &amp; Refund Policy</a> for complete details on returns, exchanges, and refunds.
        </p>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-bold text-brandTextDark">8. Intellectual Property</h2>
        <p className="text-brandTextMedium">
          All content on this website, including text, images, logos, and design, is the property of PZM Computers &amp; Phones Store -New•Used•Repair•PC•Build and is protected by applicable intellectual property laws. You may not reproduce, distribute, or modify any content without our written permission.
        </p>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-bold text-brandTextDark">9. Limitation of Liability</h2>
        <ul className="list-disc space-y-2 pl-5 text-brandTextMedium">
          <li>PZM shall not be liable for any indirect, incidental, or consequential damages arising from product use.</li>
          <li>Our total liability shall not exceed the purchase price of the product in question.</li>
          <li>We are not responsible for delays caused by courier services or force majeure events.</li>
        </ul>
      </section>

      <section id="privacy" className="mb-10 space-y-3">
        <h2 className="text-xl font-bold text-brandTextDark">10. Privacy & Data Collection</h2>
        <p className="text-brandTextMedium">
          In accordance with UAE Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data, we are transparent about what information we collect and how it is used.
        </p>
        <h3 className="text-lg font-semibold text-brandTextDark">What We Collect</h3>
        <ul className="list-disc space-y-2 pl-5 text-brandTextMedium">
          <li><strong>Order information</strong> — name, phone number, email, and delivery address you provide at checkout.</li>
          <li><strong>Service & enquiry data</strong> — product references, messages, and form submissions sent via WhatsApp or our contact forms.</li>
          <li><strong>Technical data</strong> — your approximate city, country, and IP address are recorded automatically when you submit an enquiry. This helps us serve customers in the UAE efficiently and detect misuse.</li>
          <li><strong>Local storage</strong> — we store your cart contents and a minimal consent flag in your browser's local storage. No tracking cookies are set.</li>
        </ul>
        <h3 className="text-lg font-semibold text-brandTextDark">How We Use It</h3>
        <p className="text-brandTextMedium">
          Personal data is used solely for order fulfillment, customer support, and improving our services. We do not sell or share your information with third parties for marketing purposes.
        </p>
        <h3 className="text-lg font-semibold text-brandTextDark">Data Sharing & Retention</h3>
        <p className="text-brandTextMedium">
          We may share data with delivery partners to fulfill orders and with payment processors when online payments are enabled. Data is retained only as long as necessary for business and legal purposes.
        </p>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-bold text-brandTextDark">11. Governing Law</h2>
        <p className="text-brandTextMedium">
          These terms and conditions are governed by and construed in accordance with the laws of the United Arab Emirates. Any disputes shall be subject to the exclusive jurisdiction of the courts of Dubai.
        </p>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-bold text-brandTextDark">12. Changes to Terms</h2>
        <p className="text-brandTextMedium">
          We reserve the right to update these terms at any time. Changes take effect immediately upon posting on this page. Continued use of our website or services constitutes acceptance of the updated terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-brandTextDark">13. Contact Us</h2>
        <p className="text-brandTextMedium">
          If you have any questions about these terms, please contact us via WhatsApp at <a href="https://wa.me/971528026677?text=Hi%2C%20I%20have%20a%20question%20about%20your%20terms.%20(via%20pzm.ae)" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">+971 52 802 6677</a>, by phone at <a href="tel:+971528026677" className="text-primary hover:underline">+971 52 802 6677</a>, or at our Al Barsha, Hessa Street, Dubai location.
        </p>
      </section>
    </div>
  )
}
