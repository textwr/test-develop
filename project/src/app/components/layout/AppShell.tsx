import type { PropsWithChildren } from "react";
import type { MainCategory, NavigationGroup, SubCategory } from "@/app/config/navigation";
import { Sidebar } from "@/app/components/layout/Sidebar";
import { TopHeader } from "@/app/components/layout/TopHeader";
import { cn } from "@/app/utils/cn";

type AppShellProps = PropsWithChildren<{
  activeGroup: MainCategory;
  activeSubCategory: SubCategory;
  expandedGroups: MainCategory[];
  isSidebarCollapsed: boolean;
  navigationGroups: readonly NavigationGroup[];
  onSelectSubCategory: (group: NavigationGroup, subCategory: SubCategory) => void;
  onToggleGroup: (group: NavigationGroup) => void;
  onToggleSidebar: () => void;
}>;

export function AppShell({
  activeGroup,
  activeSubCategory,
  children,
  expandedGroups,
  isSidebarCollapsed,
  navigationGroups,
  onSelectSubCategory,
  onToggleGroup,
  onToggleSidebar,
}: AppShellProps) {
  return (
    <div
      className={cn(
        "grid min-h-screen bg-[#f3f4f6] transition-[grid-template-columns] duration-200 max-[1180px]:grid-cols-1",
        isSidebarCollapsed ? "grid-cols-[76px_minmax(0,1fr)]" : "grid-cols-[215px_minmax(0,1fr)]",
      )}
    >
      <Sidebar
        activeGroup={activeGroup}
        activeSubCategory={activeSubCategory}
        expandedGroups={expandedGroups}
        isCollapsed={isSidebarCollapsed}
        navigationGroups={navigationGroups}
        onSelectSubCategory={onSelectSubCategory}
        onToggleGroup={onToggleGroup}
        onToggleSidebar={onToggleSidebar}
      />
      <div className="flex min-w-0 flex-col">
        <TopHeader
          groupLabel={activeGroup}
          title={activeSubCategory}
        />
        <main className="px-5 pb-8 pt-5 max-[820px]:px-4">{children}</main>
      </div>
    </div>
  );
}
