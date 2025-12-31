import { SearchBox } from '@/components/SearchBox';
import backButton from '@/assets/backButton.svg';
import favoritesIcon from '@/assets/favoritesIcon.svg';

const FavoriteSearch = () => {
  return (
    <section className="mx-[24.5px]">
      <div className="flex items-center justify-between mb-4">
        <div className="rounded-[7px] p-2.5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]">
          <img src={backButton} alt="" className="w-5 h-5" />
        </div>

        <div className="mt-10 flex p-2.5 items-center gap-[7px] ">
          <img src={favoritesIcon} alt="Logo" className="" />
          <span className="font-family-segoe text-primary text-[18px] font-bold">
            Favorites
          </span>
        </div>

        <div></div>
      </div>
      <SearchBox />
    </section>
  );
};

export default FavoriteSearch;
