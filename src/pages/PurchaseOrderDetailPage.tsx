import { useEffect, useMemo, useState } from "react";
import { fetchClientList } from "@/app/api/clientApi";
import { fetchItemList } from "@/app/api/itemApi";
import { fetchPurchaseOrderByNumber } from "@/app/api/purchaseOrderApi";
import { fetchUnitPriceStandardList } from "@/app/api/unitPriceStandardApi";
import { AppButton } from "@/app/components/common/AppButton";
import { DataTable, type DataColumn } from "@/app/components/common/DataTable";
import { LoadingOverlay } from "@/app/components/common/LoadingOverlay";
import { NotificationCenter, type NotificationItem } from "@/app/components/common/NotificationCenter";
import { PageHeader } from "@/app/components/common/PageHeader";
import { StatusBanner } from "@/app/components/common/StatusBanner";
import type { PurchaseOrderDetailView, PurchaseOrderItemView } from "@/app/types/purchaseOrder";
import { formatNumber } from "@/app/utils/orderUtils";
import { buildPurchaseOrderDetailView, getDocumentDisplayName } from "@/app/utils/purchaseOrderUtils";

const detailColumns: DataColumn<PurchaseOrderItemView>[] = [
  { key: "index", header: "No", render: (_, index) => String(index + 1).padStart(2, "0") },
  { key: "accountCategory", header: "계정구분" },
  { key: "itemCode", header: "품번", cellClassName: "text-left" },
  { key: "itemName", header: "품명", cellClassName: "text-left" },
  { key: "spec", header: "규격", cellClassName: "text-left" },
  { key: "unit", header: "단위" },
  { key: "quantity", header: "수량", render: (row) => formatNumber(row.quantity) },
  { key: "unitPrice", header: "단가", render: (row) => formatNumber(row.unitPrice) },
  { key: "amountWon", header: "금액", render: (row) => formatNumber(row.amountWon) },
];

type PurchaseOrderDetailPageProps = {
  flashNotification?: Omit<NotificationItem, "id"> | null;
  orderNumber: string;
  onBack: () => void;
  onEdit: () => void;
  onFlashNotificationShown?: () => void;
};

