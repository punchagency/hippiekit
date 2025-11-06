export function TitleSubtitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <p className="text-primary text-[24px] font-family-segoe font-bold">
        {title}
      </p>
      <p className="text-[16px] font-family-lato ">{subtitle}</p>
    </div>
  );
}
