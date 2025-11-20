import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingCard } from '@/components/OnboardingCard';
import { Button } from '@/components/ui/button';
import { onboardingIconsMap } from '@/constants';
import { ArrowLeft, ArrowRight } from '@/assets/onboardingIcons';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const totalSteps = onboardingIconsMap.length;
  const isLastStep = currentStep === totalSteps - 1;

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
    <div className="w-full relative h-[calc(100vh_-_(env(safe-area-inset-top))_-_(env(safe-area-inset-bottom)))] bg-white flex flex-col">
      {/* Skip Button - Fixed at top */}
      <div className="flex justify-end p-4 max-[400px]:p-3">
        <Button
          onClick={handleSkip}
          className="bg-transparent text-secondary border border-secondary inline-flex rounded-[60px] px-4 py-[5px] justify-center items-center gap-2.5 max-[400px]:px-3 max-[400px]:text-sm"
        >
          Skip
        </Button>
      </div>

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
    </div>
  );
};

export default Onboarding;
