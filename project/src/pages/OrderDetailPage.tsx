import { useEffect, useMemo, useState } from "react";
import { fetchClientList } from "@/app/api/clientApi";
import { fetchItemList } from "@/app/api/itemApi";
import { fetchOrderById } from "@/app/api/orderApi";
import { fetchUnitPriceStandardList } from "@/app/api/unitPriceStandardApi";
import { AppButton } from "@/app/components/common/AppButton";
import { DataTable, type DataColumn } from "@/app/components/common/DataTable";
import { LoadingOverlay } from "@/app/components/common/LoadingOverlay";
import { NotificationCenter, type NotificationItem } from "@/app/components/common/NotificationCenter";
import { PageHeader } from "@/app/components/common/PageHeader";
import { StatusBanner } from "@/app/components/common/StatusBanner";
import type { OrderDetailView, OrderItemView } from "@/app/types/order";
import { buildOrderDetailView, formatFlexibleNumber, formatNumber } from "@/app/utils/orderUtils";

const detailColumns: DataColumn<OrderItemView>[] = [
  { key: "index", header: "No", render: (_, index) => String(index + 1).padStart(2, "0") },
  { key: "itemCode", header: "품번", cellClassName: "text-left" },
  { key: "itemName", header: "품명", cellClassName: "text-left" },
  { key: "gsm", header: "평량(g/m²)", render: (row) => formatFlexibleNumber(row.gsm) },
  { key: "width", header: "폭(mm)", render: (row) => formatFlexibleNumber(row.width) },
  { key: "length", header: "길이(m)", render: (row) => formatFlexibleNumber(row.length) },
  { key: "orderQuantityMeter", header: "수주량(m)", render: (row) => formatFlexibleNumber(row.orderQuantityMeter) },
  { key: "orderQuantityEa", header: "수주량(EA)", render: (row) => formatNumber(row.orderQuantityEa) },
  { key: "orderQuantitySquareMeter", header: "수주량(m²)", render: (row) => formatFlexibleNumber(row.orderQuantitySquareMeter) },
  { key: "weightGram", header: "중량(g)", render: (row) => formatNumber(row.weightGram) },
  { key: "unitPrice", header: "단가(원/m²)", render: (row) => formatNumber(row.unitPrice) },
  { key: "amountWon", header: "금액(원)", render: (row) => formatNumber(row.amountWon) },
];

type OrderDetailPageProps = {
  orderId: string;
  onBack: () => void;
};

function createEmptyDetail(orderId: string): OrderDetailView {
  return {
    orderId,
    orderNumber: "-",
    orderDate: "-",
    clientName: "-",
    clientNumber: "-",
    deliveryRequestDate: "-",
    deliveryPlace: "-",
    note: "-",
    items: [],
  };
}

