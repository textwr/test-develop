import { useState } from "react";
import type { MainCategory, NavigationGroup, SubCategory } from "@/app/config/navigation";
import { navigationGroups } from "@/app/config/navigation";
import { AppShell } from "@/app/components/layout/AppShell";
import backgroundImage from "@/assets/background.jpg";
import logoImage from "@/assets/logo.png";
import { LoginPage } from "@/pages/LoginPage";
import { OrderDetailPage } from "@/pages/OrderDetailPage";
import { OrderEditPage } from "@/pages/OrderEditPage";
import { OrderListPage } from "@/pages/OrderListPage";
import { OrderRegisterPage } from "@/pages/OrderRegisterPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";
import type { NotificationItem } from "@/app/components/common/NotificationCenter";

type LoginCredentials = {
  userId: string;
  password: string;
};

type CurrentView =
  | { type: "order-list" }
  | { type: "order-register" }
  | { orderId: string; type: "order-detail" }
  | { orderId: string; type: "order-edit" }
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
  const [listFlashNotification, setListFlashNotification] = useState<Omit<NotificationItem, "id"> | null>(null);
  const [detailFlashNotification, setDetailFlashNotification] = useState<Omit<NotificationItem, "id"> | null>(null);

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

  const handleOpenOrderRegister = () => {
    if (!confirmLoginForNavigation("수주등록")) {
      return;
    }

    setActiveGroup("영업관리");
    setActiveSubCategory("수주정보");
    setCurrentView({ type: "order-register" });
  };

  const handleBackToList = () => {
    if (!confirmLoginForNavigation("수주정보")) {
      return;
    }

    setCurrentView({ type: "order-list" });
  };

  const handleOpenOrderEdit = (orderId: string) => {
    if (!confirmLoginForNavigation(`수주수정:${orderId}`)) {
      return;
    }

    setActiveGroup("영업관리");
    setActiveSubCategory("수주정보");
    setCurrentView({ orderId, type: "order-edit" });
  };

  const handleBackToOrderDetail = (orderId: string) => {
    if (!confirmLoginForNavigation(`수주상세:${orderId}`)) {
      return;
    }

    setCurrentView({ orderId, type: "order-detail" });
  };

  const handleOrderRegisterComplete = (notification: Omit<NotificationItem, "id">) => {
    setListFlashNotification(notification);
    setCurrentView({ type: "order-list" });
  };

  const handleOrderEditComplete = (orderId: string, notification: Omit<NotificationItem, "id">) => {
    setDetailFlashNotification(notification);
    setCurrentView({ orderId, type: "order-detail" });
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
      {currentView.type === "order-list" ? (
        <OrderListPage
          flashNotification={listFlashNotification}
          onCreateOrder={handleOpenOrderRegister}
          onFlashNotificationShown={() => setListFlashNotification(null)}
          onSelectOrder={handleSelectOrder}
        />
      ) : null}
      {currentView.type === "order-register" ? (
        <OrderRegisterPage
          onBack={handleBackToList}
          onComplete={handleOrderRegisterComplete}
        />
      ) : null}
      {currentView.type === "order-detail" ? (
        <OrderDetailPage
          flashNotification={detailFlashNotification}
          onBack={handleBackToList}
          onEdit={() => handleOpenOrderEdit(currentView.orderId)}
          onFlashNotificationShown={() => setDetailFlashNotification(null)}
          orderId={currentView.orderId}
        />
      ) : null}
      {currentView.type === "order-edit" ? (
        <OrderEditPage
          onBack={() => handleBackToOrderDetail(currentView.orderId)}
          onComplete={(notification) => handleOrderEditComplete(currentView.orderId, notification)}
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
