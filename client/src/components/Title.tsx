import { useNavigate } from 'react-router-dom';
import backButton from '../assets/backButton.svg';

export const Title = ({ title }: { title: string }) => {
  const navigate = useNavigate();

  return (
    <div className="mx-4 sm:mx-[20.89px] mb-3 sm:mb-4 relative flex items-center justify-center">
      <button
        onClick={() => navigate(-1)}
        className="absolute left-0 rounded-[7px] p-2 sm:p-2.5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]"
      >
        <img
          src={backButton}
          alt="Go back"
          className="w-4 h-4 sm:w-auto sm:h-auto"
        />
      </button>

      <div className="mt-6 sm:mt-10 flex p-2 sm:p-2.5 items-center gap-[7px]">
        <span className="font-family-segoe text-primary text-[16px] sm:text-[18px] font-bold">
          {title}
        </span>
      </div>
    </div>
  );
};
