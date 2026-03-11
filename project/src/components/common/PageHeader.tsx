import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PageHeader({ actions, description, title }: PageHeaderProps) {
  return (
    <div className="page-section__header">
      <div>
        <h1 className="page-title">{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {actions ? <div className="page-section__actions">{actions}</div> : null}
    </div>
  );
}
