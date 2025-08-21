export default function Privacy() {
  return (
    <div className="container py-10 prose max-w-3xl">
      <h1 className="text-2xl font-bold text-amber-700 ">Privacy Policy</h1>
      <p className="mt-2">
        At <strong>RiksCandle</strong>, we value your trust. This Privacy Policy explains
        how we collect, use, and protect your personal information when you
        interact with our website and services.
      </p>

      <h2>Information We Collect</h2>
      <ul>
        <li>
          <strong>Account Details:</strong> name, email, phone number (only when you create an account or place an order)
        </li>
        <li>
          <strong>Order & Shipping Info:</strong> billing address, delivery address, order history
        </li>
        <li>
          <strong>Payment Status:</strong> confirmation of payment success/failure (we <u>do not</u> store card numbers or sensitive bank data — payments are processed securely by our payment partners)
        </li>
        <li>
          <strong>Usage Data:</strong> website browsing patterns (via cookies/analytics) to improve your shopping experience
        </li>
      </ul>

      <h2>How We Use Your Information</h2>
      <ul>
        <li>✔️ To process and deliver your orders</li>
        <li>✔️ To send order updates, OTPs, invoices, and offers</li>
        <li>✔️ To respond to your queries and provide support</li>
        <li>✔️ To improve our website, products, and customer experience</li>
      </ul>

      <h2>Data Security</h2>
      <p>
        We use industry-standard encryption and secure servers to protect your
        information. Only authorized team members can access personal data, and
        we never sell your data to third parties.
      </p>

      <h2>Cookies</h2>
      <p>
        Our website uses cookies to remember your preferences and improve site
        performance. You can control or disable cookies anytime from your
        browser settings.
      </p>

      <h2>Your Rights</h2>
      <p>
        You may request to update, download, or delete your personal data at
        any time. Please contact us if you wish to exercise these rights.
      </p>

      <h2>Contact Us</h2>
      <p>
        If you have any privacy-related questions or requests, reach out to us at{" "}
        <a href="mailto:rikscandle@gmail.com">rikscandle@gmail.com</a>.
      </p>

      <p className="text-sm text-gray-500">
        Last updated: August 2025
      </p>
    </div>
  );
}
