import { Categories } from '@/components/Categories';
import backButton from '@/assets/backButton.svg';
import profileSampleImage from '@/assets/profileImgSample.jpg';

const AllCategories = () => {
  const categories = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `Category ${i + 1}`,
    price: '$29.99',
    image: profileSampleImage,
    items: '50',
  }));

  return (
    <section className="relative mx-[24.5px]">
      <div className="flex items-center justify-between mb-4">
        <div className="rounded-[7px] p-2.5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]">
          <img src={backButton} alt="" />
        </div>

        <div className="mt-10 flex p-2.5 items-center gap-[7px] ">
          <span className="font-family-segoe text-primary text-[18px] font-bold">
            All Categories
          </span>
        </div>

        <div></div>
      </div>

      <div className="mt-[37px]">
        <Categories products={categories} />
      </div>
    </section>
  );
};

export default AllCategories;
