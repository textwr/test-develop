import { useState } from "react";
import type { MainCategory, NavigationGroup, SubCategory } from "./app/config/navigation";
import { navigationGroups } from "./app/config/navigation";
import backgroundImage from "./app/assets/background.jpg";
import logoImage from "./app/assets/logo.png";
import { AppShell } from "./components/layout/AppShell";
import { LoginPage } from "./components/pages/LoginPage";
import { OrderInfoPage } from "./components/pages/OrderInfoPage";
import { PlaceholderPage } from "./components/pages/PlaceholderPage";

type LoginCredentials = {
  userId: string;
  password: string;
};

const defaultGroup = navigationGroups[0];
const defaultSubCategory = defaultGroup.items[0];

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<MainCategory>(defaultGroup.label);
  const [activeGroup, setActiveGroup] = useState<MainCategory>(defaultGroup.label);
  const [activeSubCategory, setActiveSubCategory] = useState<SubCategory>(defaultSubCategory);

  // Every page transition goes through this helper so the monitoring log is
  // always emitted before navigation occurs.
  const confirmLoginForNavigation = (destination: string) => {
    const confirmed = isLoggedIn;
    console.log("[auth-check] Navigation requested.", {
      destination,
      confirmed,
      isLoggedIn,
      timestamp: new Date().toISOString(),
    });

    return confirmed;
  };

  const handleLogin = ({ password, userId }: LoginCredentials) => {
    console.log("[auth-check] Prototype login confirmed.", {
      destination: defaultSubCategory,
      confirmed: true,
      userId: userId || "anonymous",
      passwordLength: password.length,
      timestamp: new Date().toISOString(),
    });

    setIsLoggedIn(true);
    setExpandedGroup(defaultGroup.label);
    setActiveGroup(defaultGroup.label);
    setActiveSubCategory(defaultSubCategory);
  };

  const handleToggleGroup = (group: NavigationGroup) => {
    if (isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
    }

    setExpandedGroup(group.label);
    console.log("[navigation] Sidebar group expanded.", {
      group: group.label,
      timestamp: new Date().toISOString(),
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

    setExpandedGroup(group.label);
    setActiveGroup(group.label);
    setActiveSubCategory(subCategory);
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
      expandedGroup={expandedGroup}
      isSidebarCollapsed={isSidebarCollapsed}
      navigationGroups={navigationGroups}
      onSelectSubCategory={handleSelectSubCategory}
      onToggleGroup={handleToggleGroup}
      onToggleSidebar={handleToggleSidebar}
    >
      {activeSubCategory === "수주정보" ? (
        <OrderInfoPage />
      ) : (
        <PlaceholderPage
          groupLabel={activeGroup}
          title={activeSubCategory}
        />
      )}
    </AppShell>
  );
}

export default App;
