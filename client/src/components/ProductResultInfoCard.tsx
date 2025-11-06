import { Button } from './ui/button';

type Props = {
  icon: string;
  title: string;
  titleType?: 'positive' | 'negative' | 'normal';
  tags: string[];
  descTitle: string;
  description: string;
};

export const ProductResultInfoCard = ({
  icon,
  title,
  titleType = 'normal',
  tags,
  descTitle,
  description,
}: Props) => {
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
            className="bg-transparency border border-[#DADADA] font-family-roboto"
          >
            {tag}
          </Button>
        ))}
      </div>
      <div className="rounded-[10px] p-4 bg-[#FFEEEE]">
        <p className="font-family-segoe font-bold capitalize">{descTitle}</p>
        <p className="mt-5 font-family-roboto text-[14px]">{description}</p>
      </div>
    </section>
  );
};
