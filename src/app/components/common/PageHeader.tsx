import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  secondaryText?: string;
};

export function PageHeader({ actions, description, secondaryText, title }: PageHeaderProps) {
  return (
    <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
      <div className="grid gap-1.5">
        <h1 className="text-[26px] font-bold tracking-[-0.03em] text-[#0f172a]">{title}</h1>
        {description ? <p className="text-[13px] text-[#64748b]">{description}</p> : null}
        {secondaryText ? <p className="text-[13px] text-[#64748b]">{secondaryText}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
