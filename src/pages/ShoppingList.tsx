import { Products } from '@/components/Products';
import logo from '@/assets/profileImgSample.jpg';
import { Title } from '@/components/Title';

const ShoppingList = () => {
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
    <section className="mx-[24.5px]">
      <Title title="Shopping List" />

      <Products data={productsGridData} />
    </section>
  );
};

export default ShoppingList;
