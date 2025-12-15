import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingCard } from '@/components/OnboardingCard';
import { Button } from '@/components/ui/button';
import { onboardingIconsMap } from '@/constants';
import { ArrowLeft, ArrowRight } from '@/assets/onboardingIcons';
import { SafeAreaLayout } from '@/components/layouts/SafeAreaLayout';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [serverStatus, setServerStatus] = useState<string>('');
  const [testing, setTesting] = useState(false);
  const navigate = useNavigate();
  const totalSteps = onboardingIconsMap.length;
  const isLastStep = currentStep === totalSteps - 1;

  const testServer = async () => {
    setTesting(true);
    setServerStatus('Testing...');
    try {
      const apiUrl =
        import.meta.env.VITE_API_URL ||
        'https://slyvia-spaviet-suzy.ngrok-free.dev';
      console.log('Testing server at:', apiUrl);

      const response = await fetch(`${apiUrl}/`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
        },
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
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    navigate('/signup');
  };

  const currentData = onboardingIconsMap[currentStep];

  return (
    <SafeAreaLayout className="bg-white">
      {/* Skip Button and Test Server - Fixed at top */}
      <div className="flex justify-between items-center p-4 max-[400px]:p-3">
        <Button
          onClick={testServer}
          disabled={testing}
          className="bg-blue-500 text-white border-0 rounded-[60px] px-4 py-[5px] max-[400px]:px-3 max-[400px]:text-sm"
        >
          {testing ? 'Testing...' : 'Test Server'}
        </Button>
        <Button
          onClick={handleSkip}
          className="bg-transparent text-secondary border border-secondary inline-flex rounded-[60px] px-4 py-[5px] justify-center items-center gap-2.5 max-[400px]:px-3 max-[400px]:text-sm"
        >
          Skip
        </Button>
      </div>

      {/* Server Status Display */}
      {serverStatus && (
        <div className="px-4 pb-2">
          <div
            className={`p-3 rounded-lg text-sm ${
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
      <div className="flex-1 overflow-hidden">
        <OnboardingCard
          OnboardingIcon={currentData.icon}
          OnboardingIconBg={currentData.iconBg}
          OnboardingIconLogo={currentData.iconLogo}
          title={currentData.title}
          subtitle={currentData.subtitle}
          description={currentData.description}
        />
      </div>

      {/* Progress Dots & Navigation - Fixed at bottom */}
      <div className="pb-6 bg-white max-[400px]:pb-4">
        {/* Navigation Buttons and Progress Dots on Same Level */}
        <div className="flex justify-between items-center px-6 ">
          <Button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`bg-transparent border border-primary text-primary rounded-[60px] px-6 py-2 max-[400px]:px-4 max-[400px]:text-sm ${
              currentStep === 0 ? 'invisible' : 'visible'
            }`}
          >
            <ArrowLeft /> Back
          </Button>

          {/* Progress Dots */}
          <div className="flex gap-2 max-[400px]:gap-1.5">
            {onboardingIconsMap.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 max-[400px]:w-6 bg-primary'
                    : 'w-2 bg-gray-300'
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            className="bg-transparency border border-primary text-primary rounded-[60px] px-6 py-2 max-[400px]:px-4 max-[400px]:text-sm"
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
    </SafeAreaLayout>
  );
};

export default Onboarding;
