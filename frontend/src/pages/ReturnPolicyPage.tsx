import Seo from '../components/Seo'
import { siteContact, siteIdentity } from '../content/siteData'

export default function ReturnPolicyPage() {
  return (
    <div className="rounded-[28px] border border-brandBorder bg-white p-8 shadow-sm md:p-10">
      <Seo
        title="Return & Refund Policy | PZM Dubai"
        description="Return and refund policy for PZM Computers & Phones Store in Dubai — eligibility, defective items, exchanges, and used devices."
        canonicalPath="/return-policy"
      />

      <h1 className="mb-4 text-3xl font-bold text-primary">Return &amp; Refund Policy</h1>
      <p className="mb-8 text-brandTextDark">Last updated: March 24, 2026</p>

      <section className="mb-10 space-y-3">
        <p className="text-brandTextMedium">
          At {siteIdentity.name}, we are committed to ensuring your satisfaction with every purchase. This policy outlines the terms and conditions for returns and refunds on products purchased from our store in Al Barsha, Dubai, or via our delivery service across the UAE.
        </p>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-bold text-brandTextDark">1. Return Eligibility</h2>
        <p className="text-brandTextMedium">
          You may return a product within 7 days of the delivery or purchase date, provided the following conditions are met:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-brandTextMedium">
          <li>The product is in its original, unopened packaging (sealed condition).</li>
          <li>The product has not been activated, used, or damaged by the customer.</li>
          <li>All original accessories, manuals, and warranty cards are included.</li>
          <li>A valid proof of purchase, receipt, or order confirmation is provided.</li>
        </ul>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-bold text-brandTextDark">2. Non-Returnable Items</h2>
        <p className="text-brandTextMedium">The following items are not eligible for return or refund:</p>
        <ul className="list-disc space-y-2 pl-5 text-brandTextMedium">
          <li>Products that have been opened, activated, or used.</li>
          <li>Cases, screen protectors, and accessories that have already been applied or used.</li>
          <li>Products damaged after delivery by the customer.</li>
          <li>Custom-built PCs and configured-to-order items.</li>
          <li>Software, digital products, and gift cards.</li>
        </ul>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-bold text-brandTextDark">3. Defective or Damaged Products</h2>
        <p className="text-brandTextMedium">If you receive a defective or damaged product:</p>
        <ul className="list-disc space-y-2 pl-5 text-brandTextMedium">
          <li>Contact us within 48 hours of delivery.</li>
          <li>We will arrange a free replacement or full refund for eligible cases.</li>
          <li>Defective items under manufacturer warranty will be handled through the official warranty process.</li>
        </ul>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-bold text-brandTextDark">4. How to Initiate a Return</h2>
        <p className="text-brandTextMedium">To start a return, please contact us through one of the following:</p>
        <div className="space-y-3 rounded-2xl border-l-4 border-primary bg-brandLight p-5 text-brandTextDark">
          <p>
            <strong>WhatsApp:</strong>{' '}
            <a href="https://wa.me/971528026677?text=Hi%2C%20I%20would%20like%20to%20initiate%20a%20return.%20(via%20pzm.ae)" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
              {siteContact.phoneDisplay}
            </a>
          </p>
          <p>
            <strong>Phone:</strong>{' '}
            <a href={siteContact.phoneHref} className="font-semibold text-primary hover:underline">
              {siteContact.phoneDisplay}
            </a>
          </p>
          <p>
            <strong>Visit us:</strong> PZM Store, Hessa Street, Al Barsha, Dubai (Inside Hessa Union Coop Hypermarket, Ground Floor)
          </p>
        </div>
        <p className="text-brandTextMedium">
          Our team will review your request and provide return instructions within 24 hours.
        </p>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-bold text-brandTextDark">5. Refund Process</h2>
        <ul className="list-disc space-y-2 pl-5 text-brandTextMedium">
          <li>Cash on Delivery orders: Refund via cash at our store or bank transfer within 5 to 7 business days.</li>
          <li>Pay-by-link orders: Refund to the original payment method within 5 to 7 business days.</li>
          <li>Shipping fees are non-refundable unless the return is due to a defective or incorrect product.</li>
        </ul>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-bold text-brandTextDark">6. Exchange Policy</h2>
        <p className="text-brandTextMedium">
          We offer product exchanges within the 7-day return window, subject to the same return conditions above. Exchanges for a higher-value product require payment of the price difference.
        </p>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-bold text-brandTextDark">7. Used &amp; Pre-owned Devices</h2>
        <p className="text-brandTextMedium">
          Used and pre-owned devices are sold as-is. Returns on used devices are accepted only if a hardware defect is discovered within 3 days of purchase that was not disclosed at the time of sale.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-brandTextDark">8. Contact Us</h2>
        <p className="text-brandTextMedium">
          If you have any questions about this policy, please reach out via WhatsApp at <a href="https://wa.me/971528026677?text=Hi%2C%20I%20have%20a%20question%20about%20your%20return%20policy.%20(via%20pzm.ae)" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">+971 52 802 6677</a>, by phone at <a href={siteContact.phoneHref} className="text-primary hover:underline">{siteContact.phoneDisplay}</a>, or at our Al Barsha, Hessa Street, Dubai location.
        </p>
      </section>
    </div>
  )
}