import { Link } from 'react-router-dom';
import backButton from '@/assets/backButton.svg';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-8">
      {/* Header */}
      <header className="px-4 pt-6 pb-4 bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link
            to="/profile"
            className="rounded-[7px] p-2.5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)] flex items-center justify-center"
          >
            <img src={backButton} alt="Go back" className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-primary font-family-segoe">
            Privacy Policy
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 pt-6 max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div>
            <p className="text-sm text-gray-500 mb-4">
              Last Updated: November 10, 2025
            </p>
            <p className="text-gray-700 leading-relaxed">
              At Hippiekit, we are committed to protecting your privacy and
              ensuring the security of your personal information. This Privacy
              Policy explains how we collect, use, disclose, and safeguard your
              data.
            </p>
          </div>

          <section>
            <h2 className="text-lg font-bold text-primary font-family-segoe mb-3">
              1. Information We Collect
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Personal Information
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Name and email address</li>
                  <li>Phone number (optional)</li>
                  <li>Profile photo (optional)</li>
                  <li>Account credentials</li>
                  <li>Delivery addresses</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Usage Information
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Browsing history and product views</li>
                  <li>Search queries</li>
                  <li>Favorites and shopping lists</li>
                  <li>Purchase history and preferences</li>
                  <li>Device information and unique identifiers</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Technical Information
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>IP address and location data</li>
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>App usage statistics</li>
                  <li>Network information</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Camera and Photos
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>QR code scans for product identification</li>
                  <li>Product photos uploaded for search</li>
                  <li>
                    Images are processed locally and not stored unless you
                    explicitly save them
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary font-family-segoe mb-3">
              2. How We Use Your Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>To provide and maintain our service</li>
              <li>To process your transactions and orders</li>
              <li>To personalize your experience</li>
              <li>To send notifications about orders and updates</li>
              <li>To improve our products and services</li>
              <li>To detect and prevent fraud</li>
              <li>To comply with legal obligations</li>
              <li>To communicate with you about promotions and offers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary font-family-segoe mb-3">
              3. Information Sharing and Disclosure
            </h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              We do not sell your personal information. We may share your
              information with:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>
                <strong>Service Providers:</strong> Third-party companies that
                help us operate our business (payment processors, shipping
                companies, analytics providers)
              </li>
              <li>
                <strong>Business Partners:</strong> Eco-friendly brands and
                retailers featured on our platform
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law or to
                protect our rights
              </li>
              <li>
                <strong>Business Transfers:</strong> In connection with a
                merger, acquisition, or sale of assets
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary font-family-segoe mb-3">
              4. Data Security
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We implement appropriate technical and organizational measures to
              protect your personal information against unauthorized access,
              alteration, disclosure, or destruction. This includes encryption,
              secure servers, and regular security audits. However, no method of
              transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary font-family-segoe mb-3">
              5. Your Rights and Choices
            </h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Export your data in a portable format</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              To exercise these rights, please contact us at
              privacy@hippiekit.com
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary font-family-segoe mb-3">
              6. Cookies and Tracking Technologies
            </h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              We use cookies and similar tracking technologies to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Remember your preferences</li>
              <li>Analyze site traffic and usage patterns</li>
              <li>Personalize content and advertisements</li>
              <li>Improve user experience</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              You can control cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary font-family-segoe mb-3">
              7. Children's Privacy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our service is not intended for children under 13 years of age. We
              do not knowingly collect personal information from children. If we
              become aware that we have collected information from a child
              without parental consent, we will take steps to delete that
              information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary font-family-segoe mb-3">
              8. International Data Transfers
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Your information may be transferred to and maintained on servers
              located outside of your country. We ensure appropriate safeguards
              are in place to protect your data in accordance with this Privacy
              Policy and applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary font-family-segoe mb-3">
              9. Data Retention
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your personal information for as long as necessary to
              fulfill the purposes outlined in this Privacy Policy, unless a
              longer retention period is required by law. When you delete your
              account, we will delete or anonymize your data within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary font-family-segoe mb-3">
              10. Third-Party Links
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our app may contain links to third-party websites or services. We
              are not responsible for the privacy practices of these third
              parties. We encourage you to read their privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary font-family-segoe mb-3">
              11. Changes to This Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will
              notify you of significant changes by email or through a prominent
              notice in the app. Your continued use of our service after changes
              constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary font-family-segoe mb-3">
              12. Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              If you have questions or concerns about this Privacy Policy or our
              data practices, please contact us:
            </p>
            <div className="text-gray-700 space-y-1">
              <p>
                <strong>Email:</strong> privacy@hippiekit.com
              </p>
              <p>
                <strong>Phone:</strong> +966 XXX XXX XXX
              </p>
              <p>
                <strong>Address:</strong> Hippiekit, Riyadh, Saudi Arabia
              </p>
            </div>
          </section>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              By using Hippiekit, you acknowledge that you have read and
              understood this Privacy Policy and consent to the collection and
              use of your information as described.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
