// Navigation is centralized so the sidebar, breadcrumb, and page switching logic
// all stay aligned when the menu structure changes.
export const navigationGroups = [
  {
    label: "영업관리",
    icon: "sales",
    items: ["수주정보"],
  },
  {
    label: "자재관리",
    icon: "material",
    items: ["발주정보"],
  },
  {
    label: "생산관리",
    icon: "production",
    items: ["생산정보"],
  },
  {
    label: "품질관리",
    icon: "quality",
    items: ["품질정보"],
  },
  {
    label: "출하관리",
    icon: "shipping",
    items: ["출하정보"],
  },
  {
    label: "설비관리",
    icon: "facility",
    items: ["설비정보"],
  },
  {
    label: "계측기관리",
    icon: "meter",
    items: ["계측기정보"],
  },
  {
    label: "경영관리",
    icon: "management",
    items: ["경영정보"],
  },
  {
    label: "기준정보관리",
    icon: "reference",
    items: ["기준정보"],
  },
] as const;

export type NavigationGroup = (typeof navigationGroups)[number];
export type MainCategory = NavigationGroup["label"];
export type SidebarIconKey = NavigationGroup["icon"];
export type SubCategory = NavigationGroup["items"][number];
