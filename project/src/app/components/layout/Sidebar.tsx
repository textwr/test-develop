import logoImage from "@/assets/logo.png";
import type { MainCategory, NavigationGroup, SidebarIconKey, SubCategory } from "@/app/config/navigation";
import { cn } from "@/app/utils/cn";

type SidebarProps = {
  activeGroup: MainCategory;
  activeSubCategory: SubCategory;
  expandedGroups: MainCategory[];
  isCollapsed: boolean;
  navigationGroups: readonly NavigationGroup[];
  onSelectSubCategory: (group: NavigationGroup, subCategory: SubCategory) => void;
  onToggleGroup: (group: NavigationGroup) => void;
  onToggleSidebar: () => void;
};

export function Sidebar({
  activeGroup,
  activeSubCategory,
  expandedGroups,
  isCollapsed,
  navigationGroups,
  onSelectSubCategory,
  onToggleGroup,
  onToggleSidebar,
}: SidebarProps) {
  return (
    <aside className="flex min-h-screen flex-col bg-[linear-gradient(180deg,#5d71df_0%,#5669d8_100%)] text-white shadow-[inset_-1px_0_0_rgba(255,255,255,0.12)] max-[1180px]:min-h-0">
      <div
        className={cn(
          "grid items-center border-b border-white/12 px-3.5 py-4",
          isCollapsed ? "justify-items-center gap-3.5" : "grid-cols-[44px_minmax(0,1fr)_28px] gap-3",
        )}
      >
        <img
          alt="상우하이텍 로고"
          className="h-[44px] w-[44px] rounded-[12px] bg-white p-1.5"
          src={logoImage}
        />
        {!isCollapsed ? (
          <div>
            <p className="text-[15px] font-bold leading-tight tracking-[-0.01em]">상우하이텍</p>
            <p className="mt-0.5 text-[12px] text-white/75">Smart Factory</p>
          </div>
        ) : null}
        <button
          aria-label={isCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-white/10"
          onClick={onToggleSidebar}
          type="button"
        >
          <svg
            fill="none"
            height="18"
            viewBox="0 0 24 24"
            width="18"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 7H20M4 12H20M4 17H20"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
            />
          </svg>
        </button>
      </div>

      <nav className="grid gap-2 px-2.5 py-4">
        {navigationGroups.map((group) => {
          const isExpanded = expandedGroups.includes(group.label);
          const isActiveGroup = group.label === activeGroup;

          return (
            <div
              className="grid gap-1.5"
              key={group.label}
            >
              <button
                className={cn(
                  "flex min-h-[44px] items-center rounded-[12px] px-3.5 text-left transition hover:bg-white/10",
                  isCollapsed ? "justify-center px-0" : "justify-between",
                  isActiveGroup && "bg-white/10",
                )}
                onClick={() => onToggleGroup(group)}
                title={group.label}
                type="button"
              >
                <span className={cn("inline-flex items-center gap-3.5 text-[14px] font-semibold", isCollapsed && "justify-center")}>
                  <SidebarGroupIcon icon={group.icon} />
                  {!isCollapsed ? <span>{group.label}</span> : null}
                </span>
                {!isCollapsed ? (
                  <span className={cn("inline-flex transition", isExpanded && "rotate-180")}>
                    <SidebarChevron />
                  </span>
                ) : null}
              </button>

              {isExpanded && !isCollapsed ? (
                <div className="grid gap-1.5 pl-8">
                  {group.items.map((subCategory) => (
                    <button
                      className={cn(
                        "min-h-[34px] rounded-[12px] px-4 text-left text-[13px] text-white/85 transition hover:bg-white/10 hover:text-white",
                        subCategory === activeSubCategory && "bg-[#4f63d2] font-semibold text-white",
                      )}
                      key={subCategory}
                      onClick={() => onSelectSubCategory(group, subCategory)}
                      type="button"
                    >
                      {subCategory}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

      <div
        className={cn(
          "mt-auto mx-3.5 mb-3.5 flex items-center gap-3 rounded-[14px] border border-white/20 bg-white/4 p-3.5",
          isCollapsed && "justify-center p-2.5",
        )}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#5c70df]">
          <svg fill="none" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 12C14.4853 12 16.5 9.98528 16.5 7.5C16.5 5.01472 14.4853 3 12 3C9.51472 3 7.5 5.01472 7.5 7.5C7.5 9.98528 9.51472 12 12 12Z"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M4.5 20.25C4.5 16.9363 7.85786 14.25 12 14.25C16.1421 14.25 19.5 16.9363 19.5 20.25"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.8"
            />
          </svg>
        </div>
        {!isCollapsed ? (
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold">관리자</p>
            <p className="truncate text-[12px] text-white/75">admin</p>
          </div>
        ) : null}
        <button
          aria-label="로그인 상태 확인"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/10"
          onClick={() => {
            console.log("[auth-check] Sidebar profile inspected.", {
              confirmed: true,
              destination: "현재 세션 유지",
              timestamp: new Date().toISOString(),
            });
          }}
          type="button"
        >
          <svg
            fill="none"
            height="16"
            viewBox="0 0 24 24"
            width="16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 17L15 12L10 7M15 12H3M21 4V20"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
        </button>
      </div>
    </aside>
  );
}

function SidebarGroupIcon({ icon }: { icon: SidebarIconKey }) {
  if (icon === "sales") {
    return (
      <svg fill="none" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M3 5H5L7.2 15.4C7.39 16.28 8.17 16.91 9.07 16.91H18.4C19.3 16.91 20.08 16.28 20.27 15.4L21.6 9.2H6.1"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <circle cx="9.5" cy="20" fill="currentColor" r="1.3" />
        <circle cx="18" cy="20" fill="currentColor" r="1.3" />
      </svg>
    );
  }

  if (icon === "material") {
    return (
      <svg fill="none" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3L19 7V17L12 21L5 17V7L12 3Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
        <path d="M12 12L19 7M12 12L5 7M12 12V21" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" />
      </svg>
    );
  }

  if (icon === "production") {
    return (
      <svg fill="none" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 19V6H9V19M9 19V11H15V19M15 19V4H20V19" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (icon === "quality") {
    return (
      <svg fill="none" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
        <rect height="16" rx="3" stroke="currentColor" strokeWidth="1.8" width="14" x="5" y="4" />
        <path d="M9 12L11.5 14.5L15.5 9.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (icon === "shipping") {
    return (
      <svg fill="none" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 7H14V16H3V7Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
        <path d="M14 10H18L21 13V16H14V10Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
        <circle cx="7.5" cy="18" fill="currentColor" r="1.5" />
        <circle cx="17.5" cy="18" fill="currentColor" r="1.5" />
      </svg>
    );
  }

  if (icon === "facility") {
    return (
      <svg fill="none" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3L14.7 8.47L20.73 9.35L16.36 13.61L17.39 19.62L12 16.79L6.61 19.62L7.64 13.61L3.27 9.35L9.3 8.47L12 3Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" />
      </svg>
    );
  }

  if (icon === "meter") {
    return (
      <svg fill="none" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 15C5 10.5817 8.58172 7 13 7H19V17H5V15Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
        <path d="M13 12L16 10" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (icon === "management") {
    return (
      <svg fill="none" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 19V5H11V19M13 19V9H19V19" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (icon === "reference") {
    return (
      <svg fill="none" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="12" cy="6" rx="6.5" ry="2.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M5.5 6V18C5.5 19.3807 8.41015 20.5 12 20.5C15.5899 20.5 18.5 19.3807 18.5 18V6" stroke="currentColor" strokeWidth="1.8" />
        <path d="M5.5 12C5.5 13.3807 8.41015 14.5 12 14.5C15.5899 14.5 18.5 13.3807 18.5 12" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }

  return (
    <svg fill="none" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 19V10M10 19V5M16 19V13M22 19V8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path d="M3 19H23" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function SidebarChevron() {
  return (
    <svg fill="none" height="14" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 10L12 14L16 10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
