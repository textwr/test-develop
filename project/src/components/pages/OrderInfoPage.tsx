import { useEffect, useMemo, useState } from "react";
import { fetchClientList } from "../../app/api/clientApi";
import { fetchItemList } from "../../app/api/itemApi";
import { fetchOrderList } from "../../app/api/orderApi";
import { fetchUnitPriceStandardList } from "../../app/api/unitPriceStandardApi";
import type { OrderTableRow } from "../../app/types/order";
import {
  buildOrderTableRows,
  formatDate,
  formatFlexibleNumber,
  formatNumber,
} from "../../app/utils/orderUtils";
import { AppButton } from "../common/AppButton";
import { AppField } from "../common/AppField";
import { DataTable, type DataColumn } from "../common/DataTable";
import { FilterPanel } from "../common/FilterPanel";
import { LoadingOverlay } from "../common/LoadingOverlay";
import { NotificationCenter, type NotificationItem } from "../common/NotificationCenter";
import { PageHeader } from "../common/PageHeader";
import { StatusBanner } from "../common/StatusBanner";

const orderColumns: DataColumn<OrderTableRow>[] = [
  { key: "index", header: "No.", render: (_, index) => index + 1 },
  { key: "orderNumber", header: "수주번호" },
  { key: "orderDate", header: "수주일자" },
  { key: "clientName", header: "거래처명" },
  { key: "clientNumber", header: "거래처번호" },
  { key: "itemCode", header: "품번" },
  { key: "itemName", header: "품명" },
  { key: "gsm", header: "평량(g/m²)", render: (row) => formatFlexibleNumber(row.gsm) },
  { key: "width", header: "폭(mm)", render: (row) => formatFlexibleNumber(row.width) },
  { key: "length", header: "길이(m)", render: (row) => formatFlexibleNumber(row.length) },
  { key: "orderQuantityMeter", header: "수주량(m)", render: (row) => formatFlexibleNumber(row.orderQuantityMeter) },
  { key: "orderQuantityEa", header: "수주량(EA)", render: (row) => formatNumber(row.orderQuantityEa) },
  {
    key: "orderQuantitySquareMeter",
    header: "수주량(m²)",
    render: (row) => formatFlexibleNumber(row.orderQuantitySquareMeter),
  },
  { key: "weightGram", header: "중량(g)", render: (row) => formatNumber(row.weightGram) },
  { key: "unitPrice", header: "단가(원/m²)", render: (row) => formatNumber(row.unitPrice) },
  { key: "amountWon", header: "금액(원)", render: (row) => formatNumber(row.amountWon) },
  { key: "deliveryRequestDate", header: "납품요청일" },
  { key: "deliveryPlace", header: "납품장소" },
  { key: "note", header: "비고" },
];

