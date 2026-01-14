export default function Terms() {
  return (
    <div className="bg-white rounded-lg shadow p-8 border border-brandBorder">
      <h1 className="text-3xl font-bold text-primary mb-6">Terms & Conditions</h1>

      <p className="text-brandTextDark mb-6">Last updated: {new Date().toLocaleDateString()}</p>

      {/* General Usage */}
      <section className="space-y-3 mb-10">
        <h2 className="text-xl font-bold text-brandTextDark">1. General Usage</h2>
        <p className="text-brandTextMedium">
          Welcome to PZM Computers & Phones Store ("we", "us", or "our"). By accessing or using this website and our
          services, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms,
          you should refrain from using our website or placing orders.
        </p>
        <ul className="list-disc pl-5 text-brandTextMedium space-y-1">
          <li>The content on this website is provided for general information and shopping purposes only.</li>
          <li>We reserve the right to update, modify, or remove content and services at any time without prior notice.</li>
          <li>All users are responsible for ensuring the accuracy of their order and contact information.</li>
        </ul>
      </section>

      {/* Product and Pricing Disclaimer */}
      <section className="space-y-3 mb-10">
        <h2 className="text-xl font-bold text-brandTextDark">2. Product and Pricing Disclaimer</h2>
        <p className="text-brandTextMedium">
          We strive to display accurate product details, images, and pricing. However, minor variations may occur. Prices
          are subject to change without notice and may vary based on availability and market conditions. In the event of
          a pricing error, we may contact you to confirm or cancel the order.
        </p>
      </section>

      {/* Orders and Payments */}
      <section className="space-y-3 mb-10">
        <h2 className="text-xl font-bold text-brandTextDark">3. Orders and Payments</h2>
        <ul className="list-disc pl-5 text-brandTextMedium space-y-1">
          <li>Orders placed through this website are considered offers to purchase and are subject to acceptance.</li>
          <li>All prices are in AED and include VAT unless otherwise specified.</li>
          <li>Cash on Delivery (COD) is currently available within Dubai only.</li>
          <li>We reserve the right to cancel orders due to stock issues, suspected fraud, or incorrect information.</li>
        </ul>
      </section>

      {/* Refund Policy */}
      <section className="space-y-3 mb-10">
        <h2 className="text-xl font-bold text-brandTextDark">4. Refund Policy</h2>
        <ul className="list-disc pl-5 text-brandTextMedium space-y-2">
          <li><strong>New items</strong> are not refundable if the item is opened.</li>
          <li><strong>Used/old items</strong> are refundable within the first <strong>3 days</strong> only if the item is not the same as described.</li>
        </ul>
        <p className="text-brandTextMedium">Refunds, if applicable, will be processed using the original payment method or as store credit.</p>
      </section>

      {/* Warranty Disclaimer */}
      <section className="space-y-3 mb-10">
        <h2 className="text-xl font-bold text-brandTextDark">5. Warranty Disclaimer</h2>
        <p className="text-brandTextMedium">
          Products may include limited warranty based on condition (new/used) and manufacturer coverage. Any implied
          warranties are limited to the extent permitted by law. Please check the product details or contact us for
          warranty eligibility.
        </p>
      </section>

      {/* Limitation of Liability */}
      <section className="space-y-3 mb-10">
        <h2 className="text-xl font-bold text-brandTextDark">6. Limitation of Liability</h2>
        <p className="text-brandTextMedium">
          To the maximum extent permitted by law, PZM Computers & Phones Store shall not be liable for any indirect,
          incidental, special, or consequential damages arising from the use of our website or products, including but not
          limited to loss of data or profits.
        </p>
      </section>

      {/* Governing Law */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-brandTextDark">7. Governing Law</h2>
        <p className="text-brandTextMedium">
          These Terms & Conditions are governed by the laws of the United Arab Emirates. Any disputes shall be subject to
          the exclusive jurisdiction of the courts of Dubai, UAE.
        </p>
      </section>
    </div>
  )
}
