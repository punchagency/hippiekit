import { Link } from 'react-router-dom';
import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';

interface FAQItem {
  question: string;
  answer: string;
}

const HelpCenter = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: 'How do I scan a product?',
      answer:
        'To scan a product, tap the scan icon in the bottom navigation bar. You can either scan a barcode/QR code using your camera or upload an image from your gallery. The app will identify the product and show you detailed information about its ingredients and safety.',
    },
    {
      question: 'How do I add products to my favorites?',
      answer:
        'When viewing a product, tap the heart icon to add it to your favorites. You can access your favorites anytime from the sidebar menu or the bottom navigation.',
    },
    {
      question: 'What do the different tag colors mean?',
      answer:
        'Green tags indicate safe, clean, or eco-friendly attributes. Red tags highlight potentially harmful ingredients or practices. Yellow tags indicate ingredients that may require caution. For more details, visit the Icon Description page from the sidebar.',
    },
    {
      question: 'How do I create a shopping list?',
      answer:
        'You can add products to your shopping list by tapping "Add to Shopping List" on any product page. Access your shopping list from the sidebar menu to view, edit, or remove items.',
    },
    {
      question: 'Can I search for specific ingredients?',
      answer:
        'Yes! Use the search feature to look up specific ingredients. The app will show you products containing that ingredient and provide information about its safety and effects.',
    },
    {
      question: 'How do I edit my profile?',
      answer:
        'Go to the Profile tab in the bottom navigation, then tap "Edit Profile" to update your name, email, profile picture, and other personal information.',
    },
    {
      question: 'What is Zero Plastic?',
      answer:
        'Zero Plastic is a category of products that are packaged without plastic or use minimal plastic packaging. These products help reduce environmental impact and support sustainable practices.',
    },
    {
      question: 'How do I reset my password?',
      answer:
        'If you forgot your password, tap "Forgot Password" on the sign-in screen. Enter your email address, and we\'ll send you a verification code to reset your password.',
    },
    {
      question: 'Why can\'t I find a product?',
      answer:
        'If a product isn\'t in our database, try scanning it with a clear image of the barcode or product label. Our system continuously updates with new products. You can also contact support to request a product be added.',
    },
    {
      question: 'How do I enable notifications?',
      answer:
        'Go to your device settings and ensure notifications are enabled for Hippiekit. You can manage notification preferences within the app through the sidebar menu.',
    },
  ];

  const contactOptions = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
      title: 'Email Support',
      description: 'Get help via email',
      contact: 'support@hippiekit.com',
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
      title: 'Phone Support',
      description: 'Call us directly',
      contact: '+966 XXX XXX XXX',
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-8">
      {/* Header */}
      <div className="px-4">
        <PageHeader title="Help Center" />
      </div>

      {/* Content */}
      <div className="px-4 pt-2 max-w-3xl mx-auto space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-primary font-family-segoe mb-2">
            How can we help you?
          </h2>
          <p className="text-gray-600 text-sm">
            Find answers to common questions or contact our support team for
            personalized assistance.
          </p>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-primary font-family-segoe mb-4">
            Quick Links
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/icon-description"
              className="flex items-center gap-2 p-3 bg-[#F5F5F5] rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#650084"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span className="text-sm font-medium text-gray-800">
                Icon Guide
              </span>
            </Link>
            <Link
              to="/privacy-policy"
              className="flex items-center gap-2 p-3 bg-[#F5F5F5] rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#650084"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span className="text-sm font-medium text-gray-800">Privacy</span>
            </Link>
            <Link
              to="/terms-of-use"
              className="flex items-center gap-2 p-3 bg-[#F5F5F5] rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#650084"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span className="text-sm font-medium text-gray-800">Terms</span>
            </Link>
            <Link
              to="/profile"
              className="flex items-center gap-2 p-3 bg-[#F5F5F5] rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#650084"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span className="text-sm font-medium text-gray-800">Settings</span>
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-primary font-family-segoe mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-100 last:border-0">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between py-3 text-left"
                >
                  <span className="font-medium text-gray-800 text-sm pr-4">
                    {faq.question}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#650084"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`shrink-0 transition-transform ${openFAQ === index ? 'rotate-180' : ''
                      }`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {openFAQ === index && (
                  <div className="pb-3">
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-primary font-family-segoe mb-4">
            Contact Support
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="space-y-3">
            {contactOptions.map((option, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-[#F5F5F5] rounded-lg"
              >
                <div className="text-primary">{option.icon}</div>
                <div>
                  <p className="font-semibold text-gray-800">{option.title}</p>
                  <p className="text-gray-600 text-sm">{option.description}</p>
                  <p className="text-primary text-sm font-medium">
                    {option.contact}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* App Version */}
        <div className="text-center py-4">
          <p className="text-gray-400 text-xs">Hippiekit App v1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
