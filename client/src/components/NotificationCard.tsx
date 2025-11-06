import notificationCardIcon from '@/assets/notificationCardIcon.svg';
import { cn } from '@/lib/utils';

export const NotificationCard = ({ seen }: { seen: boolean }) => {
  return (
    <div className="rounded-[14px] px-3.5 pt-3.5 flex flex-col gap-4 font-family-roboto bg-white shadow-[0_2px_4px_0_rgba(0,0,0,0.10)]">
      <div className="flex items-start justify-between relative">
        <div className=" rounded-[10px] p-2 w-fit h-fit  bg-gray-300">
          <img src={notificationCardIcon} alt="Notification Icon" />
        </div>

        <div className="flex-1 pl-5">
          <span
            className={cn(
              'font-family-segoe font-bold',
              seen ? 'text-[#686868]' : 'text-primary'
            )}
          >
            Health Concerns
          </span>
          <ul className="list-disc list-inside text-[11.76px]">
            <li>Contains synthetic fragrance linked to allergies</li>
          </ul>
        </div>

        <div className="text-[#9E9E9E] text-[12px]">
          <span>1h</span>
        </div>

        {seen ? null : (
          <div className="w-1.5 h-1.5 border-2 border-primary bg-primary rounded-full absolute right-0 -bottom-4"></div>
        )}
      </div>

      <div className="w-[26.63px] h-[2.75px] bg-[#D9D9D9] mx-auto mb-[5px] rounded-xs"></div>
    </div>
  );
};
