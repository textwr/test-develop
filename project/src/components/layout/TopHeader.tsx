type TopHeaderProps = {
  groupLabel: string;
  title: string;
};

export function TopHeader({ groupLabel, title }: TopHeaderProps) {
  return (
    <header className="top-header">
      <div className="top-header__breadcrumb">
        <span>{groupLabel}</span>
        <span className="top-header__divider">›</span>
        <span>{title}</span>
      </div>
    </header>
  );
}
