import { Link } from 'react-router-dom';
import backButton from '@/assets/backButton.svg';

const TermsOfUse = () => {
  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-8">
      {/* Header */}
      <header className="px-4 bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link
            to="/profile"
            className="rounded-[7px] p-2.5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)] flex items-center justify-center"
          >
            <img src={backButton} alt="Go back" className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-primary font-family-segoe">
            Terms of Use
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
              Welcome to Hippiekit. By accessing or using our application, you
              agree to be bound by these Terms of Use. Please read them
              carefully.
            </p>
          </div>

          <section>
            <h2 className="text-lg font-bold text-primary font-family-segoe mb-3">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              By creating an account and using Hippiekit, you accept and agree
              to be bound by these Terms of Use and our Privacy Policy. If you
              do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary font-family-segoe mb-3">
              2. Description of Service
            </h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              Hippiekit provides a platform for discovering and purchasing
              eco-friendly and sustainable products. Our services include:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Product browsing and search functionality</li>
              <li>QR code and photo scanning for product identification</li>
              <li>Favorites and shopping list management</li>
              <li>Zero plastic and eco-friendly product filtering</li>
              <li>User account management and profiles</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary font-family-segoe mb-3">
              3. User Accounts
            </h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              To use certain features of Hippiekit, you must create an account.
              You agree to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
              <li>Not share your account with others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary font-family-segoe mb-3">
              4. User Conduct
            </h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Use the service for any illegal or unauthorized purpose</li>
              <li>Upload or transmit viruses or malicious code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service</li>
              <li>Violate any laws in your jurisdiction</li>
              <li>Harass, abuse, or harm other users</li>
              <li>
                Scrape or collect data from the service without permission
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary font-family-segoe mb-3">
              5. Product Information
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We strive to provide accurate product information, including
              descriptions, pricing, and availability. However, we do not
              warrant that product descriptions or other content is accurate,
              complete, reliable, current, or error-free. Prices and
              availability are subject to change without notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary font-family-segoe mb-3">
              6. Intellectual Property
            </h2>
            <p className="text-gray-700 leading-relaxed">
              All content, features, and functionality of Hippiekit, including
              but not limited to text, graphics, logos, icons, images, and
              software, are the exclusive property of Hippiekit and are
              protected by international copyright, trademark, and other
              intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary font-family-segoe mb-3">
              7. Camera and Photo Access
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our QR scanning and photo upload features require camera access.
              By using these features, you grant us permission to access your
              camera and photos solely for the purpose of product
              identification. We do not store or share these images without your
              explicit consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary font-family-segoe mb-3">
              8. Disclaimers
            </h2>
            <p className="text-gray-700 leading-relaxed">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
              WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT
              WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR
              ERROR-FREE.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary font-family-segoe mb-3">
              9. Limitation of Liability
            </h2>
            <p className="text-gray-700 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, HIPPIEKIT SHALL NOT BE
              LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
              PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER
              INCURRED DIRECTLY OR INDIRECTLY.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary font-family-segoe mb-3">
              10. Termination
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to suspend or terminate your account at any
              time, with or without notice, for any reason, including violation
              of these Terms of Use. Upon termination, your right to use the
              service will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary font-family-segoe mb-3">
              11. Changes to Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms of Use at any time. We
              will notify users of significant changes via email or in-app
              notification. Your continued use of the service after changes
              constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary font-family-segoe mb-3">
              12. Governing Law
            </h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms of Use shall be governed by and construed in
              accordance with the laws of Saudi Arabia, without regard to its
              conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary font-family-segoe mb-3">
              13. Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about these Terms of Use, please contact
              us at:
            </p>
            <div className="mt-3 text-gray-700">
              <p>Email: support@hippiekit.com</p>
              <p>Phone: +966 XXX XXX XXX</p>
            </div>
          </section>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              By using Hippiekit, you acknowledge that you have read,
              understood, and agree to be bound by these Terms of Use.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
