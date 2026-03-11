type TopHeaderProps = {
  groupLabel: string;
  title: string;
};

export function TopHeader({ groupLabel, title }: TopHeaderProps) {
  return (
    <header className="flex min-h-[52px] items-center border-b border-[#e4e7ec] bg-white px-7 text-[14px] text-[#6b7280] max-[820px]:px-4">
      <div className="inline-flex items-center gap-3">
        <span>{groupLabel}</span>
        <span className="text-[#c0c7d2]">›</span>
        <span className="text-[#4b5563]">{title}</span>
      </div>
    </header>
  );
}
