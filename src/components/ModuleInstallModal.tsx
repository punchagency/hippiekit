import { X, Download, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

export type ModuleInstallState =
  | 'idle'
  | 'confirm'
  | 'installing'
  | 'success'
  | 'error';

interface ModuleInstallModalProps {
  isOpen: boolean;
  state: ModuleInstallState;
  progress?: number; // 0-100
  errorMessage?: string;
  onConfirm: () => void;
  onCancel: () => void;
  onClose: () => void;
}

export const ModuleInstallModal = ({
  isOpen,
  state,
  progress = 0,
  errorMessage,
  onConfirm,
  onCancel,
  onClose,
}: ModuleInstallModalProps) => {
  if (!isOpen) return null;

  const renderContent = () => {
    switch (state) {
      case 'confirm':
        return (
          <>
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Download className="w-8 h-8 text-primary" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-center text-gray-900 text-xl font-bold mb-3">
              Download Required
            </h2>

            {/* Message */}
            <p className="text-center text-gray-600 text-sm mb-6">
              The barcode scanner needs a one-time download to work on your device.
              This is a small module (~2MB) that enables fast barcode scanning.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1 py-3"
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                className="flex-1 py-3 bg-primary text-white"
              >
                Download
              </Button>
            </div>
          </>
        );

      case 'installing':
        return (
          <>
            {/* Animated Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 relative">
                {/* Outer ring */}
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="6"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                    className="text-primary transition-all duration-300"
                    strokeDasharray={`${2 * Math.PI * 35}`}
                    strokeDashoffset={`${2 * Math.PI * 35 * (1 - progress / 100)}`}
                  />
                </svg>
                {/* Center percentage */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-center text-gray-900 text-xl font-bold mb-2">
              Installing Scanner
            </h2>

            {/* Progress text */}
            <p className="text-center text-gray-500 text-sm mb-4">
              Please wait while we set up the barcode scanner...
            </p>

            {/* Animated loader bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Stage indicator */}
            <div className="flex items-center justify-center gap-2 mt-4 text-gray-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>
                {progress < 30 && 'Downloading module...'}
                {progress >= 30 && progress < 70 && 'Installing components...'}
                {progress >= 70 && progress < 100 && 'Finalizing setup...'}
                {progress >= 100 && 'Almost done...'}
              </span>
            </div>
          </>
        );

      case 'success':
        return (
          <>
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-center text-gray-900 text-xl font-bold mb-3">
              Scanner Ready!
            </h2>

            {/* Message */}
            <p className="text-center text-gray-600 text-sm mb-6">
              The barcode scanner has been installed successfully.
              You can now scan any product barcode.
            </p>

            {/* Button */}
            <Button
              onClick={onClose}
              className="w-full py-3 bg-primary text-white"
            >
              Start Scanning
            </Button>
          </>
        );

      case 'error':
        return (
          <>
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-center text-gray-900 text-xl font-bold mb-3">
              Installation Failed
            </h2>

            {/* Message */}
            <p className="text-center text-gray-600 text-sm mb-2">
              We couldn't install the barcode scanner module.
            </p>
            {errorMessage && (
              <p className="text-center text-red-600 text-sm mb-6">
                {errorMessage}
              </p>
            )}
            {!errorMessage && (
              <p className="text-center text-gray-500 text-xs mb-6">
                Please check your internet connection and try again.
              </p>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1 py-3"
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                className="flex-1 py-3 bg-primary text-white"
              >
                Try Again
              </Button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in duration-200">
        {/* Close Button - only show when not installing */}
        {state !== 'installing' && (
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {renderContent()}
      </div>
    </div>
  );
};

export default ModuleInstallModal;
