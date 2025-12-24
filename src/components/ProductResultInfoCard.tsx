import { Button } from './ui/button';

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
}: Props) => {
  const getTagColorClasses = () => {
    if (tagColor === 'red') {
      return 'text-[#F35959] border-[#F35959]';
    }
    if (tagColor === 'green') {
      return 'text-[#4E6C34] border-[#4E6C34]';
    }
    return 'text-black border-[#DADADA]';
  };

  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex gap-2.5">
        <img src={icon} alt="" />
        <span
          className={`capitalize ${
            titleType === 'positive'
              ? 'text-[#4E6C34]'
              : titleType === 'negative'
              ? 'text-[#F35959]'
              : 'text-primary'
          } font-family-segoe font-bold`}
        >
          {title}
        </span>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {tags.map((tag) => (
          <Button
            key={tag}
            className={`bg-transparency border font-family-roboto hover:bg-gray-100 transition-colors ${getTagColorClasses()}`}
            onClick={() =>
              onTagClick && onTagClick(tag, tagDescriptions[tag] || '')
            }
            title={tag.length > 30 ? tag : undefined}
          >
            {tag.length > 30 ? tag.substring(0, 30) + '...' : tag}
          </Button>
        ))}
      </div>
      <div className="rounded-[10px] p-4 bg-[#FFEEEE]">
        <p className="font-family-segoe font-bold capitalize">{descTitle}</p>
        <p className="mt-5 font-family-roboto text-[14px] whitespace-pre-line">
          {typeof description === 'string'
            ? description
            : JSON.stringify(description)}
        </p>
      </div>
    </section>
  );
};
