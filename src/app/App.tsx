import { useState } from "react";
import type { MainCategory, NavigationGroup, SubCategory } from "@/app/config/navigation";
import { navigationGroups } from "@/app/config/navigation";
import { AppShell } from "@/app/components/layout/AppShell";
import type { NotificationItem } from "@/app/components/common/NotificationCenter";
import backgroundImage from "@/assets/background.jpg";
import logoImage from "@/assets/logo.png";
import { LoginPage } from "@/pages/LoginPage";
import { OrderDetailPage } from "@/pages/OrderDetailPage";
import { OrderEditPage } from "@/pages/OrderEditPage";
import { OrderListPage } from "@/pages/OrderListPage";
import { OrderRegisterPage } from "@/pages/OrderRegisterPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";
import { PurchaseOrderDetailPage } from "@/pages/PurchaseOrderDetailPage";
import { PurchaseOrderEditPage } from "@/pages/PurchaseOrderEditPage";
import { PurchaseOrderListPage } from "@/pages/PurchaseOrderListPage";
import { PurchaseOrderRegisterPage } from "@/pages/PurchaseOrderRegisterPage";

type LoginCredentials = {
  userId: string;
  password: string;
};

type CurrentView =
  | { type: "order-list" }
  | { type: "order-register" }
  | { orderId: string; type: "order-detail" }
  | { orderId: string; type: "order-edit" }
  | { type: "purchase-order-list" }
  | { type: "purchase-order-register" }
  | { orderNumber: string; type: "purchase-order-detail" }
  | { orderNumber: string; type: "purchase-order-edit" }
  | { type: "placeholder" };

const defaultGroup = navigationGroups[0];
const defaultSubCategory = defaultGroup.items[0];

