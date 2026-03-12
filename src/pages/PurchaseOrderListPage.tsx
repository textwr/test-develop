import { useEffect, useMemo, useState } from "react";
import { fetchClientList } from "@/app/api/clientApi";
import { fetchItemList } from "@/app/api/itemApi";
import { fetchPurchaseOrderList } from "@/app/api/purchaseOrderApi";
import { fetchUnitPriceStandardList } from "@/app/api/unitPriceStandardApi";
import { AppButton } from "@/app/components/common/AppButton";
import { DataTable, type DataColumn } from "@/app/components/common/DataTable";
import { LoadingOverlay } from "@/app/components/common/LoadingOverlay";
import { NotificationCenter, type NotificationItem } from "@/app/components/common/NotificationCenter";
import { PageHeader } from "@/app/components/common/PageHeader";
import { StatusBanner } from "@/app/components/common/StatusBanner";
import type { PurchaseOrderApiRecord, PurchaseOrderListRow } from "@/app/types/purchaseOrder";
import { formatDate, formatNumber } from "@/app/utils/orderUtils";
import { buildPurchaseOrderListRows } from "@/app/utils/purchaseOrderUtils";

const purchaseOrderColumns: DataColumn<PurchaseOrderListRow>[] = [
  { key: "index", header: "No.", render: (_, index) => index + 1, cellClassName: "w-[56px]" },
  { key: "orderNumber", header: "발주번호" },
  { key: "clientName", header: "거래처명", cellClassName: "text-left" },
  { key: "clientNumber", header: "거래처번호" },
  { key: "orderDate", header: "발주일자" },
  { key: "itemCode", header: "품번", cellClassName: "text-left" },
  { key: "itemName", header: "품명", cellClassName: "text-left" },
  { key: "spec", header: "규격", cellClassName: "text-left" },
  { key: "unit", header: "단위" },
  { key: "quantity", header: "수량", render: (row) => formatNumber(row.quantity) },
  { key: "unitPrice", header: "단가", render: (row) => formatNumber(row.unitPrice) },
  { key: "amountWon", header: "금액", render: (row) => formatNumber(row.amountWon) },
];

type PurchaseOrderListPageProps = {
  flashNotification?: Omit<NotificationItem, "id"> | null;
  onCreateOrder: () => void;
  onFlashNotificationShown?: () => void;
  onSelectOrder: (orderNumber: string) => void;
};

