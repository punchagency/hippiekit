import { useState } from 'react';
import logo from '@/assets/profileImgSample.jpg';
import logoactual from '@/assets/logo.jpg';
import {
  SearchIcon,
  FilterIcon,
  OptionsIcon,
  ScanIcon,
  QRIcon,
  CameraIcon,
} from '@/assets/homeIcons';
import { NotificationIcon } from './assets/icons';
import { Categories } from './components/Categories';
import { Products } from './components/Products';
import HomeSidebar from './pages/HomeSidebar';
import { Link, useNavigate } from 'react-router-dom';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  // Sample product data - replace with your actual data
  const products = [
    { id: 1, name: 'Product 1', price: '$29.99', image: logo, items: '50' },
    { id: 2, name: 'Product 2', price: '$39.99', image: logo, items: '50' },
    { id: 3, name: 'Product 3', price: '$24.99', image: logo, items: '50' },
    { id: 4, name: 'Product 4', price: '$49.99', image: logo, items: '50' },
    { id: 5, name: 'Product 5', price: '$19.99', image: logo, items: '50' },
    { id: 6, name: 'Product 6', price: '$34.99', image: logo, items: '50' },
  ];

  const productsGridData = [
    {
      id: 1,
      image: logo,
      price: '$29.99',
      productName: 'Product 1',
      description: 'High quality product with excellent features',
      rating: 4.5,
    },
    {
      id: 2,
      image: logo,
      price: '$39.99',
      productName: 'Product 2',
      description: 'Premium quality product',
      rating: 4.8,
    },
    {
      id: 3,
      image: logo,
      price: '$24.99',
      productName: 'Product 3',
      description: 'Affordable and reliable product',
      rating: 4.2,
    },
    {
      id: 4,
      image: logo,
      price: '$49.99',
      productName: 'Product 4',
      description: 'Top-rated product in its category',
      rating: 4.9,
    },
    {
      id: 5,
      image: logo,
      price: '$19.99',
      productName: 'Product 5',
      description: 'Best value for money',
      rating: 4.3,
    },
    {
      id: 6,
      image: logo,
      price: '$34.99',
      productName: 'Product 6',
      description: 'Popular choice among customers',
      rating: 4.6,
    },
  ];

  return (
    <div className="relative min-h-full overflow-hidden">
      <HomeSidebar open={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
      {/* Header */}
      <header className="px-4 sm:px-5 pt-4 sm:pt-6 pb-3 sm:pb-4">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-[7px] p-2 sm:p-2.5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]"
          >
            <OptionsIcon />
          </button>

          <div className="mt-6 sm:mt-10 flex p-2 sm:p-2.5 items-center gap-[7px] rounded-[85px] border border-secondary">
            <img
              src={logoactual}
              alt="Logo"
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
            />
            <span className="font-family-segoe text-primary text-[14px] sm:text-[18px] font-bold">
              Hippiekit
            </span>
          </div>

          <button className="rounded-[7px] p-2 sm:p-2.5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]">
            <Link to="/notifications" className="cursor-pointer w-full h-full">
              <NotificationIcon />
            </Link>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search Here For Specific Item"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-200 focus:outline-none focus:border-primary bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <SearchIcon />
              </div>
            </div>
            <button className="p-2.5 sm:p-3 bg-white rounded-lg border border-gray-200">
              <FilterIcon />
            </button>
          </div>
        </div>

        {/* Scan Button */}
        <div className="rounded-[7px] px-3 sm:px-4 py-4 sm:py-5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)] flex flex-col gap-4 sm:gap-7.5 items-center justify-center">
          <div className="flex flex-col gap-3 sm:gap-5 items-center justify-center">
            <div className="bg-[#F5F5F5] rounded-[10px] flex w-[54px] h-[50px] sm:w-[64.198px] sm:h-[60px] p-2.5 flex-col justify-center items-center gap-2.5">
              <ScanIcon />
            </div>
            <span className="font-family-segoe text-primary text-[16px] sm:text-[20px] font-bold capitalize text-center">
              Scan QR or upload photo
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5 w-full font-family-poppins font-semibold text-sm sm:text-base">
            <div className="flex flex-1 p-2 sm:p-2.5 justify-center items-center gap-2 sm:gap-4 rounded-md bg-primary">
              <QRIcon />
              <span className="text-white">Scan QR Code</span>
            </div>
            <div className="flex flex-1 p-2 sm:p-2.5 justify-center items-center gap-2 sm:gap-4 border border-primary rounded-md bg-transparency">
              <CameraIcon />
              <span className="text-primary font-medium">Browse Photo</span>
            </div>
          </div>
        </div>
      </header>

      {/* Top Categories */}
      <section className="mx-3 sm:mx-3.5 rounded-[7px] px-3 sm:px-4 py-4 sm:py-5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)] flex flex-col gap-4 sm:gap-7.5">
        <div className="flex justify-between items-center">
          <h2 className="text-primary font-family-segoe text-[16px] sm:text-[18px] font-bold capitalize">
            Top Categories
          </h2>

          <button
            className="text-[#848484] underline text-sm sm:text-base"
            onClick={() => navigate('/all-categories')}
          >
            See all
          </button>
        </div>
        <Categories products={products} />
      </section>

      {/* Products Grid */}
      <section className="mx-3 sm:mx-3.5 mt-3 mb-20 rounded-[7px] px-3 sm:px-4 py-4 sm:py-5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)] flex flex-col gap-4 sm:gap-7.5">
        <h2 className="text-primary font-family-segoe text-[16px] sm:text-[18px] font-bold capitalize">
          New Product Corner
        </h2>

        <Products data={productsGridData} />
      </section>
    </div>
  );
}

export default App;
