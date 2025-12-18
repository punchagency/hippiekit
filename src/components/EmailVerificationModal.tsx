import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { resendVerification } from '../lib/authAPI';

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
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string>('');

  // Timer countdown effect
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  // Reset timer when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeLeft(120); // Reset to 2 minutes
      setResendMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOpenEmailApp = () => {
    // Try to open default email app
    window.location.href = 'mailto:';
  };

  const handleResend = async () => {
    if (timeLeft > 0 || isResending) return;

    try {
      setIsResending(true);
      setResendMessage('');

      const result = await resendVerification(email);

      if (result.success) {
        setResendMessage('✅ Verification email sent! Check your inbox.');
        setTimeLeft(120); // Reset timer to 2 minutes
      } else {
        setResendMessage('❌ ' + (result.message || 'Failed to resend email'));
      }
    } catch (error) {
      setResendMessage('❌ Failed to resend verification email');
      console.error('Resend error:', error);
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const canResend = timeLeft === 0 && !isResending;

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

        {/* Resend Message */}
        {resendMessage && (
          <div
            className={`text-center text-sm mb-3 px-3 py-2 rounded-lg ${
              resendMessage.startsWith('✅')
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {resendMessage}
          </div>
        )}

        {/* Resend Link */}
        <button
          onClick={handleResend}
          disabled={!canResend}
          className={`w-full text-sm font-medium py-2 rounded-lg transition-colors ${
            canResend
              ? 'text-primary hover:bg-primary/5 cursor-pointer'
              : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          {isResending
            ? 'Sending...'
            : timeLeft > 0
            ? `Resend in ${formatTime(timeLeft)}`
            : 'Send verification email again'}
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