export function OrderInfoPage() {
  const [allRows, setAllRows] = useState<OrderTableRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [clientName, setClientName] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [appliedClientName, setAppliedClientName] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState("");

  const dismissNotification = (id: string) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  };

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      const pushNotification = (notification: Omit<NotificationItem, "id">) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setNotifications((current) => [...current, { id, ...notification }]);
      };

      setIsLoading(true);
      setErrorMessage("");
      setInfoMessage("수주정보 화면 진입으로 API 동기화를 시작했습니다.");
      setNotifications([]);
      console.log("[OrderInfoPage] Starting API synchronization.");

      const [orderResult, clientResult, itemResult, unitPriceResult] = await Promise.allSettled([
        fetchOrderList(),
        fetchClientList(),
        fetchItemList(),
        fetchUnitPriceStandardList(),
      ]);

      if (!isMounted) {
        return;
      }

      const orders = orderResult.status === "fulfilled" ? orderResult.value : [];
      const clients = clientResult.status === "fulfilled" ? clientResult.value : [];
      const items = itemResult.status === "fulfilled" ? itemResult.value : [];
      const unitPrices = unitPriceResult.status === "fulfilled" ? unitPriceResult.value : [];

      const nextRows = orders.length > 0
        ? buildOrderTableRows({ clients, items, orders, unitPrices })
        : [];

      console.log("[OrderInfoPage] Client enrichment payload:", clients);
      console.log("[OrderInfoPage] Item enrichment payload:", items);
      console.log("[OrderInfoPage] Unit price enrichment payload:", unitPrices);
      console.log("[OrderInfoPage] Final table rows:", nextRows);

      setAllRows(nextRows);
      setLastSyncedAt(
        new Intl.DateTimeFormat("ko-KR", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date()),
      );

      const failedApis = [
        orderResult.status === "rejected" ? "수주정보" : "",
        clientResult.status === "rejected" ? "거래처정보" : "",
        itemResult.status === "rejected" ? "품목정보" : "",
        unitPriceResult.status === "rejected" ? "단가기준정보" : "",
      ].filter(Boolean);

      if (failedApis.length > 0) {
        const message = `${failedApis.join(", ")} API 확인에 실패하여 가능한 데이터만 표시했습니다.`;
        setErrorMessage(message);
        pushNotification({
          message,
          title: "API 오류",
          variant: "error",
        });
      }

      if (orders.length === 0) {
        pushNotification({
          message: "수주정보 응답이 비어 있어 예비 데이터를 표시합니다.",
          title: "데이터 없음",
          variant: "warning",
        });
      }

      if (unitPriceResult.status === "fulfilled" && unitPrices.length === 0) {
        const message = "단가기준정보가 비어 있어 일부 금액은 계산되지 않을 수 있습니다.";
        setInfoMessage(message);
        pushNotification({
          message,
          title: "기준정보 누락",
          variant: "warning",
        });
      } else if (nextRows.length === 0) {
        const message = "표시할 수주 상세 행이 없어 빈 목록으로 표시됩니다.";
        setInfoMessage(message);
        pushNotification({
          message,
          title: "표시 데이터 없음",
          variant: "info",
        });
      } else {
        setInfoMessage("실시간 API 데이터를 기준으로 수주 목록을 표시합니다.");
      }

      setIsLoading(false);
    }

    void loadOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredRows = useMemo(() => {
    return allRows.filter((row) => {
      const matchesClient = appliedClientName
        ? row.clientName.toLowerCase().includes(appliedClientName.toLowerCase())
        : true;
      const matchesStartDate = appliedStartDate ? row.orderDate >= appliedStartDate : true;
      const matchesEndDate = appliedEndDate ? row.orderDate <= appliedEndDate : true;

      return matchesClient && matchesStartDate && matchesEndDate;
    });
  }, [allRows, appliedClientName, appliedEndDate, appliedStartDate]);

  const handleSearch = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setAppliedClientName(clientName.trim());
    console.log("[OrderInfoPage] Search applied.", {
      clientName: clientName.trim(),
      endDate,
      startDate,
    });
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setClientName("");
    setAppliedStartDate("");
    setAppliedEndDate("");
    setAppliedClientName("");
    setInfoMessage("검색 조건을 초기화했습니다.");
    console.log("[OrderInfoPage] Search filters reset.");
  };

  const handleRegister = () => {
    setInfoMessage("수주 등록은 프로토타입 더미 기능입니다. 화면 연결과 로그인 확인 로그만 동작합니다.");
    console.log("[OrderInfoPage] Dummy registration requested.");
  };

  return (
    <section className="page-section">
      <NotificationCenter
        notifications={notifications}
        onDismiss={dismissNotification}
      />
      <PageHeader
        actions={
          <AppButton
            onClick={handleRegister}
            size="sm"
            variant="dark"
          >
            수주 등록
          </AppButton>
        }
        description="수주정보 API를 자동 조회하고 계산 컬럼을 포함한 목록으로 표시합니다."
        title="수주 관리"
      />

      <FilterPanel
        actions={
          <>
            <AppButton
              onClick={handleSearch}
              size="sm"
              variant="dark"
            >
              검색
            </AppButton>
            <AppButton
              onClick={handleReset}
              size="sm"
              variant="secondary"
            >
              초기화
            </AppButton>
          </>
        }
      >
        <AppField
          label="시작일"
          onChange={(event) => setStartDate(event.target.value)}
          type="date"
          value={startDate}
        />
        <AppField
          label="종료일"
          onChange={(event) => setEndDate(event.target.value)}
          type="date"
          value={endDate}
        />
        <AppField
          label="거래처명"
          onChange={(event) => setClientName(event.target.value)}
          placeholder="거래처명을 입력하세요"
          value={clientName}
        />
      </FilterPanel>

      {errorMessage ? <StatusBanner variant="warning">{errorMessage}</StatusBanner> : null}
      {infoMessage ? <StatusBanner variant="info">{infoMessage}</StatusBanner> : null}

      <div className="page-section__meta">
        <span>총 {formatNumber(filteredRows.length)}건</span>
        <span>마지막 동기화: {lastSyncedAt || formatDate(undefined)}</span>
      </div>

      <div className="list-window">
        <LoadingOverlay
          isVisible={isLoading}
          message="수주 관련 API를 확인하고 데이터를 불러오는 중입니다."
        />
        <DataTable
          columns={orderColumns}
          emptyMessage="조회 조건에 맞는 수주정보가 없습니다."
          rows={filteredRows}
        />
      </div>
    </section>
  );
}
