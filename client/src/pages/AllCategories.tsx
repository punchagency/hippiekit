import { Categories } from '@/components/Categories';
import profileSampleImage from '@/assets/profileImgSample.jpg';
import { Title } from '@/components/Title';

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
      <Title title="All Categories" />

      <div className="mt-[37px]">
        <Categories products={categories} />
      </div>
    </section>
  );
};

export default AllCategories;
