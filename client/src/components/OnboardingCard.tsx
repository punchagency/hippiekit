type Props = {
  OnboardingIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  OnboardingIconBg: React.FC<React.SVGProps<SVGSVGElement>>;
  OnboardingIconLogo: React.FC<React.SVGProps<SVGSVGElement>>;
  title: string;
  subtitle: string;
  description: string;
};

export const OnboardingCard = ({
  OnboardingIcon,
  OnboardingIconBg,
  OnboardingIconLogo,
  title,
  subtitle,
  description,
}: Props) => {
  return (
    <div className="relative w-full flex flex-col items-center ">
      {/* Icon Container */}
      <div className="relative w-full h-[300px] flex items-center justify-center overflow-hidden max-[400px]:h-[250px]">
        <div className="absolute z-0 max-[400px]:scale-90">
          <OnboardingIconBg />
        </div>
        <div className="absolute z-10 max-[400px]:scale-90">
          <OnboardingIcon />
        </div>
      </div>

      {/* Content Below Icons */}
      <div className="font-family-lato text-secondary bg-[#FFF] rounded-tl-[40px] rounded-tr-[40px] shadow-[0px_-10px_40px_0px_rgba(0,0,0,0.06)] px-[25px] py-[30px] w-full max-[400px]:px-4 max-[400px]:py-5">
        <div className="px-2.5 flex flex-col gap-[30px] items-center max-[400px]:px-0 max-[400px]:gap-5">
          <div className="w-[100px] h-[100px] rounded-[59px] bg-[#FDF6FF] flex items-center justify-center max-[400px]:w-20 max-[400px]:h-20">
            <div className="absolute z-20 max-[400px]:scale-90">
              <OnboardingIconLogo />
            </div>
          </div>
          <p className="font-family-segoe text-[26px] text-center font-bold capitalize max-[400px]:text-[22px]">
            {title}
          </p>
          <p className=" text-primary font-normal  text-[18px] max-[400px]:text-base">
            {subtitle}
          </p>

          <p className="text-center text-[16px] font-semibold leading-6 flex-1 not-italic max-[400px]:text-sm max-[400px]:leading-5">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};