// 상세 화면은 발주 헤더 정보와 품목 정보를 함께 보여 주어
// 수정 전 현재 저장 상태를 그대로 검토할 수 있게 만든다.
export function PurchaseOrderDetailPage({
  flashNotification,
  onBack,
  onEdit,
  onFlashNotificationShown,
  orderNumber,
}: PurchaseOrderDetailPageProps) {
  const [detail, setDetail] = useState<PurchaseOrderDetailView>({
    clientName: "-",
    clientNumber: "-",
    documents: { materialCertUrl: "", transactionStatementUrl: "" },
    incomingRequestDate: "-",
    items: [],
    note: "-",
    orderDate: "-",
    orderId: orderNumber,
    orderNumber,
    paymentCondition: "-",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

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

    // 상세 화면도 목록과 같은 보정 로직을 써야 하므로
    // 원본 발주와 보조 기준정보를 함께 조회해 공통 상세 모델로 변환한다.
    async function loadPurchaseOrderDetail() {
      const pushNotification = (notification: Omit<NotificationItem, "id">) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setNotifications((current) => [...current, { id, ...notification }]);
      };

      setIsLoading(true);
      setErrorMessage("");
      setNotifications([]);

      const [orderResult, clientResult, itemResult, unitPriceResult] = await Promise.allSettled([
        fetchPurchaseOrderByNumber(orderNumber),
        fetchClientList(),
        fetchItemList(),
        fetchUnitPriceStandardList(),
      ]);

      if (!isMounted) {
        return;
      }

      if (orderResult.status === "rejected") {
        const message = `선택한 발주(${orderNumber})를 불러오지 못했습니다.`;
        setErrorMessage(message);
        pushNotification({ title: "상세 조회 실패", message, variant: "error" });
        setIsLoading(false);
        return;
      }

      const nextDetail = buildPurchaseOrderDetailView({
        clients: clientResult.status === "fulfilled" ? clientResult.value : [],
        items: itemResult.status === "fulfilled" ? itemResult.value : [],
        order: orderResult.value,
        unitPrices: unitPriceResult.status === "fulfilled" ? unitPriceResult.value : [],
      });

      setDetail(nextDetail);

      if (nextDetail.items.length === 0) {
        pushNotification({ title: "발주품목 없음", message: "표시할 발주품목이 없습니다.", variant: "warning" });
      }

      if (clientResult.status === "rejected" || itemResult.status === "rejected" || unitPriceResult.status === "rejected") {
        pushNotification({
          title: "보조 API 부분 실패",
          message: "거래처/품목/단가기준정보 중 일부를 가져오지 못해 가능한 정보만 표시했습니다.",
          variant: "info",
        });
      }

      setIsLoading(false);
    }

    void loadPurchaseOrderDetail();

    return () => {
      isMounted = false;
    };
  }, [orderNumber]);

  const materialCertLabel = useMemo(
    () => getDocumentDisplayName(detail.documents.materialCertUrl),
    [detail.documents.materialCertUrl],
  );
  const transactionStatementLabel = useMemo(
    () => getDocumentDisplayName(detail.documents.transactionStatementUrl),
    [detail.documents.transactionStatementUrl],
  );

  return (
    <section className="space-y-6">
      <NotificationCenter notifications={notifications} onDismiss={dismissNotification} />
      <PageHeader
        actions={
          <>
            <AppButton className="min-w-[80px]" onClick={onEdit} size="sm" variant="dark">수정</AppButton>
            <AppButton className="min-w-[80px]" onClick={onBack} size="sm" variant="outline">목록</AppButton>
          </>
        }
        title="발주 상세"
      />

      {errorMessage ? <StatusBanner variant="warning">{errorMessage}</StatusBanner> : null}

      <section className="space-y-5">
        <h2 className="text-[20px] font-bold tracking-[-0.02em] text-[#0f172a]">발주정보</h2>
        <div className="overflow-hidden rounded-[10px] border border-[#d7dce5] border-t-[3px] border-t-[#5a6fe0] bg-white">
          <table className="w-full border-collapse text-[13px] text-[#4b5563]">
            <tbody>
              <tr className="border-b border-[#e3e7ee]">
                <th className="w-[136px] bg-[#f3f4f6] px-5 py-5 text-left font-semibold text-[#5669d8]">발주번호</th>
                <td className="px-7 py-5">{detail.orderNumber}</td>
                <th className="w-[136px] bg-[#f3f4f6] px-5 py-5 text-left font-semibold text-[#5669d8]">거래처명</th>
                <td className="px-7 py-5">{detail.clientName}</td>
              </tr>
              <tr className="border-b border-[#e3e7ee]">
                <th className="bg-[#f3f4f6] px-5 py-5 text-left font-semibold text-[#5669d8]">거래처번호</th>
                <td className="px-7 py-5">{detail.clientNumber}</td>
                <th className="bg-[#f3f4f6] px-5 py-5 text-left font-semibold text-[#5669d8]">발주일자</th>
                <td className="px-7 py-5">{detail.orderDate}</td>
              </tr>
              <tr className="border-b border-[#e3e7ee]">
                <th className="bg-[#f3f4f6] px-5 py-5 text-left font-semibold text-[#5669d8]">입고요청일</th>
                <td className="px-7 py-5">{detail.incomingRequestDate}</td>
                <th className="bg-[#f3f4f6] px-5 py-5 text-left font-semibold text-[#5669d8]">결제조건</th>
                <td className="px-7 py-5">{detail.paymentCondition}</td>
              </tr>
              <tr className="border-b border-[#e3e7ee]">
                <th className="bg-[#f3f4f6] px-5 py-5 text-left font-semibold text-[#5669d8]">제출서류</th>
                <td className="px-7 py-5" colSpan={3}>
                  <div className="flex flex-col gap-2">
                    <span>재료시험성적서: {materialCertLabel}</span>
                    <span>거래명세서: {transactionStatementLabel}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <th className="bg-[#f3f4f6] px-5 py-5 text-left font-semibold text-[#5669d8]">비고</th>
                <td className="px-7 py-5" colSpan={3}>{detail.note}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-[20px] font-bold tracking-[-0.02em] text-[#0f172a]">발주품목</h2>
        <div className="relative min-h-[360px]">
          <LoadingOverlay isVisible={isLoading} message="상세 품목을 불러오는 중입니다." />
          <DataTable columns={detailColumns} emptyMessage="표시할 발주품목이 없습니다." rows={detail.items} tableMinWidthClassName="min-w-[1180px]" />
        </div>
      </section>
    </section>
  );
}
