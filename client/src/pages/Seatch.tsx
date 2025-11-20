import { FilterIcon, SearchIcon } from '@/assets/homeIcons';
import { useState } from 'react';
import clock from '@/assets/clock.svg';
import { NotificationIcon, SearchDisplayIcon } from '@/assets/icons';
import backButton from '@/assets/backButton.svg';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const history = [
  { id: 1, name: 'Sample Item', date: '2024-06-01' },
  { id: 2, name: 'Another Item', date: '2024-06-02' },
  { id: 3, name: 'Old Item', date: '2024-06-03' },
  { id: 4, name: 'Test Item', date: '2024-06-04' },
];

export const Search = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  return (
    <section className="relative pt-6 mx-7">
      <div className="flex items-center justify-between mb-4">
        <Button
          onClick={() => navigate(-1)}
          className="rounded-[7px] p-2.5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]"
        >
          <img src={backButton} alt="" />
        </Button>

        <div className="mt-10 flex p-2.5 items-center gap-[7px] ">
          <span className="font-family-segoe text-primary text-[18px] font-bold">
            Search Here
          </span>
        </div>
        <button
          onClick={() => navigate('/notifications')}
          className="rounded-[7px] p-2 sm:p-2.5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]"
        >
          <NotificationIcon />
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mt-9 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search Here For Specific Item"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-primary p-2.5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <SearchIcon />
            </div>
          </div>
          <button className="p-3 bg-white rounded-lg border border-gray-200">
            <FilterIcon />
          </button>
        </div>
      </div>

      {history.length > 0 ? (
        history.map((item) => (
          <div
            key={item.id}
            className="flex font-family-roboto text-[16px] justify-between mx-2 gap-3.5 py-3.5 border-b border-[#DADADA]"
          >
            <div className="flex gap-4">
              <img src={clock} />
              {item.name}
            </div>

            <SearchDisplayIcon />
          </div>
        ))
      ) : (
        <div>No Results Found</div>
      )}
    </section>
  );
};
