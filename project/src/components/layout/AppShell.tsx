import type { PropsWithChildren } from "react";
import type { MainCategory, NavigationGroup, SubCategory } from "../../app/config/navigation";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";

type AppShellProps = PropsWithChildren<{
  activeGroup: MainCategory;
  activeSubCategory: SubCategory;
  expandedGroup: MainCategory;
  isSidebarCollapsed: boolean;
  navigationGroups: readonly NavigationGroup[];
  onToggleGroup: (group: NavigationGroup) => void;
  onSelectSubCategory: (group: NavigationGroup, subCategory: SubCategory) => void;
  onToggleSidebar: () => void;
}>;

export function AppShell({
  activeGroup,
  activeSubCategory,
  children,
  expandedGroup,
  isSidebarCollapsed,
  navigationGroups,
  onToggleGroup,
  onSelectSubCategory,
  onToggleSidebar,
}: AppShellProps) {
  return (
    <div className={["app-shell", isSidebarCollapsed ? "is-sidebar-collapsed" : ""].filter(Boolean).join(" ")}>
      <Sidebar
        activeGroup={activeGroup}
        activeSubCategory={activeSubCategory}
        expandedGroup={expandedGroup}
        isCollapsed={isSidebarCollapsed}
        navigationGroups={navigationGroups}
        onSelectSubCategory={onSelectSubCategory}
        onToggleGroup={onToggleGroup}
        onToggleSidebar={onToggleSidebar}
      />
      <div className="app-shell__body">
        <TopHeader
          groupLabel={activeGroup}
          title={activeSubCategory}
        />
        <main className="app-shell__content">{children}</main>
      </div>
    </div>
  );
}
