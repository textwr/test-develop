// The prototype keeps the menu structure in one place so the sidebar,
// breadcrumb, and page-selection logic can all share the same source of truth.
export const navigationGroups = [
  {
    label: "영업관리",
    icon: "sales",
    items: ["수주정보"],
  },
  {
    label: "자재관리",
    icon: "material",
    items: ["발주정보", "가입고정보", "입고현황", "자재재고현황", "자재불량현황"],
  },
  {
    label: "생산관리",
    icon: "production",
    items: [
      "생산소요량 산출",
      "생산계획",
      "작업지시",
      "작업실적현황",
      "원소재투입분석",
      "원소재투입현황",
      "제품불량현황",
      "비가동현황",
      "제품중량현황",
    ],
  },
] as const;

export type NavigationGroup = (typeof navigationGroups)[number];
export type MainCategory = NavigationGroup["label"];
export type SidebarIconKey = NavigationGroup["icon"];
export type SubCategory = NavigationGroup["items"][number];
