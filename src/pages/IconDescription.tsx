import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import cleanIngredientsIcon from '@/assets/cleanIngredientsIcon.svg';
import chemicalsIcon from '@/assets/chemicalsIcon.svg';

const IconDescription = () => {
  const iconCategories = [
    {
      title: 'Product Safety Indicators',
      icons: [
        {
          icon: cleanIngredientsIcon,
          name: 'Clean Ingredients',
          color: 'bg-[#E8F5E9]',
          textColor: 'text-[#4E6C34]',
          description:
            'Products marked with this icon contain ingredients that are considered safe, natural, and free from harmful chemicals. These products prioritize your health and well-being.',
        },
        {
          icon: chemicalsIcon,
          name: 'Harmful Chemicals',
          color: 'bg-[#FFEEEE]',
          textColor: 'text-[#F35959]',
          description:
            'This icon indicates products that may contain chemicals of concern. We recommend reviewing the ingredient list carefully before use.',
        },
      ],
    },
    {
      title: 'Tag Colors',
      colorTags: [
        {
          color: 'bg-[#4E6C34]',
          name: 'Green Tags',
          description:
            'Green tags indicate positive attributes such as clean ingredients, eco-friendly materials, or sustainable practices.',
        },
        {
          color: 'bg-[#F35959]',
          name: 'Red Tags',
          description:
            'Red tags highlight ingredients or practices that may be harmful or concerning. Pay attention to these warnings.',
        },
        {
          color: 'bg-[#B8860B]',
          name: 'Yellow Tags',
          description:
            'Yellow tags indicate ingredients or attributes that require caution. These may be safe for some but problematic for others.',
        },
      ],
    },
    {
      title: 'Product Rating',
      ratings: [
        {
          stars: 5,
          description: 'Excellent - Highly recommended product with outstanding reviews.',
        },
        {
          stars: 4,
          description: 'Very Good - Quality product with positive feedback.',
        },
        {
          stars: 3,
          description: 'Good - Average product that meets basic expectations.',
        },
        {
          stars: 2,
          description: 'Fair - Below average, may have some issues.',
        },
        {
          stars: 1,
          description: 'Poor - Not recommended based on reviews.',
        },
      ],
    },
  ];

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={i < count ? '#FFD700' : 'none'}
        stroke="#FFD700"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ));
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-8">
      {/* Header */}
      <div className="px-4">
        <PageHeader title="Icon Description" />
      </div>

      {/* Content */}
      <div className="px-4 pt-2 max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-8">
          <div>
            <p className="text-gray-700 leading-relaxed">
              Learn what the different icons, tags, and indicators mean in
              Hippiekit. This guide will help you make informed decisions about
              the products you choose.
            </p>
          </div>

          {/* Product Safety Indicators */}
          <section>
            <h2 className="text-lg font-bold text-primary font-family-segoe mb-4">
              {iconCategories[0].title}
            </h2>
            <div className="space-y-4">
              {iconCategories[0].icons?.map((item, index) => (
                <div
                  key={index}
                  className={`rounded-lg p-4 ${item.color}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={item.icon}
                      alt={item.name}
                      className="w-6 h-6"
                    />
                    <span className={`font-bold ${item.textColor}`}>
                      {item.name}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Tag Colors */}
          <section>
            <h2 className="text-lg font-bold text-primary font-family-segoe mb-4">
              {iconCategories[1].title}
            </h2>
            <div className="space-y-4">
              {iconCategories[1].colorTags?.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div
                    className={`w-4 h-4 rounded-full ${item.color} shrink-0 mt-1`}
                  />
                  <div>
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Product Rating */}
          <section>
            <h2 className="text-lg font-bold text-primary font-family-segoe mb-4">
              {iconCategories[2].title}
            </h2>
            <div className="space-y-3">
              {iconCategories[2].ratings?.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex shrink-0">{renderStars(item.stars)}</div>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Additional Info */}
          <section className="pt-4 border-t border-gray-200">
            <h2 className="text-lg font-bold text-primary font-family-segoe mb-3">
              Need More Help?
            </h2>
            <p className="text-gray-700 text-sm mb-4">
              If you have questions about any icons or indicators not listed
              here, please visit our Help Center or contact our support team.
            </p>
            <Link
              to="/help"
              className="inline-block bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              Visit Help Center
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};

export default IconDescription;
