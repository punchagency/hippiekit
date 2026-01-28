import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingCard } from '@/components/OnboardingCard';
import { Button } from '@/components/ui/button';
import { onboardingIconsMap } from '@/constants';
import { ArrowLeft, ArrowRight } from '@/assets/onboardingIcons';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [serverStatus, setServerStatus] = useState<string>('');
  const [testing, setTesting] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const navigate = useNavigate();
  const totalSteps = onboardingIconsMap.length;
  const isLastStep = currentStep === totalSteps - 1;

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const testServer = async () => {
    setTesting(true);
    setServerStatus('Testing...');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      console.log('Testing server at:', apiUrl);

      const response = await fetch(`${apiUrl}/`, {
        method: 'GET',
        headers: {},
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setServerStatus(
          `✅ Server: ${data.message || 'Running!'} (Status: ${
            response.status
          })`
        );
      } else {
        const text = await response.text();
        console.log('Response text:', text.substring(0, 200));
        setServerStatus(
          `❌ Server returned HTML instead of JSON. Status: ${response.status}. Check ngrok.`
        );
      }
    } catch (error) {
      console.error('Server test error:', error);
      setServerStatus(
        `❌ Error: ${
          error instanceof Error ? error.message : 'Failed to connect'
        }`
      );
    } finally {
      setTesting(false);
    }
  };

  const handleNext = () => {
    if (isLastStep) {
      navigate('/signup');
    } else {
      setDirection('left');
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection('right');
      setCurrentStep((prev) => prev - 1);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && !isLastStep) {
      handleNext();
    }
    if (isRightSwipe && currentStep > 0) {
      handleBack();
    }
  };

  const handleSkip = () => {
    navigate('/signup');
  };

  const currentData = onboardingIconsMap[currentStep];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Skip Button and Test Server - Fixed at top */}
      <div className="flex justify-between items-center p-4 max-[400px]:p-3 shrink-0">
        <Button
          onClick={testServer}
          disabled={testing}
          className="bg-blue-500 text-white border-0 rounded-full px-4 py-1 text-sm"
        >
          {testing ? 'Testing...' : 'Test Server'}
        </Button>
        <Button
          onClick={handleSkip}
          className="bg-transparent text-secondary border border-secondary rounded-full px-4 py-1 text-sm"
        >
          Skip
        </Button>
      </div>

      {/* Server Status Display */}
      {serverStatus && (
        <div className="px-4 pb-2 shrink-0">
          <div
            className={`p-2.5 rounded-lg text-sm ${
              serverStatus.startsWith('✅')
                ? 'bg-green-100 text-green-800'
                : serverStatus.startsWith('❌')
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {serverStatus}
          </div>
        </div>
      )}

      {/* Onboarding Card - Fills remaining space */}
      <div
        className="flex-1 overflow-hidden min-h-0"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <OnboardingCard
          key={currentStep}
          direction={direction}
          OnboardingIcon={currentData.icon}
          OnboardingIconBg={currentData.iconBg}
          OnboardingIconLogo={currentData.iconLogo}
          title={currentData.title}
          subtitle={currentData.subtitle}
          description={currentData.description}
        />
      </div>

      {/* Progress Dots & Navigation - Fixed at bottom */}
      <div className="py-4 px-4 bg-white shrink-0">
        <div className="flex justify-between items-center">
          <Button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`bg-transparent border border-primary text-primary rounded-full px-4 py-1.5 text-sm ${
              currentStep === 0 ? 'invisible' : 'visible'
            }`}
          >
            <ArrowLeft /> Back
          </Button>

          {/* Progress Dots */}
          <div className="flex gap-1.5">
            {onboardingIconsMap.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-6 bg-primary'
                    : 'w-2 bg-gray-300'
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            className="bg-transparent border border-primary text-primary rounded-full px-4 py-1.5 text-sm"
          >
            {isLastStep ? (
              'Get Started'
            ) : (
              <>
                Next <ArrowRight />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
