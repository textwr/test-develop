import logoImage from "../../app/assets/logo.png";
import type { MainCategory, NavigationGroup, SidebarIconKey, SubCategory } from "../../app/config/navigation";

type SidebarProps = {
  activeGroup: MainCategory;
  activeSubCategory: SubCategory;
  expandedGroup: MainCategory;
  isCollapsed: boolean;
  navigationGroups: readonly NavigationGroup[];
  onToggleGroup: (group: NavigationGroup) => void;
  onSelectSubCategory: (group: NavigationGroup, subCategory: SubCategory) => void;
  onToggleSidebar: () => void;
};

export function Sidebar({
  activeGroup,
  activeSubCategory,
  expandedGroup,
  isCollapsed,
  navigationGroups,
  onToggleGroup,
  onSelectSubCategory,
  onToggleSidebar,
}: SidebarProps) {
  return (
    <aside className={["sidebar", isCollapsed ? "is-collapsed" : ""].filter(Boolean).join(" ")}>
      <div className="sidebar__brand">
        <img
          alt="상우하이텍 로고"
          className="sidebar__logo"
          src={logoImage}
        />
        {!isCollapsed ? (
          <div className="sidebar__brand-text">
            <p className="sidebar__title">상우하이텍</p>
            <p className="sidebar__subtitle">Smart Factory</p>
          </div>
        ) : null}
        <button
          aria-label={isCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
          className="sidebar__menu-button"
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

      <nav className="sidebar__nav">
        {navigationGroups.map((group) => {
          const isOpen = group.label === expandedGroup;
          const isActiveGroup = group.label === activeGroup;

          return (
            <div
              className="sidebar__group"
              key={group.label}
            >
              <button
                className={[
                  "sidebar__group-button",
                  isActiveGroup ? "is-active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onToggleGroup(group)}
                type="button"
              >
                <span className="sidebar__group-button-content">
                  <SidebarGroupIcon icon={group.icon} />
                  {!isCollapsed ? <span>{group.label}</span> : null}
                </span>
                <span
                  className={[
                    "sidebar__caret",
                    isOpen ? "is-open" : "",
                    isCollapsed ? "is-hidden" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <svg
                    fill="none"
                    height="16"
                    viewBox="0 0 24 24"
                    width="16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 10L12 14L16 10"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </span>
              </button>

              {isOpen && !isCollapsed ? (
                <div className="sidebar__sub-list">
                  {group.items.map((subCategory) => (
                    <button
                      className={[
                        "sidebar__sub-button",
                        subCategory === activeSubCategory ? "is-active" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
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

      <div className="sidebar__profile">
        <div className="sidebar__profile-avatar">관</div>
        {!isCollapsed ? (
          <div>
            <p className="sidebar__profile-name">관리자</p>
            <p className="sidebar__profile-id">admin</p>
          </div>
        ) : null}
        <button
          aria-label="로그인 상태 확인"
          className="sidebar__profile-action"
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
      <svg
        fill="none"
        height="18"
        viewBox="0 0 24 24"
        width="18"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 5H5L7.2 15.4C7.39 16.28 8.17 16.91 9.07 16.91H18.4C19.3 16.91 20.08 16.28 20.27 15.4L21.6 9.2H6.1"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <circle
          cx="9.5"
          cy="20"
          r="1.3"
          fill="currentColor"
        />
        <circle
          cx="18"
          cy="20"
          r="1.3"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (icon === "material") {
    return (
      <svg
        fill="none"
        height="18"
        viewBox="0 0 24 24"
        width="18"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 3L19 7V17L12 21L5 17V7L12 3Z"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <path
          d="M12 12L19 7M12 12L5 7M12 12V21"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.6"
        />
      </svg>
    );
  }

  return (
    <svg
      fill="none"
      height="18"
      viewBox="0 0 24 24"
      width="18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 19V10M10 19V5M16 19V13M22 19V8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        d="M3 19H23"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
