import type { PropsWithChildren, ReactNode } from "react";

type FilterPanelProps = PropsWithChildren<{
  actions?: ReactNode;
}>;

export function FilterPanel({ actions, children }: FilterPanelProps) {
  return (
    <section className="mb-5 flex flex-col gap-3 rounded-[12px] border border-[#e1e5eb] bg-[#f8f9fb] p-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="grid w-full gap-3 md:grid-cols-2 xl:grid-cols-3">{children}</div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </section>
  );
}
