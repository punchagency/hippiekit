type Props = {
  topCat?: boolean;
  products: {
    id: number;
    category?: string;
    name: string;
    price: string;
    image: string;
    items: string;
  }[];
};

export const Categories = ({ products, topCat }: Props) => {
  const displayProducts = topCat ? products.slice(0, 4) : products;

  return (
    <div className="grid grid-cols-4 gap-4 sm:gap-7.5 justify-items-center">
      {displayProducts.map((category, index) => (
        <div
          key={index}
          className="flex flex-col items-center gap-1.5 sm:gap-2 w-[55px] sm:w-[60px] font-family-Inter"
        >
          <div className="w-[55px] h-[55px] sm:w-[60px] sm:h-[60px] rounded-[10px] overflow-hidden">
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-[14px] sm:text-[16px] font-semibold text-center leading-tight sm:leading-4">
            {topCat ? category.category : category.name}
          </span>
          <span className="text-[11px] sm:text-[13px] font-normal text-[#1D1D21]">
            {category.items} Items
          </span>
        </div>
      ))}
    </div>
  );
};
