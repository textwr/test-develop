import type { PropsWithChildren, ReactNode } from "react";

type FilterPanelProps = PropsWithChildren<{
  actions?: ReactNode;
}>;

export function FilterPanel({ actions, children }: FilterPanelProps) {
  return (
    <section className="filter-panel">
      <div className="filter-panel__fields">{children}</div>
      {actions ? <div className="filter-panel__actions">{actions}</div> : null}
    </section>
  );
}
