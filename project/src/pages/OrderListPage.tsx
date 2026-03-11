import { useEffect, useMemo, useState } from "react";
import { fetchClientList } from "@/app/api/clientApi";
import { fetchItemList } from "@/app/api/itemApi";
import { fetchOrderList } from "@/app/api/orderApi";
import { fetchUnitPriceStandardList } from "@/app/api/unitPriceStandardApi";
import { AppButton } from "@/app/components/common/AppButton";
import { DataTable, type DataColumn } from "@/app/components/common/DataTable";
import { LoadingOverlay } from "@/app/components/common/LoadingOverlay";
import { NotificationCenter, type NotificationItem } from "@/app/components/common/NotificationCenter";
import { PageHeader } from "@/app/components/common/PageHeader";
import { StatusBanner } from "@/app/components/common/StatusBanner";
import type { OrderListRow } from "@/app/types/order";
import { buildOrderListRows, formatDate, formatFlexibleNumber, formatNumber } from "@/app/utils/orderUtils";

const orderColumns: DataColumn<OrderListRow>[] = [
  { key: "index", header: "No.", render: (_, index) => index + 1, cellClassName: "w-[56px]" },
  { key: "orderNumber", header: "수주번호" },
  { key: "orderDate", header: "수주일자" },
  { key: "clientName", header: "거래처명", cellClassName: "text-left" },
  { key: "itemCode", header: "품번", cellClassName: "text-left" },
  { key: "itemName", header: "품명", cellClassName: "text-left" },
  { key: "gsm", header: "평량(g/m²)", render: (row) => formatFlexibleNumber(row.gsm) },
  { key: "width", header: "폭(mm)", render: (row) => formatFlexibleNumber(row.width) },
  { key: "length", header: "길이(m)", render: (row) => formatFlexibleNumber(row.length) },
  { key: "orderQuantityMeter", header: "수주량(m)", render: (row) => formatFlexibleNumber(row.orderQuantityMeter) },
  { key: "orderQuantityEa", header: "수주량(EA)", render: (row) => formatNumber(row.orderQuantityEa) },
  { key: "orderQuantitySquareMeter", header: "수주량(m²)", render: (row) => formatFlexibleNumber(row.orderQuantitySquareMeter) },
  { key: "weightGram", header: "중량(g)", render: (row) => formatNumber(row.weightGram) },
  { key: "unitPrice", header: "단가(m²)", render: (row) => formatNumber(row.unitPrice) },
  { key: "amountWon", header: "금액(원)", render: (row) => formatNumber(row.amountWon) },
  { key: "deliveryRequestDate", header: "납품요청일" },
  { key: "deliveryPlace", header: "납품장소", cellClassName: "text-left" },
  { key: "note", header: "비고", cellClassName: "text-left" },
];

type OrderListPageProps = {
  flashNotification?: Omit<NotificationItem, "id"> | null;
  onCreateOrder: () => void;
  onFlashNotificationShown?: () => void;
  onSelectOrder: (orderId: string) => void;
};

