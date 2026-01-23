type Props = {
  icon: string;
  title: string;
  titleType?: 'positive' | 'negative' | 'normal' | 'warning';
  tags: string[];
  descTitle: string;
  description: string;
  onTagClick?: (tag: string, description: string) => void;
  tagDescriptions?: Record<string, string>;
  tagColor?: 'red' | 'green' | 'yellow';
  isLoadingDescription?: boolean;
};

export const ProductResultInfoCard = ({
  icon,
  title,
  titleType = 'normal',
  tags,
  descTitle,
  description,
  onTagClick,
  tagDescriptions = {},
  tagColor,
  isLoadingDescription = false,
}: Props) => {
  const getTagColorClasses = () => {
    if (tagColor === 'red') {
      return 'text-[#F35959] border-[#F35959]';
    }
    if (tagColor === 'green') {
      return 'text-[#4E6C34] border-[#4E6C34]';
    }
    if (tagColor === 'yellow') {
      return 'text-[#B8860B] border-[#B8860B]';
    }
    return 'text-black border-[#DADADA]';
  };

  const getSpinnerColor = () => {
    if (tagColor === 'red') {
      return 'border-[#F35959]';
    }
    if (tagColor === 'green') {
      return 'border-[#4E6C34]';
    }
    if (tagColor === 'yellow') {
      return 'border-[#B8860B]';
    }
    return 'border-primary';
  };

  const getDescriptionBgColor = () => {
    if (tagColor === 'red') {
      return 'bg-[#FFEEEE]';
    }
    if (tagColor === 'green') {
      return 'bg-[#E8F5E9]';
    }
    if (tagColor === 'yellow') {
      return 'bg-[#FFF8E1]';
    }
    return 'bg-[#FFEEEE]';
  };

  return (
    <section className="flex flex-col gap-2.5 w-full px-3 sm:px-0">
      <div className="flex gap-2 sm:gap-2.5 items-start">
        <img
          src={icon}
          alt=""
          className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
        />
        <span
          className={`capitalize text-sm sm:text-base ${
            titleType === 'positive'
              ? 'text-[#4E6C34]'
              : titleType === 'negative'
              ? 'text-[#F35959]'
              : titleType === 'warning'
              ? 'text-[#B8860B]'
              : 'text-primary'
          } font-family-segoe font-bold break-words`}
        >
          {title}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            className={`bg-transparent border font-family-roboto hover:bg-gray-100 transition-colors px-2 sm:px-3 py-1 text-xs sm:text-sm rounded ${getTagColorClasses()}`}
            onClick={() =>
              onTagClick && onTagClick(tag, tagDescriptions[tag] || '')
            }
            title={tag}
          >
            {tag.length > 25 ? tag.substring(0, 25) + '...' : tag}
          </button>
        ))}
      </div>
      <div className={`rounded-[10px] p-3 sm:p-4 ${getDescriptionBgColor()}`}>
        <p className="font-family-segoe font-bold capitalize text-sm sm:text-base">
          {descTitle}
        </p>
        {isLoadingDescription ? (
          <div className="mt-2 sm:mt-5 flex items-center justify-center gap-2 py-3">
            <div
              className={`w-4 h-4 border-2 ${getSpinnerColor()} border-t-transparent rounded-full animate-spin`}
            ></div>
            <span className="font-family-roboto text-xs sm:text-[14px]">
              {description}
            </span>
          </div>
        ) : (
          <p className="mt-2 sm:mt-5 font-family-roboto text-xs sm:text-[14px] whitespace-pre-line break-words">
            {description}
          </p>
        )}
      </div>
    </section>
  );
};