// 발주 목록 화면은 수주 목록과 같은 UX를 유지하되
// 발주번호/거래처번호/거래처명까지 함께 검색할 수 있도록 필터를 확장한다.
export function PurchaseOrderListPage({
  flashNotification,
  onCreateOrder,
  onFlashNotificationShown,
  onSelectOrder,
}: PurchaseOrderListPageProps) {
  const [rows, setRows] = useState<PurchaseOrderListRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [clientNumber, setClientNumber] = useState("");
  const [clientName, setClientName] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [appliedOrderNumber, setAppliedOrderNumber] = useState("");
  const [appliedClientNumber, setAppliedClientNumber] = useState("");
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

    // 목록 조회 단위마다 알림을 새로 만들면
    // 이전 조회 실패 메시지가 다음 동기화 결과에 섞이지 않는다.
    async function loadPurchaseOrderList() {
      const pushNotification = (notification: Omit<NotificationItem, "id">) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setNotifications((current) => [...current, { id, ...notification }]);
      };

      setIsLoading(true);
      setErrorMessage("");
      setNotifications([]);

      const [orderResult, clientResult, itemResult, unitPriceResult] = await Promise.allSettled([
        fetchPurchaseOrderList(),
        fetchClientList(),
        fetchItemList(),
        fetchUnitPriceStandardList(),
      ]);

      if (!isMounted) {
        return;
      }

      const orders = orderResult.status === "fulfilled" ? (orderResult.value as PurchaseOrderApiRecord[]) : [];
      const clients = clientResult.status === "fulfilled" ? clientResult.value : [];
      const items = itemResult.status === "fulfilled" ? itemResult.value : [];
      const unitPrices = unitPriceResult.status === "fulfilled" ? unitPriceResult.value : [];
      const nextRows = buildPurchaseOrderListRows({ orders, clients, items, unitPrices });

      setRows(nextRows);
      setLastSyncedAt(new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(new Date()));

      const failedApis = [
        orderResult.status === "rejected" ? "발주정보" : "",
        clientResult.status === "rejected" ? "거래처정보" : "",
        itemResult.status === "rejected" ? "품목정보" : "",
        unitPriceResult.status === "rejected" ? "단가기준정보" : "",
      ].filter(Boolean);

      if (failedApis.length > 0) {
        const message = `${failedApis.join(", ")} 데이터를 불러오는 데 실패하여 가능한 데이터만 표시했습니다.`;
        setErrorMessage(message);
        pushNotification({ title: "API 오류", message, variant: "error" });
      }

      if (nextRows.length === 0) {
        pushNotification({ title: "데이터 없음", message: "데이터가 없습니다.", variant: "warning" });
      }

      setIsLoading(false);
    }

    void loadPurchaseOrderList();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesStartDate = appliedStartDate ? row.orderDate >= appliedStartDate : true;
      const matchesEndDate = appliedEndDate ? row.orderDate <= appliedEndDate : true;
      const matchesOrderNumber = appliedOrderNumber ? row.orderNumber.toLowerCase().includes(appliedOrderNumber.toLowerCase()) : true;
      const matchesClientNumber = appliedClientNumber ? row.clientNumber.toLowerCase().includes(appliedClientNumber.toLowerCase()) : true;
      const matchesClientName = appliedClientName ? row.clientName.toLowerCase().includes(appliedClientName.toLowerCase()) : true;
      return matchesStartDate && matchesEndDate && matchesOrderNumber && matchesClientNumber && matchesClientName;
    });
  }, [appliedClientName, appliedClientNumber, appliedEndDate, appliedOrderNumber, appliedStartDate, rows]);

  const handleSearch = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setAppliedOrderNumber(orderNumber.trim());
    setAppliedClientNumber(clientNumber.trim());
    setAppliedClientName(clientName.trim());
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setOrderNumber("");
    setClientNumber("");
    setClientName("");
    setAppliedStartDate("");
    setAppliedEndDate("");
    setAppliedOrderNumber("");
    setAppliedClientNumber("");
    setAppliedClientName("");
    setInfoMessage("검색 조건을 초기화했습니다.");
  };

  return (
    <section className="space-y-4">
      <NotificationCenter notifications={notifications} onDismiss={dismissNotification} />
      <PageHeader
        actions={
          <AppButton className="min-w-[92px]" onClick={onCreateOrder} size="sm" variant="dark">
            발주 등록
          </AppButton>
        }
        title="발주정보"
      />

      <section className="rounded-[12px] border border-[#e1e5eb] bg-[#f8f9fb] p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex h-[40px] overflow-hidden rounded-[8px] border border-[#d6dae2] bg-white">
            <span className="inline-flex items-center border-r border-[#e5e7eb] px-3 text-[13px] font-medium text-[#111827]">발주일자</span>
            <input aria-label="시작일" className="w-[140px] border-0 px-3 text-[13px] text-[#4b5563] outline-none" onChange={(event) => setStartDate(event.target.value)} type="date" value={startDate} />
          </div>
          <span className="px-1 text-[13px] text-[#64748b]">~</span>
          <div className="inline-flex h-[40px] overflow-hidden rounded-[8px] border border-[#d6dae2] bg-white">
            <input aria-label="종료일" className="w-[140px] border-0 px-3 text-[13px] text-[#4b5563] outline-none" onChange={(event) => setEndDate(event.target.value)} type="date" value={endDate} />
          </div>
          <div className="inline-flex h-[40px] overflow-hidden rounded-[8px] border border-[#d6dae2] bg-white">
            <span className="inline-flex items-center border-r border-[#e5e7eb] px-3 text-[13px] font-medium text-[#111827]">발주번호</span>
            <input className="w-[150px] border-0 px-3 text-[13px] text-[#4b5563] outline-none placeholder:text-[#94a3b8]" onChange={(event) => setOrderNumber(event.target.value)} placeholder="입력" value={orderNumber} />
          </div>
          <div className="inline-flex h-[40px] overflow-hidden rounded-[8px] border border-[#d6dae2] bg-white">
            <span className="inline-flex items-center border-r border-[#e5e7eb] px-3 text-[13px] font-medium text-[#111827]">거래처코드</span>
            <input className="w-[130px] border-0 px-3 text-[13px] text-[#4b5563] outline-none placeholder:text-[#94a3b8]" onChange={(event) => setClientNumber(event.target.value)} placeholder="입력" value={clientNumber} />
          </div>
          <div className="inline-flex h-[40px] overflow-hidden rounded-[8px] border border-[#d6dae2] bg-white">
            <span className="inline-flex items-center border-r border-[#e5e7eb] px-3 text-[13px] font-medium text-[#111827]">거래처명</span>
            <input className="w-[150px] border-0 px-3 text-[13px] text-[#4b5563] outline-none placeholder:text-[#94a3b8]" onChange={(event) => setClientName(event.target.value)} placeholder="입력" value={clientName} />
          </div>
          <AppButton className="min-w-[66px]" onClick={handleSearch} size="sm" variant="dark">검색</AppButton>
          <AppButton onClick={handleReset} size="sm" variant="outline">초기화</AppButton>
        </div>
      </section>

      {errorMessage ? <StatusBanner variant="warning">{errorMessage}</StatusBanner> : null}
      {infoMessage ? <StatusBanner variant="info">{infoMessage}</StatusBanner> : null}

      <div className="flex flex-col gap-1 text-[12px] text-[#6b7280] sm:flex-row sm:items-center sm:justify-between">
        <span>총 {formatNumber(filteredRows.length)}건</span>
        <span>마지막 동기화: {lastSyncedAt || formatDate(undefined)}</span>
      </div>

      <div className="relative min-h-[520px] rounded-[12px] border border-[#d8dde6] bg-white">
        <LoadingOverlay isVisible={isLoading} message="발주 목록을 불러오는 중입니다." />
        <DataTable
          columns={purchaseOrderColumns}
          containerClassName="rounded-[12px] border-0"
          emptyMessage="조회 조건에 맞는 발주정보가 없습니다."
          onRowClick={(row) => onSelectOrder(row.orderNumber)}
          rows={filteredRows}
          tableMinWidthClassName="min-w-[1460px]"
        />
      </div>
    </section>
  );
}
