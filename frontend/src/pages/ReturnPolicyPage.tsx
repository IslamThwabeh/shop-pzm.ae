import Seo from '../components/Seo'
import { siteContact } from '../content/siteData'

export default function ReturnPolicyPage() {
  return (
    <div className="bg-white rounded-lg shadow p-8 border border-brandBorder">
      <Seo
        title="Return and Refund Policy | PZM Dubai"
        description="Read the return and refund policy for PZM Computers & Phones Store in Dubai, including the 7-day return window and used-device conditions."
        canonicalPath="/return-policy"
      />

      <h1 className="text-3xl font-bold text-primary mb-4">Return and Refund Policy</h1>
      <p className="text-brandTextDark mb-8">Last updated: March 24, 2026</p>

      <section className="space-y-3 mb-10">
        <h2 className="text-xl font-bold text-brandTextDark">1. Return eligibility</h2>
        <p className="text-brandTextMedium">
          You may request a return within 7 days of delivery or purchase, provided the item is still sealed, unused,
          undamaged, and accompanied by the original accessories, manuals, warranty cards, and proof of purchase.
        </p>
      </section>

      <section className="space-y-3 mb-10">
        <h2 className="text-xl font-bold text-brandTextDark">2. Non-returnable items</h2>
        <ul className="list-disc pl-5 text-brandTextMedium space-y-2">
          <li>Products that have been opened, activated, or used.</li>
          <li>Cases, screen protectors, and accessories that have already been applied or used.</li>
          <li>Products damaged after delivery by the customer.</li>
          <li>Custom-built PCs and configured-to-order items.</li>
          <li>Software, digital products, and gift cards.</li>
        </ul>
      </section>

      <section className="space-y-3 mb-10">
        <h2 className="text-xl font-bold text-brandTextDark">3. Defective or damaged products</h2>
        <ul className="list-disc pl-5 text-brandTextMedium space-y-2">
          <li>Contact the store within 48 hours of delivery if the item arrives defective or damaged.</li>
          <li>Eligible cases can receive a replacement or refund after review.</li>
          <li>Manufacturer-warranty cases may still be handled through the official warranty process.</li>
        </ul>
      </section>

      <section className="space-y-3 mb-10">
        <h2 className="text-xl font-bold text-brandTextDark">4. How to start a return</h2>
        <div className="rounded-2xl border-l-4 border-primary bg-brandLight p-5 space-y-3 text-brandTextDark">
          <p>
            <strong>Phone:</strong>{' '}
            <a href={siteContact.phoneHref} className="text-primary font-semibold hover:underline">
              {siteContact.phoneDisplay}
            </a>
          </p>
          <p>
            <strong>Email:</strong>{' '}
            <a href={`mailto:${siteContact.supportEmail}`} className="text-primary font-semibold hover:underline">
              {siteContact.supportEmail}
            </a>
          </p>
          <p>
            <strong>Visit:</strong> {siteContact.addressLine1}, {siteContact.addressLine2}, {siteContact.cityLine}
          </p>
        </div>
        <p className="text-brandTextMedium">
          The team reviews return requests and provides next-step instructions after checking product condition and eligibility.
        </p>
      </section>

      <section className="space-y-3 mb-10">
        <h2 className="text-xl font-bold text-brandTextDark">5. Refund process</h2>
        <ul className="list-disc pl-5 text-brandTextMedium space-y-2">
          <li>Cash on Delivery orders are refunded by cash at the store or bank transfer within 5 to 7 business days.</li>
          <li>Shipping fees are non-refundable unless the return is caused by an incorrect or defective item.</li>
          <li>Approved refunds are processed after the returned item is inspected.</li>
        </ul>
      </section>

      <section className="space-y-3 mb-10">
        <h2 className="text-xl font-bold text-brandTextDark">6. Exchanges</h2>
        <p className="text-brandTextMedium">
          Product exchanges are available within the same 7-day return window, subject to stock availability and the same return conditions.
          Exchanges for a higher-value product require payment of the price difference.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-brandTextDark">7. Used and pre-owned devices</h2>
        <p className="text-brandTextMedium">
          Used and pre-owned devices are sold as-is. Returns on used devices are accepted only if an undisclosed hardware defect
          is discovered within 3 days of purchase.
        </p>
      </section>
    </div>
  )
}