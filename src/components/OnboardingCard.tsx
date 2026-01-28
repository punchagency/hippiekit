type Props = {
  OnboardingIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  OnboardingIconBg: React.FC<React.SVGProps<SVGSVGElement>>;
  OnboardingIconLogo: React.FC<React.SVGProps<SVGSVGElement>>;
  title: string;
  subtitle: string;
  description: string;
  direction?: 'left' | 'right';
};

export const OnboardingCard = ({
  OnboardingIcon,
  OnboardingIconBg,
  OnboardingIconLogo,
  title,
  subtitle,
  description,
  direction = 'right',
}: Props) => {
  const slideClass =
    direction === 'left'
      ? 'onboarding-slide-in-right'
      : 'onboarding-slide-in-left';

  return (
    <div className={`relative w-full h-full flex flex-col ${slideClass}`}>
      {/* Icon Container - flexible height, takes ~40% of space */}
      <div className="relative w-full flex-[4] min-h-0 flex items-center justify-center overflow-hidden">
        <div
          className="absolute z-0 onboarding-content-enter [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:w-auto [&>svg]:h-auto"
          style={{ animationDelay: '100ms' }}
        >
          <OnboardingIconBg />
        </div>
        <div
          className="absolute z-10 onboarding-content-enter [&>svg]:max-w-[90%] [&>svg]:max-h-[90%] [&>svg]:w-auto [&>svg]:h-auto"
          style={{ animationDelay: '200ms' }}
        >
          <OnboardingIcon />
        </div>
      </div>

      {/* Content Below Icons - flexible height, takes ~60% of space */}
      <div className="flex-[6] min-h-0 font-family-lato text-secondary bg-[#FFF] rounded-tl-[40px] rounded-tr-[40px] shadow-[0px_-10px_40px_0px_rgba(0,0,0,0.06)] px-6 py-6 w-full flex flex-col overflow-auto">
        <div className="flex flex-col gap-4 items-center flex-1 justify-center">
          <div
            className="w-20 h-20 shrink-0 rounded-full bg-[#FDF6FF] flex items-center justify-center onboarding-content-enter"
            style={{ animationDelay: '300ms' }}
          >
            <div className="[&>svg]:w-12 [&>svg]:h-12">
              <OnboardingIconLogo />
            </div>
          </div>
          <p
            className="font-family-segoe text-2xl text-center font-bold capitalize onboarding-content-enter"
            style={{ animationDelay: '400ms' }}
          >
            {title}
          </p>
          <p
            className="text-primary font-normal text-base onboarding-content-enter"
            style={{ animationDelay: '500ms' }}
          >
            {subtitle}
          </p>

          <p
            className="text-center text-sm font-semibold leading-6 not-italic px-2 onboarding-content-enter"
            style={{ animationDelay: '600ms' }}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};