export function OrderDetailPage({ onBack, orderId }: OrderDetailPageProps) {
  const [detail, setDetail] = useState<OrderDetailView>(createEmptyDetail(orderId));
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const dismissNotification = (id: string) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  };

  useEffect(() => {
    let isMounted = true;

    async function loadOrderDetail() {
      // Detail notifications are kept local to the selected order so stale
      // warnings from a previously opened order do not bleed into the next one.
      const pushNotification = (notification: Omit<NotificationItem, "id">) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setNotifications((current) => [...current, { id, ...notification }]);
      };

      setIsLoading(true);
      setErrorMessage("");
      setInfoMessage("선택한 수주 ID로 orderApi 상세 정보를 조회합니다.");
      setNotifications([]);
      setDetail(createEmptyDetail(orderId));
      console.log("[orderApi] Loading order detail view.", { orderId });

      const [orderResult, clientResult, itemResult, unitPriceResult] = await Promise.allSettled([
        fetchOrderById(orderId),
        fetchClientList(),
        fetchItemList(),
        fetchUnitPriceStandardList(),
      ]);

      if (!isMounted) {
        return;
      }

      if (orderResult.status === "rejected") {
        const message = `선택한 수주(${orderId})를 불러오지 못했습니다.`;
        setErrorMessage(message);
        pushNotification({ title: "상세 조회 실패", message, variant: "error" });
        setIsLoading(false);
        return;
      }

      const nextDetail = buildOrderDetailView({
        order: orderResult.value,
        clients: clientResult.status === "fulfilled" ? clientResult.value : [],
        items: itemResult.status === "fulfilled" ? itemResult.value : [],
        unitPrices: unitPriceResult.status === "fulfilled" ? unitPriceResult.value : [],
      });

      console.log("[orderApi] Detail view model:", nextDetail);
      setDetail(nextDetail);

      if (nextDetail.items.length === 0) {
        pushNotification({
          title: "수주품목 없음",
          message: `선택한 수주 ID ${orderId}에 표시할 수주품목이 없습니다.`,
          variant: "warning",
        });
      }

      if (nextDetail.items.some((item) => item.unitPrice === null)) {
        pushNotification({
          title: "기준정보 누락",
          message: "상세 품목 중 일부는 단가 기준정보가 없어 금액이 비어 있을 수 있습니다.",
          variant: "warning",
        });
      }

      if (clientResult.status === "rejected" || itemResult.status === "rejected" || unitPriceResult.status === "rejected") {
        pushNotification({
          title: "보조 API 부분 실패",
          message: "거래처/품목/단가 기준정보 중 일부를 가져오지 못해 가능한 정보만 표시했습니다.",
          variant: "info",
        });
      }

      setIsLoading(false);
    }

    void loadOrderDetail();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const displayNote = useMemo(() => detail.note, [detail.note]);

  const handleEdit = () => {
    setNotifications((current) => [
      ...current,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        message: "수정 화면은 프로토타입 더미 기능입니다.",
        title: "더미 기능",
        variant: "info",
      },
    ]);
  };

  return (
    <section className="space-y-6">
      <NotificationCenter
        notifications={notifications}
        onDismiss={dismissNotification}
      />
      <PageHeader
        actions={
          <>
            <AppButton
              className="min-w-[80px]"
              onClick={handleEdit}
              size="sm"
              variant="dark"
            >
              수정
            </AppButton>
            <AppButton
              className="min-w-[80px]"
              onClick={onBack}
              size="sm"
              variant="outline"
            >
              목록
            </AppButton>
          </>
        }
        title="수주 상세"
      />

      {errorMessage ? <StatusBanner variant="warning">{errorMessage}</StatusBanner> : null}
      {infoMessage ? <StatusBanner variant="info">{infoMessage}</StatusBanner> : null}

      <section className="space-y-5">
        <h2 className="text-[20px] font-bold tracking-[-0.02em] text-[#0f172a]">수주정보</h2>
        <div className="overflow-hidden rounded-[10px] border border-[#d7dce5] border-t-[3px] border-t-[#5a6fe0] bg-white">
          <table className="w-full border-collapse text-[13px] text-[#4b5563]">
            <tbody>
              <tr className="border-b border-[#e3e7ee]">
                <th className="w-[136px] bg-[#f3f4f6] px-5 py-5 text-left font-semibold text-[#5669d8]">수주번호</th>
                <td className="px-7 py-5">{detail.orderNumber}</td>
                <th className="w-[136px] bg-[#f3f4f6] px-5 py-5 text-left font-semibold text-[#5669d8]">거래처명</th>
                <td className="px-7 py-5">{detail.clientName}</td>
              </tr>
              <tr className="border-b border-[#e3e7ee]">
                <th className="bg-[#f3f4f6] px-5 py-5 text-left font-semibold text-[#5669d8]">거래처번호</th>
                <td className="px-7 py-5">{detail.clientNumber}</td>
                <th className="bg-[#f3f4f6] px-5 py-5 text-left font-semibold text-[#5669d8]">수주일자</th>
                <td className="px-7 py-5">{detail.orderDate}</td>
              </tr>
              <tr className="border-b border-[#e3e7ee]">
                <th className="bg-[#f3f4f6] px-5 py-5 text-left font-semibold text-[#5669d8]">납품요청일</th>
                <td className="px-7 py-5">{detail.deliveryRequestDate}</td>
                <th className="bg-[#f3f4f6] px-5 py-5 text-left font-semibold text-[#5669d8]">납품장소</th>
                <td className="px-7 py-5">{detail.deliveryPlace}</td>
              </tr>
              <tr>
                <th className="bg-[#f3f4f6] px-5 py-5 text-left font-semibold text-[#5669d8]">비고</th>
                <td className="px-7 py-5" colSpan={3}>
                  {displayNote}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-[20px] font-bold tracking-[-0.02em] text-[#0f172a]">수주품목</h2>
        <div className="relative min-h-[360px]">
          <LoadingOverlay
            isVisible={isLoading}
            message="orderApi 상세 품목을 불러오는 중입니다."
          />
          <DataTable
            columns={detailColumns}
            emptyMessage="표시할 수주품목이 없습니다."
            rows={detail.items}
            tableMinWidthClassName="min-w-[1220px]"
          />
        </div>
      </section>
    </section>
  );
}
