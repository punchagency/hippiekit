import { FilterIcon, SearchIcon } from '@/assets/homeIcons';
import { useState } from 'react';
import clock from '@/assets/Clock.svg';
import { SearchDisplayIcon } from '@/assets/icons';

const history = [
  { id: 1, name: 'Sample Item', date: '2024-06-01' },
  { id: 2, name: 'Another Item', date: '2024-06-02' },
  { id: 3, name: 'Old Item', date: '2024-06-03' },
  { id: 4, name: 'Test Item', date: '2024-06-04' },
];

export const SearchBox = () => {
  const [searchQuery, setSearchQuery] = useState('');
  return (
    <section className="relative pt-3 mx-7">
      {/* Search Bar */}
      <div className="relative mb-4">
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
