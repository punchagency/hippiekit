type Props = {
  icon: string;
  title: string;
  titleType?: 'positive' | 'negative' | 'normal';
  tags: string[];
  descTitle: string;
  description: string;
  onTagClick?: (tag: string, description: string) => void;
  tagDescriptions?: Record<string, string>;
  tagColor?: 'red' | 'green';
  isLoadingDescription?: boolean;
  selectedTag?: string | null;
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
  selectedTag,
}: Props) => {
  // Get base tag color classes
  const getTagColorClasses = (tag: string) => {
    const isSelected = selectedTag === tag;

    if (tagColor === 'red') {
      return isSelected
        ? '!bg-[#F35959] !text-white border-[#F35959] shadow-md scale-[1.02]'
        : 'bg-transparent text-[#F35959] border-[#F35959] hover:bg-[#F35959]/10 active:bg-[#F35959] active:text-white';
    }
    if (tagColor === 'green') {
      return isSelected
        ? '!bg-[#4E6C34] !text-white border-[#4E6C34] shadow-md scale-[1.02]'
        : 'bg-transparent text-[#4E6C34] border-[#4E6C34] hover:bg-[#4E6C34]/10 active:bg-[#4E6C34] active:text-white';
    }
    return isSelected
      ? '!bg-primary !text-white border-primary shadow-md scale-[1.02]'
      : 'bg-transparent text-black border-[#DADADA] hover:bg-primary/10 hover:border-primary/50 active:bg-primary active:text-white';
  };

  const getSpinnerColor = () => {
    if (tagColor === 'red') {
      return 'border-[#F35959]';
    }
    if (tagColor === 'green') {
      return 'border-[#4E6C34]';
    }
    return 'border-primary';
  };

  // Get description box background color based on type
  const getDescriptionBgColor = () => {
    if (tagColor === 'red') {
      return 'bg-[#FFF0F0] border border-[#F35959]/20';
    }
    if (tagColor === 'green') {
      return 'bg-[#F0F7EC] border border-[#4E6C34]/20';
    }
    return 'bg-[#F5F0F7] border border-primary/20';
  };

  // Get title icon background
  const getTitleIconBg = () => {
    if (titleType === 'positive') {
      return 'bg-[#4E6C34]/10';
    }
    if (titleType === 'negative') {
      return 'bg-[#F35959]/10';
    }
    return 'bg-primary/10';
  };

  return (
    <section className="flex flex-col gap-3 w-full px-3 sm:px-0">
      {/* Header */}
      <div className="flex gap-2.5 items-center">
        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${getTitleIconBg()} flex items-center justify-center flex-shrink-0`}>
          <img
            src={icon}
            alt=""
            className="w-4 h-4 sm:w-5 sm:h-5"
          />
        </div>
        <span
          className={`capitalize text-sm sm:text-[15px] ${titleType === 'positive'
            ? 'text-[#4E6C34]'
            : titleType === 'negative'
              ? 'text-[#F35959]'
              : 'text-primary'
            } font-family-segoe font-bold wrap-break-word`}
        >
          {title}
        </span>
      </div>

      {/* Tags with active states */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            className={`border font-family-roboto px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-all duration-200 cursor-pointer ${getTagColorClasses(tag)}`}
            onClick={() =>
              onTagClick && onTagClick(tag, tagDescriptions[tag] || '')
            }
            title={tag}
          >
            {tag.length > 25 ? tag.substring(0, 25) + '...' : tag}
          </button>
        ))}
      </div>

      {/* Description Box */}
      <div className={`rounded-xl p-3.5 sm:p-4 ${getDescriptionBgColor()} transition-all duration-300`}>
        <p className={`font-family-segoe font-bold capitalize text-sm sm:text-[15px] ${tagColor === 'red' ? 'text-[#c44545]' : tagColor === 'green' ? 'text-[#3d5629]' : 'text-primary'
          }`}>
          {descTitle}
        </p>
        {isLoadingDescription ? (
          <div className="mt-3 flex items-center gap-2 py-2">
            <div
              className={`w-4 h-4 border-2 ${getSpinnerColor()} border-t-transparent rounded-full animate-spin`}
            ></div>
            <span className="font-family-roboto text-xs sm:text-[13px] text-gray-600">
              {description}
            </span>
          </div>
        ) : (
          <p className="mt-2.5 font-family-roboto text-xs sm:text-[13px] text-gray-700 whitespace-pre-line break-words leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </section>
  );
};