// App은 사이드바 선택과 페이지 전환을 한 곳에서 관리해
// 수주/발주 화면이 같은 네비게이션 경험을 유지하도록 만든다.
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<MainCategory[]>([defaultGroup.label]);
  const [activeGroup, setActiveGroup] = useState<MainCategory>(defaultGroup.label);
  const [activeSubCategory, setActiveSubCategory] = useState<SubCategory>(defaultSubCategory);
  const [currentView, setCurrentView] = useState<CurrentView>({ type: "order-list" });
  const [listFlashNotification, setListFlashNotification] = useState<Omit<NotificationItem, "id"> | null>(null);
  const [detailFlashNotification, setDetailFlashNotification] = useState<Omit<NotificationItem, "id"> | null>(null);
  const [purchaseListFlashNotification, setPurchaseListFlashNotification] = useState<Omit<NotificationItem, "id"> | null>(null);
  const [purchaseDetailFlashNotification, setPurchaseDetailFlashNotification] = useState<Omit<NotificationItem, "id"> | null>(null);

  // 모든 화면 전환은 같은 인증 확인 흐름을 거치게 해
  // 콘솔 추적과 실제 이동 기준이 서로 다르지 않도록 유지한다.
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
      const nextGroups = isExpanded ? current.filter((label) => label !== group.label) : [...current, group.label];

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

  // 서브카테고리 이름에 따라 실제 화면 타입을 결정해
  // 수주/발주 메뉴가 같은 앱 셸 안에서 자연스럽게 전환되도록 한다.
  const handleSelectSubCategory = (group: NavigationGroup, subCategory: SubCategory) => {
    if (!confirmLoginForNavigation(subCategory)) {
      return;
    }

    setActiveGroup(group.label);
    setActiveSubCategory(subCategory);

    if (subCategory === "수주정보") {
      setCurrentView({ type: "order-list" });
      return;
    }

    if (subCategory === "발주정보") {
      setCurrentView({ type: "purchase-order-list" });
      return;
    }

    setCurrentView({ type: "placeholder" });
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

  const handleBackToOrderList = () => {
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

  const handleSelectPurchaseOrder = (selectedOrderNumber: string) => {
    if (!confirmLoginForNavigation(`발주상세:${selectedOrderNumber}`)) {
      return;
    }

    setActiveGroup("자재관리");
    setActiveSubCategory("발주정보");
    setCurrentView({ orderNumber: selectedOrderNumber, type: "purchase-order-detail" });
  };

  const handleOpenPurchaseOrderRegister = () => {
    if (!confirmLoginForNavigation("발주등록")) {
      return;
    }

    setActiveGroup("자재관리");
    setActiveSubCategory("발주정보");
    setCurrentView({ type: "purchase-order-register" });
  };

  const handleBackToPurchaseOrderList = () => {
    if (!confirmLoginForNavigation("발주정보")) {
      return;
    }

    setCurrentView({ type: "purchase-order-list" });
  };

  const handleOpenPurchaseOrderEdit = (selectedOrderNumber: string) => {
    if (!confirmLoginForNavigation(`발주수정:${selectedOrderNumber}`)) {
      return;
    }

    setActiveGroup("자재관리");
    setActiveSubCategory("발주정보");
    setCurrentView({ orderNumber: selectedOrderNumber, type: "purchase-order-edit" });
  };

  const handleBackToPurchaseOrderDetail = (selectedOrderNumber: string) => {
    if (!confirmLoginForNavigation(`발주상세:${selectedOrderNumber}`)) {
      return;
    }

    setCurrentView({ orderNumber: selectedOrderNumber, type: "purchase-order-detail" });
  };

  const handlePurchaseOrderRegisterComplete = (notification: Omit<NotificationItem, "id">) => {
    setPurchaseListFlashNotification(notification);
    setCurrentView({ type: "purchase-order-list" });
  };

  const handlePurchaseOrderEditComplete = (selectedOrderNumber: string, notification: Omit<NotificationItem, "id">) => {
    setPurchaseDetailFlashNotification(notification);
    setCurrentView({ orderNumber: selectedOrderNumber, type: "purchase-order-detail" });
  };

  if (!isLoggedIn) {
    return <LoginPage backgroundImage={backgroundImage} logoImage={logoImage} onLogin={handleLogin} />;
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
        <OrderRegisterPage onBack={handleBackToOrderList} onComplete={handleOrderRegisterComplete} />
      ) : null}
      {currentView.type === "order-detail" ? (
        <OrderDetailPage
          flashNotification={detailFlashNotification}
          onBack={handleBackToOrderList}
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
      {currentView.type === "purchase-order-list" ? (
        <PurchaseOrderListPage
          flashNotification={purchaseListFlashNotification}
          onCreateOrder={handleOpenPurchaseOrderRegister}
          onFlashNotificationShown={() => setPurchaseListFlashNotification(null)}
          onSelectOrder={handleSelectPurchaseOrder}
        />
      ) : null}
      {currentView.type === "purchase-order-register" ? (
        <PurchaseOrderRegisterPage
          onBack={handleBackToPurchaseOrderList}
          onComplete={handlePurchaseOrderRegisterComplete}
        />
      ) : null}
      {currentView.type === "purchase-order-detail" ? (
        <PurchaseOrderDetailPage
          flashNotification={purchaseDetailFlashNotification}
          onBack={handleBackToPurchaseOrderList}
          onEdit={() => handleOpenPurchaseOrderEdit(currentView.orderNumber)}
          onFlashNotificationShown={() => setPurchaseDetailFlashNotification(null)}
          orderNumber={currentView.orderNumber}
        />
      ) : null}
      {currentView.type === "purchase-order-edit" ? (
        <PurchaseOrderEditPage
          onBack={() => handleBackToPurchaseOrderDetail(currentView.orderNumber)}
          onComplete={(notification) => handlePurchaseOrderEditComplete(currentView.orderNumber, notification)}
          orderNumber={currentView.orderNumber}
        />
      ) : null}
      {currentView.type === "placeholder" ? (
        <PlaceholderPage groupLabel={activeGroup} title={activeSubCategory} />
      ) : null}
    </AppShell>
  );
}

export default App;
