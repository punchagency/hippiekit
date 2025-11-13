import { X } from 'lucide-react';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

const EmailVerificationModal = ({
  isOpen,
  onClose,
  email,
}: EmailVerificationModalProps) => {
  if (!isOpen) return null;

  const handleOpenEmailApp = () => {
    // Try to open default email app
    window.location.href = 'mailto:';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-md bg-white rounded-[20px] p-6 sm:p-8 shadow-xl animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-primary text-[20px] sm:text-[24px] font-bold font-family-segoe mb-3">
          Check your email
        </h2>

        {/* Message */}
        <p className="text-center text-gray-600 text-[13px] sm:text-[14px] mb-6">
          We have sent one-time Sign in link to email address associated with
          your account.
        </p>

        {/* Email Display */}
        <div className="bg-gray-50 rounded-lg p-3 mb-6 text-center">
          <p className="text-sm text-gray-700 font-medium break-all">{email}</p>
        </div>

        {/* Open Email Button */}
        <button
          onClick={handleOpenEmailApp}
          className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors mb-3"
        >
          Open Email App
        </button>

        {/* Resend Link */}
        <button
          onClick={onClose}
          className="w-full text-gray-600 text-sm font-medium py-2 hover:text-primary transition-colors"
        >
          Send Me again (99 sec)
        </button>

        {/* Footer Note */}
        <p className="text-center text-gray-500 text-xs mt-6">
          Didn't receive the email? Check your spam folder or{' '}
          <button
            onClick={onClose}
            className="text-primary font-semibold hover:underline"
          >
            contact support
          </button>
        </p>
      </div>
    </div>
  );
};

export default EmailVerificationModal;