export function OrderListPage({
  flashNotification,
  onCreateOrder,
  onFlashNotificationShown,
  onSelectOrder,
}: OrderListPageProps) {
  const [rows, setRows] = useState<OrderListRow[]>([]);
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
    if (!flashNotification) {
      return;
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setNotifications((current) => [...current, { id, ...flashNotification }]);
    onFlashNotificationShown?.();
  }, [flashNotification, onFlashNotificationShown]);

  useEffect(() => {
    let isMounted = true;

    async function loadOrderList() {
      // 알림은 조회 단위로 새로 만들고 초기화해서
      // 이전 조회의 상태가 다음 동기화 결과에 섞이지 않게 한다.
      const pushNotification = (notification: Omit<NotificationItem, "id">) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setNotifications((current) => [...current, { id, ...notification }]);
      };

      setIsLoading(true);
      setErrorMessage("");
      setNotifications([]);

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

      // 목록 화면은 평탄화된 행만 사용하므로
      // 여기서 수주품목 배열을 펼치고 파생 컬럼까지 함께 계산한다.
      const nextRows = orders.length > 0 ? buildOrderListRows({ clients, items, orders, unitPrices }) : [];

      console.log("[orderApi] 수주 목록 조회 결과:", nextRows);
      setRows(nextRows);
      setLastSyncedAt(
        new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(new Date()),
      );

      const failedApis = [
        orderResult.status === "rejected" ? "수주정보" : "",
        clientResult.status === "rejected" ? "거래처정보" : "",
        itemResult.status === "rejected" ? "품목정보" : "",
        unitPriceResult.status === "rejected" ? "단가기준정보" : "",
      ].filter(Boolean);

      if (failedApis.length > 0) {
        const message = `${failedApis.join(", ")} 데이터를 불러오는 데 실패하여 가능한 데이터만 표시했습니다.`;
        setErrorMessage(message);
        pushNotification({ title: "API 오류", message, variant: "error" });
      }

      if (orders.length === 0) {
        pushNotification({
          title: "데이터 없음",
          message: "데이터가 없습니다.",
          variant: "warning",
        });
      }

      setIsLoading(false);
    }

    void loadOrderList();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesClient = appliedClientName ? row.clientName.toLowerCase().includes(appliedClientName.toLowerCase()) : true;
      const matchesStartDate = appliedStartDate ? row.orderDate >= appliedStartDate : true;
      const matchesEndDate = appliedEndDate ? row.orderDate <= appliedEndDate : true;
      return matchesClient && matchesStartDate && matchesEndDate;
    });
  }, [appliedClientName, appliedEndDate, appliedStartDate, rows]);

  const handleSearch = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setAppliedClientName(clientName.trim());
    console.log("[orderApi] 수주 목록 검색 조건 적용:", { clientName: clientName.trim(), endDate, startDate });
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setClientName("");
    setAppliedStartDate("");
    setAppliedEndDate("");
    setAppliedClientName("");
    setInfoMessage("검색 조건을 초기화했습니다.");
  };

  return (
    <section className="space-y-4">
      <NotificationCenter
        notifications={notifications}
        onDismiss={dismissNotification}
      />
      <PageHeader
        actions={
          <AppButton
            className="min-w-[92px]"
            onClick={onCreateOrder}
            size="sm"
            variant="dark"
          >
            수주 등록
          </AppButton>
        }
        title="수주 관리"
      />

      <section className="rounded-[12px] border border-[#e1e5eb] bg-[#f8f9fb] p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex h-[40px] overflow-hidden rounded-[8px] border border-[#d6dae2] bg-white">
            <span className="inline-flex items-center border-r border-[#e5e7eb] px-3 text-[13px] font-medium text-[#111827]">날짜선택</span>
            <input
              aria-label="시작일"
              className="w-[140px] border-0 px-3 text-[13px] text-[#4b5563] outline-none"
              onChange={(event) => setStartDate(event.target.value)}
              type="date"
              value={startDate}
            />
          </div>
          <span className="px-1 text-[13px] text-[#64748b]">~</span>
          <div className="inline-flex h-[40px] overflow-hidden rounded-[8px] border border-[#d6dae2] bg-white">
            <input
              aria-label="종료일"
              className="w-[140px] border-0 px-3 text-[13px] text-[#4b5563] outline-none"
              onChange={(event) => setEndDate(event.target.value)}
              type="date"
              value={endDate}
            />
          </div>
          <div className="inline-flex h-[40px] overflow-hidden rounded-[8px] border border-[#d6dae2] bg-white">
            <span className="inline-flex items-center border-r border-[#e5e7eb] px-3 text-[13px] font-medium text-[#111827]">거래처명</span>
            <input
              className="w-[130px] border-0 px-3 text-[13px] text-[#4b5563] outline-none placeholder:text-[#94a3b8]"
              onChange={(event) => setClientName(event.target.value)}
              placeholder="입력"
              value={clientName}
            />
          </div>
          <AppButton
            className="min-w-[66px]"
            onClick={handleSearch}
            size="sm"
            variant="dark"
          >
            검색
          </AppButton>
          <AppButton
            onClick={handleReset}
            size="sm"
            variant="outline"
          >
            초기화
          </AppButton>
        </div>
      </section>

      {errorMessage ? <StatusBanner variant="warning">{errorMessage}</StatusBanner> : null}
      {infoMessage ? <StatusBanner variant="info">{infoMessage}</StatusBanner> : null}

      <div className="flex flex-col gap-1 text-[12px] text-[#6b7280] sm:flex-row sm:items-center sm:justify-between">
        <span>총 {formatNumber(filteredRows.length)}건</span>
        <span>마지막 동기화: {lastSyncedAt || formatDate(undefined)}</span>
      </div>

      <div className="relative min-h-[520px] rounded-[12px] border border-[#d8dde6] bg-white">
        <LoadingOverlay
          isVisible={isLoading}
          message="수주 목록을 불러오는 중입니다."
        />
        <DataTable
          columns={orderColumns}
          containerClassName="rounded-[12px] border-0"
          emptyMessage="조회 조건에 맞는 수주정보가 없습니다."
          onRowClick={(row) => onSelectOrder(row.orderId)}
          rows={filteredRows}
          rowClassName={() => "hover:text-[#111827]"}
          tableMinWidthClassName="min-w-[1900px]"
        />
      </div>
    </section>
  );
}
