import { useEffect, useState } from 'react';

interface ScanningLoaderProps {
  isVisible: boolean;
}

export const ScanningLoader = ({ isVisible }: ScanningLoaderProps) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-linear-to-br from-purple-900 via-indigo-900 to-blue-900 animate-gradient pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center space-y-8 px-6 max-w-md w-full">
        {/* Scanning animation */}
        <div className="relative w-40 h-40">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-purple-400/30 animate-spin-slow" />

          {/* Middle ring */}
          <div className="absolute inset-4 rounded-full border-4 border-blue-400/50 animate-spin-reverse" />

          {/* Inner circle with pulse */}
          <div className="absolute inset-8 rounded-full bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center animate-pulse-slow">
            {/* Search/Scan icon */}
            <svg
              className="w-12 h-12 text-white animate-scale"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Text content */}
        <div className="text-center space-y-4 animate-fade-in">
          <h2 className="text-3xl font-bold text-white animate-slide-up">
            Analyzing Image
          </h2>

          <div className="flex items-center justify-center space-x-2 h-8">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" />
            <div className="w-3 h-3 bg-white rounded-full animate-bounce animation-delay-200" />
            <div className="w-3 h-3 bg-white rounded-full animate-bounce animation-delay-400" />
          </div>

          <p className="text-blue-200 text-lg animate-slide-up animation-delay-300">
            Our AI is finding the perfect matches for you{dots}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs h-2 bg-white/20 rounded-full overflow-hidden animate-fade-in animation-delay-500">
          <div className="h-full bg-linear-to-r from-purple-400 via-blue-400 to-cyan-400 animate-progress" />
        </div>

        {/* Scanning tips */}
        <div className="text-center text-blue-300/80 text-sm animate-fade-in animation-delay-700">
          <p>Processing your image with advanced AI technology</p>
        </div>
      </div>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }

        @keyframes scale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 10s ease infinite;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-spin-reverse {
          animation: spin-reverse 2s linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }

        .animate-scale {
          animation: scale 1.5s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .animation-delay-500 {
          animation-delay: 0.5s;
        }

        .animation-delay-700 {
          animation-delay: 0.7s;
        }

        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
