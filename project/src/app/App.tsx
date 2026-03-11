import { useState } from "react";
import type { MainCategory, NavigationGroup, SubCategory } from "@/app/config/navigation";
import { navigationGroups } from "@/app/config/navigation";
import { AppShell } from "@/app/components/layout/AppShell";
import backgroundImage from "@/assets/background.jpg";
import logoImage from "@/assets/logo.png";
import { LoginPage } from "@/pages/LoginPage";
import { OrderDetailPage } from "@/pages/OrderDetailPage";
import { OrderListPage } from "@/pages/OrderListPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";

type LoginCredentials = {
  userId: string;
  password: string;
};

type CurrentView =
  | { type: "order-list" }
  | { orderId: string; type: "order-detail" }
  | { type: "placeholder" };

const defaultGroup = navigationGroups[0];
const defaultSubCategory = defaultGroup.items[0];

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<MainCategory[]>([defaultGroup.label]);
  const [activeGroup, setActiveGroup] = useState<MainCategory>(defaultGroup.label);
  const [activeSubCategory, setActiveSubCategory] = useState<SubCategory>(defaultSubCategory);
  const [currentView, setCurrentView] = useState<CurrentView>({ type: "order-list" });

  // Every view transition uses the same guard so the console log stays reliable
  // for monitoring and the prototype keeps a single navigation source of truth.
  const confirmLoginForNavigation = (destination: string) => {
    const confirmed = isLoggedIn;
    console.log("[auth-check] Navigation requested.", {
      confirmed,
      destination,
      isLoggedIn,
      timestamp: new Date().toISOString(),
    });
    return confirmed;
  };

  const handleLogin = ({ password, userId }: LoginCredentials) => {
    console.log("[auth-check] Prototype login confirmed.", {
      confirmed: true,
      destination: defaultSubCategory,
      passwordLength: password.length,
      timestamp: new Date().toISOString(),
      userId: userId || "anonymous",
    });

    setIsLoggedIn(true);
    setExpandedGroups([defaultGroup.label]);
    setActiveGroup(defaultGroup.label);
    setActiveSubCategory(defaultSubCategory);
    setCurrentView({ type: "order-list" });
  };

  const handleToggleGroup = (group: NavigationGroup) => {
    if (isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
    }

    setExpandedGroups((current) => {
      const isExpanded = current.includes(group.label);
      const nextGroups = isExpanded
        ? current.filter((label) => label !== group.label)
        : [...current, group.label];

      console.log("[navigation] Sidebar group toggled.", {
        expanded: !isExpanded,
        group: group.label,
        timestamp: new Date().toISOString(),
      });

      return nextGroups;
    });
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((current) => {
      const nextValue = !current;
      console.log("[navigation] Sidebar visibility toggled.", {
        collapsed: nextValue,
        timestamp: new Date().toISOString(),
      });
      return nextValue;
    });
  };

  const handleSelectSubCategory = (group: NavigationGroup, subCategory: SubCategory) => {
    if (!confirmLoginForNavigation(subCategory)) {
      return;
    }

    setActiveGroup(group.label);
    setActiveSubCategory(subCategory);
    setCurrentView(subCategory === "수주정보" ? { type: "order-list" } : { type: "placeholder" });
  };

  const handleSelectOrder = (orderId: string) => {
    if (!confirmLoginForNavigation(`수주상세:${orderId}`)) {
      return;
    }

    setActiveGroup("영업관리");
    setActiveSubCategory("수주정보");
    setCurrentView({ orderId, type: "order-detail" });
  };

  const handleBackToList = () => {
    if (!confirmLoginForNavigation("수주정보")) {
      return;
    }

    setCurrentView({ type: "order-list" });
  };

  if (!isLoggedIn) {
    return (
      <LoginPage
        backgroundImage={backgroundImage}
        logoImage={logoImage}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <AppShell
      activeGroup={activeGroup}
      activeSubCategory={activeSubCategory}
      expandedGroups={expandedGroups}
      isSidebarCollapsed={isSidebarCollapsed}
      navigationGroups={navigationGroups}
      onSelectSubCategory={handleSelectSubCategory}
      onToggleGroup={handleToggleGroup}
      onToggleSidebar={handleToggleSidebar}
    >
      {currentView.type === "order-list" ? <OrderListPage onSelectOrder={handleSelectOrder} /> : null}
      {currentView.type === "order-detail" ? (
        <OrderDetailPage
          onBack={handleBackToList}
          orderId={currentView.orderId}
        />
      ) : null}
      {currentView.type === "placeholder" ? (
        <PlaceholderPage
          groupLabel={activeGroup}
          title={activeSubCategory}
        />
      ) : null}
    </AppShell>
  );
}

export default App;
