import { useEffect, useMemo, useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import type { ClientInfo } from "@/app/api/clientApi";
import { fetchClientList } from "@/app/api/clientApi";
import type { ItemInfo } from "@/app/api/itemApi";
import { fetchItemList } from "@/app/api/itemApi";
import { createOrder, fetchOrderList } from "@/app/api/orderApi";
import type { UnitPriceStandardRecord } from "@/app/api/unitPriceStandardApi";
import { fetchUnitPriceStandardList } from "@/app/api/unitPriceStandardApi";
import { AppButton } from "@/app/components/common/AppButton";
import { LoadingOverlay } from "@/app/components/common/LoadingOverlay";
import { NotificationCenter, type NotificationItem } from "@/app/components/common/NotificationCenter";
import { PageHeader } from "@/app/components/common/PageHeader";
import { StatusBanner } from "@/app/components/common/StatusBanner";
import { ClientSelectDialog } from "@/app/components/order/ClientSelectDialog";
import { ItemSelectDialog } from "@/app/components/order/ItemSelectDialog";
import type { OrderApiRecord, OrderCreatePayload, OrderRegisterItem } from "@/app/types/order";
import { formatFlexibleNumber, formatNumber, parseNumber } from "@/app/utils/orderUtils";
import { cn } from "@/app/utils/cn";

type OrderRegisterPageProps = {
  onBack: () => void;
  onComplete: (notification: Omit<NotificationItem, "id">) => void;
};

type FormState = {
  clientName: string;
  clientNumber: string;
  deliveryPlace: string;
  deliveryRequestDate: string;
  note: string;
  orderDate: string;
  orderNumber: string;
};

function createTodayText() {
  return new Date().toISOString().slice(0, 10);
}

function formatDecimalText(value: number | null) {
  if (value === null) {
    return "";
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function getMonthToken(dateText: string) {
  return dateText.slice(0, 7).replace(/-/g, "");
}

function getLatestSequenceForMonth(orders: OrderApiRecord[], monthToken: string) {
  const pattern = new RegExp(`^SO-${monthToken}-(\\d{3,})$`);
  return orders.reduce((max, order) => {
    const match = order.수주번호?.match(pattern);
    const sequence = match ? Number(match[1]) : 0;
    return Number.isFinite(sequence) ? Math.max(max, sequence) : max;
  }, 0);
}

function buildNextOrderNumber(orders: OrderApiRecord[], orderDate: string) {
  const effectiveDate = orderDate || createTodayText();
  const monthToken = getMonthToken(effectiveDate);
  const nextSequence = getLatestSequenceForMonth(orders, monthToken) + 1;
  return `SO-${monthToken}-${String(nextSequence).padStart(3, "0")}`;
}

function resolveUnitPrice(clientNumber: string, itemCode: string, unitPrices: UnitPriceStandardRecord[]) {
  const normalizedClientNumber = clientNumber.trim();
  const normalizedItemCode = itemCode.trim();

  const sortedRows = [...unitPrices]
    .filter((row) => row.단가구분 !== "구매")
    .filter((row) => row.적용유무 !== "X")
    .sort((left, right) => {
      const leftDate = Date.parse(left.적용일자 ?? left.변경일자 ?? left.수정일시 ?? left.생성일시 ?? "");
      const rightDate = Date.parse(right.적용일자 ?? right.변경일자 ?? right.수정일시 ?? right.생성일시 ?? "");
      return rightDate - leftDate;
    });

  for (const row of sortedRows) {
    if (row.품번?.trim() === normalizedItemCode && row.거래처번호?.trim() === normalizedClientNumber) {
      return parseNumber(row.단가);
    }
  }

  for (const row of sortedRows) {
    if (row.품번?.trim() === normalizedItemCode) {
      return parseNumber(row.단가);
    }
  }

  return null;
}

function calculateDerivedItem(item: OrderRegisterItem) {
  const orderQuantitySquareMeter =
    item.orderQuantityMeter !== null && item.width !== null
      ? Number(((item.orderQuantityMeter * item.width) / 1000).toFixed(2))
      : null;
  const orderQuantityEa =
    item.orderQuantityMeter !== null && item.length !== null && item.length > 0
      ? Math.floor(item.orderQuantityMeter / item.length)
      : null;
  const weightGram =
    orderQuantitySquareMeter !== null && item.gsm !== null ? Math.round(orderQuantitySquareMeter * item.gsm) : null;
  const amountWon =
    orderQuantitySquareMeter !== null && item.unitPrice !== null ? Math.round(orderQuantitySquareMeter * item.unitPrice) : null;

  return {
    ...item,
    amountWon,
    orderQuantityEa,
    orderQuantitySquareMeter,
    weightGram,
  };
}

function createRegisterItem(item: ItemInfo, clientNumber: string, unitPrices: UnitPriceStandardRecord[]): OrderRegisterItem {
  return calculateDerivedItem({
    amountWon: null,
    gsm: parseNumber(item.평량),
    id: item.id ?? `${item.품번 ?? item.품명 ?? "item"}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    isSelected: false,
    itemCode: item.품번?.trim() ?? "-",
    itemName: item.품명?.trim() ?? "-",
    length: parseNumber(item.길이),
    orderQuantityEa: null,
    orderQuantityMeter: null,
    orderQuantitySquareMeter: null,
    unitPrice: resolveUnitPrice(clientNumber, item.품번?.trim() ?? "", unitPrices),
    weightGram: null,
    width: parseNumber(item.폭),
  });
}

function buildSavePayload(form: FormState, items: OrderRegisterItem[]): OrderCreatePayload {
  return {
    거래처명: form.clientName,
    거래처번호: form.clientNumber,
    납품요청일: form.deliveryRequestDate || undefined,
    납품장소: form.deliveryPlace || undefined,
    비고: form.note || undefined,
    수주번호: form.orderNumber,
    수주일자: form.orderDate,
    수주품목: items.map((item) => ({
      금액: item.amountWon !== null ? String(item.amountWon) : undefined,
      길이: item.length !== null ? String(item.length) : undefined,
      단가: item.unitPrice !== null ? String(item.unitPrice) : undefined,
      수주량EA: item.orderQuantityEa !== null ? String(item.orderQuantityEa) : undefined,
      수주량m: item.orderQuantityMeter !== null ? formatDecimalText(item.orderQuantityMeter) : undefined,
      수주량m2: item.orderQuantitySquareMeter !== null ? formatDecimalText(item.orderQuantitySquareMeter) : undefined,
      중량: item.weightGram !== null ? String(item.weightGram) : undefined,
      평량: item.gsm !== null ? String(item.gsm) : undefined,
      폭: item.width !== null ? String(item.width) : undefined,
      품명: item.itemName !== "-" ? item.itemName : undefined,
      품번: item.itemCode !== "-" ? item.itemCode : undefined,
    })),
  };
}

function SearchIcon() {
  return (
    <svg
      fill="none"
      height="20"
      viewBox="0 0 24 24"
      width="20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21 21L16.65 16.65M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      fill="none"
      height="18"
      viewBox="0 0 24 24"
      width="18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 2V5M16 2V5M3 9H21M5 4H19C20.1046 4 21 4.89543 21 6V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V6C3 4.89543 3.89543 4 5 4Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function FieldCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("px-4 py-3", className)}>{children}</div>;
}

function FieldInput({
  className,
  icon,
  readOnly = false,
  value,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { icon?: ReactNode }) {
  return (
    <div className="relative">
      <input
        className={cn(
          "h-[44px] w-full rounded-[10px] border border-[#dfe3ea] bg-white px-4 text-[14px] text-[#374151] outline-none placeholder:text-[#9ca3af]",
          readOnly && "bg-[#f8fafc] text-[#6b7280]",
          Boolean(icon) && "pr-11",
          className,
        )}
        readOnly={readOnly}
        value={value}
        {...props}
      />
      {icon ? <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#111827]">{icon}</span> : null}
    </div>
  );
}

export function OrderRegisterPage({ onBack, onComplete }: OrderRegisterPageProps) {
  const [form, setForm] = useState<FormState>({
    clientName: "",
    clientNumber: "",
    deliveryPlace: "",
    deliveryRequestDate: "",
    note: "",
    orderDate: createTodayText(),
    orderNumber: "",
  });
  const [items, setItems] = useState<OrderRegisterItem[]>([]);
  const [orders, setOrders] = useState<OrderApiRecord[]>([]);
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [itemMaster, setItemMaster] = useState<ItemInfo[]>([]);
  const [unitPrices, setUnitPrices] = useState<UnitPriceStandardRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);

  const dismissNotification = (id: string) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  };

  const pushNotification = (notification: Omit<NotificationItem, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setNotifications((current) => [...current, { id, ...notification }]);
  };

  useEffect(() => {
    let isMounted = true;

    async function loadReferences() {
      setIsLoading(true);
      setErrorMessage("");
      console.log("[orderApi] 수주 등록 화면 초기 데이터 조회 시작:", { orderDate: form.orderDate });

      const [orderResult, clientResult, itemResult, unitPriceResult] = await Promise.allSettled([
        fetchOrderList(),
        fetchClientList(),
        fetchItemList(),
        fetchUnitPriceStandardList(),
      ]);

      if (!isMounted) {
        return;
      }

      const nextOrders = orderResult.status === "fulfilled" ? orderResult.value : [];
      const nextClients = clientResult.status === "fulfilled" ? clientResult.value : [];
      const nextItems = itemResult.status === "fulfilled" ? itemResult.value : [];
      const nextUnitPrices = unitPriceResult.status === "fulfilled" ? unitPriceResult.value : [];

      console.log("[orderApi] 수주 등록용 수주 목록 조회 결과:", nextOrders);
      console.log("[clientApi] 거래처 선택 목록 조회 결과:", nextClients);
      console.log("[itemApi] 품목 선택 목록 조회 결과:", nextItems);
      console.log("[unitPriceStandardApi] 품목 단가 조회 결과:", nextUnitPrices);

      setOrders(nextOrders);
      setClients(nextClients);
      setItemMaster(nextItems);
      setUnitPrices(nextUnitPrices);

      const failedApis = [
        orderResult.status === "rejected" ? "수주정보" : "",
        clientResult.status === "rejected" ? "거래처정보" : "",
        itemResult.status === "rejected" ? "품목정보" : "",
        unitPriceResult.status === "rejected" ? "단가기준정보" : "",
      ].filter(Boolean);

      if (failedApis.length > 0) {
        const nextMessage = `${failedApis.join(", ")} 데이터를 불러오는 데 실패하여 가능한 데이터만 표시합니다.`;
        setErrorMessage(nextMessage);
        pushNotification({ title: "초기 조회 경고", message: nextMessage, variant: "warning" });
      }

      setIsLoading(false);
    }

    void loadReferences();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      orderNumber: buildNextOrderNumber(orders, current.orderDate),
    }));
  }, [form.orderDate, orders]);

  useEffect(() => {
    // 거래처가 바뀌면 거래처별 단가를 다시 적용해서
    // 등록 전에 화면 금액과 실제 저장 값이 어긋나지 않게 맞춘다.
    setItems((current) =>
      current.map((item) =>
        calculateDerivedItem({
          ...item,
          unitPrice: resolveUnitPrice(form.clientNumber, item.itemCode, unitPrices),
        }),
      ),
    );
  }, [form.clientNumber, unitPrices]);

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + (item.amountWon ?? 0), 0),
    [items],
  );
  const totalSquareMeter = useMemo(
    () => items.reduce((sum, item) => sum + (item.orderQuantitySquareMeter ?? 0), 0),
    [items],
  );
  const isAllSelected = items.length > 0 && items.every((item) => item.isSelected);

  const handleClientSelected = (client: ClientInfo) => {
    setForm((current) => ({
      ...current,
      clientName: client.거래처명 ?? "",
      clientNumber: client.거래처번호 ?? "",
    }));
    setIsClientDialogOpen(false);
  };

  const handleAddItems = (selectedItems: ItemInfo[]) => {
    const duplicateCodes: string[] = [];

    setItems((current) => {
      const existingCodes = new Set(current.map((item) => item.itemCode));
      const nextRows = [...current];

      for (const item of selectedItems) {
        const itemCode = item.품번?.trim() ?? "-";
        if (existingCodes.has(itemCode)) {
          duplicateCodes.push(itemCode);
          continue;
        }

        nextRows.push(createRegisterItem(item, form.clientNumber, unitPrices));
        existingCodes.add(itemCode);
      }

      return nextRows;
    });

    if (duplicateCodes.length > 0) {
      pushNotification({
        title: "중복 품목 제외",
        message: `${duplicateCodes.join(", ")} 품목은 이미 추가되어 제외했습니다.`,
        variant: "info",
      });
    }

    setIsItemDialogOpen(false);
  };

  const handleQuantityChange = (itemId: string, rawValue: string) => {
    const parsedValue = rawValue.trim() === "" ? null : parseNumber(rawValue);

    setItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? calculateDerivedItem({
              ...item,
              orderQuantityMeter: parsedValue,
            })
          : item,
      ),
    );
  };

  const handleToggleAllRows = (checked: boolean) => {
    setItems((current) => current.map((item) => ({ ...item, isSelected: checked })));
  };

  const handleToggleRow = (itemId: string, checked: boolean) => {
    setItems((current) => current.map((item) => (item.id === itemId ? { ...item, isSelected: checked } : item)));
  };

  const handleSave = async () => {
    const invalidItems = items.filter((item) => item.orderQuantityMeter === null || item.orderQuantityMeter <= 0);

    if (!form.clientName.trim()) {
      pushNotification({
        title: "필수값 확인",
        message: "거래처명을 선택해주세요.",
        variant: "warning",
      });
      return;
    }

    if (items.length === 0) {
      pushNotification({
        title: "필수값 확인",
        message: "수주품목을 한 건 이상 추가해주세요.",
        variant: "warning",
      });
      return;
    }

    if (invalidItems.length > 0) {
      pushNotification({
        title: "필수값 확인",
        message: "모든 수주품목의 수주량(m)을 입력해주세요.",
        variant: "warning",
      });
      return;
    }

    const payload = buildSavePayload(form, items);
    console.log("[orderApi] 수주 등록 저장 직전 payload:", payload);

    try {
      setIsSaving(true);
      await createOrder(payload);
      onComplete({
        title: "등록 완료",
        message: "수주 등록이 완료되었습니다.",
        variant: "info",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "수주 등록 중 알 수 없는 오류가 발생했습니다.";
      pushNotification({
        title: "등록 실패",
        message,
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
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
              className="min-w-[92px]"
              disabled={isSaving}
              onClick={() => void handleSave()}
              size="sm"
              variant="dark"
            >
              저장
            </AppButton>
            <AppButton
              className="min-w-[92px]"
              onClick={onBack}
              size="sm"
              variant="outline"
            >
              목록
            </AppButton>
          </>
        }
        title="수주 등록"
      />

      {errorMessage ? <StatusBanner variant="warning">{errorMessage}</StatusBanner> : null}

      <section className="space-y-5">
        <h2 className="text-[20px] font-bold tracking-[-0.02em] text-[#0f172a]">수주정보</h2>
        <div className="overflow-hidden rounded-[10px] border border-[#d7dce5] border-t-[3px] border-t-[#5a6fe0] bg-white">
          <table className="w-full border-collapse text-[13px] text-[#4b5563]">
            <tbody>
              <tr className="border-b border-[#e3e7ee]">
                <th className="w-[128px] bg-[#f3f4f6] px-4 text-left font-semibold text-[#5669d8]">
                  <span className="text-[#ef4444]">*</span>수주번호
                </th>
                <td className="border-r border-[#e3e7ee]">
                  <FieldCell>
                    <FieldInput
                      readOnly
                      value={form.orderNumber}
                    />
                  </FieldCell>
                </td>
                <th className="w-[128px] bg-[#f3f4f6] px-4 text-left font-semibold text-[#5669d8]">
                  <span className="text-[#ef4444]">*</span>거래처명
                </th>
                <td>
                  <FieldCell>
                    <button
                      className="flex h-[44px] w-full items-center justify-between rounded-[10px] border border-[#dfe3ea] bg-white px-4 text-[14px] text-[#374151]"
                      onClick={() => setIsClientDialogOpen(true)}
                      type="button"
                    >
                      <span className={cn(!form.clientName && "text-[#9ca3af]")}>{form.clientName || "선택"}</span>
                      <span className="text-[#111827]">
                        <SearchIcon />
                      </span>
                    </button>
                  </FieldCell>
                </td>
              </tr>
              <tr className="border-b border-[#e3e7ee]">
                <th className="bg-[#f3f4f6] px-4 text-left font-semibold text-[#5669d8]">
                  <span className="text-[#ef4444]">*</span>거래처번호
                </th>
                <td className="border-r border-[#e3e7ee]">
                  <FieldCell>
                    <FieldInput
                      placeholder="선택"
                      readOnly
                      value={form.clientNumber}
                    />
                  </FieldCell>
                </td>
                <th className="bg-[#f3f4f6] px-4 text-left font-semibold text-[#5669d8]">수주일자</th>
                <td>
                  <FieldCell>
                    <FieldInput
                      icon={<CalendarIcon />}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          orderDate: event.target.value,
                        }))
                      }
                      type="date"
                      value={form.orderDate}
                    />
                  </FieldCell>
                </td>
              </tr>
              <tr className="border-b border-[#e3e7ee]">
                <th className="bg-[#f3f4f6] px-4 text-left font-semibold text-[#5669d8]">납품요청일</th>
                <td className="border-r border-[#e3e7ee]">
                  <FieldCell>
                    <FieldInput
                      icon={<CalendarIcon />}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          deliveryRequestDate: event.target.value,
                        }))
                      }
                      type="date"
                      value={form.deliveryRequestDate}
                    />
                  </FieldCell>
                </td>
                <th className="bg-[#f3f4f6] px-4 text-left font-semibold text-[#5669d8]">납품장소</th>
                <td>
                  <FieldCell>
                    <FieldInput
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          deliveryPlace: event.target.value,
                        }))
                      }
                      placeholder="납품장소를 입력하세요"
                      value={form.deliveryPlace}
                    />
                  </FieldCell>
                </td>
              </tr>
              <tr>
                <th className="bg-[#f3f4f6] px-4 text-left font-semibold text-[#5669d8]">비고</th>
                <td colSpan={3}>
                  <FieldCell>
                    <FieldInput
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          note: event.target.value,
                        }))
                      }
                      placeholder="비고를 입력하세요"
                      value={form.note}
                    />
                  </FieldCell>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[20px] font-bold tracking-[-0.02em] text-[#0f172a]">수주품목</h2>
          <AppButton
            className="min-w-[78px]"
            onClick={() => setIsItemDialogOpen(true)}
            size="sm"
            variant="dark"
          >
            추가
          </AppButton>
        </div>

        <div className="relative overflow-hidden rounded-[12px] border border-[#d8dde6] bg-white">
          <LoadingOverlay
            isVisible={isLoading || isSaving}
            message={isSaving ? "수주를 저장하는 중입니다." : "등록 화면 데이터를 불러오는 중입니다."}
          />
          <div className="overflow-auto">
            <table className="w-full min-w-[1380px] border-collapse">
              <thead>
                <tr>
                  <th className="bg-[#5669d8] px-3 py-3 text-center text-[13px] font-semibold text-white">
                    <input
                      checked={isAllSelected}
                      className="h-4 w-4 rounded border-[#d1d5db]"
                      onChange={(event) => handleToggleAllRows(event.target.checked)}
                      type="checkbox"
                    />
                  </th>
                  <th className="bg-[#5669d8] px-3 py-3 text-center text-[13px] font-semibold text-white">No</th>
                  <th className="bg-[#5669d8] px-3 py-3 text-center text-[13px] font-semibold text-white">품번</th>
                  <th className="bg-[#5669d8] px-3 py-3 text-center text-[13px] font-semibold text-white">품명</th>
                  <th className="bg-[#5669d8] px-3 py-3 text-center text-[13px] font-semibold text-white">평량(g/m²)</th>
                  <th className="bg-[#5669d8] px-3 py-3 text-center text-[13px] font-semibold text-white">폭(mm)</th>
                  <th className="bg-[#5669d8] px-3 py-3 text-center text-[13px] font-semibold text-white">길이(m)</th>
                  <th className="bg-[#5669d8] px-3 py-3 text-center text-[13px] font-semibold text-white">수주량(m)</th>
                  <th className="bg-[#5669d8] px-3 py-3 text-center text-[13px] font-semibold text-white">수주량(EA)</th>
                  <th className="bg-[#5669d8] px-3 py-3 text-center text-[13px] font-semibold text-white">수주량(m²)</th>
                  <th className="bg-[#5669d8] px-3 py-3 text-center text-[13px] font-semibold text-white">중량(g)</th>
                  <th className="bg-[#5669d8] px-3 py-3 text-center text-[13px] font-semibold text-white">단가(원/m²)</th>
                  <th className="bg-[#5669d8] px-3 py-3 text-center text-[13px] font-semibold text-white">금액(원)</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <tr
                      className="border-b border-[#e7ebf1] text-[13px] text-[#4b5563] last:border-b-0"
                      key={item.id}
                    >
                      <td className="px-3 py-3 text-center">
                        <input
                          checked={item.isSelected}
                          className="h-4 w-4 rounded border-[#d1d5db]"
                          onChange={(event) => handleToggleRow(item.id, event.target.checked)}
                          type="checkbox"
                        />
                      </td>
                      <td className="px-3 py-3 text-center">{index + 1}</td>
                      <td className="px-3 py-3 text-center">{item.itemCode}</td>
                      <td className="px-3 py-3 text-center">{item.itemName}</td>
                      <td className="px-3 py-3 text-center">{formatFlexibleNumber(item.gsm)}</td>
                      <td className="px-3 py-3 text-center">{formatFlexibleNumber(item.width)}</td>
                      <td className="px-3 py-3 text-center">{formatFlexibleNumber(item.length)}</td>
                      <td className="px-3 py-2 text-center">
                        <input
                          className="h-[38px] w-[120px] rounded-[8px] border border-[#dfe3ea] px-3 text-right text-[13px] text-[#374151] outline-none"
                          inputMode="decimal"
                          onChange={(event) => handleQuantityChange(item.id, event.target.value)}
                          value={item.orderQuantityMeter === null ? "" : formatDecimalText(item.orderQuantityMeter)}
                        />
                      </td>
                      <td className="px-3 py-3 text-center">{formatNumber(item.orderQuantityEa)}</td>
                      <td className="px-3 py-3 text-center">{formatFlexibleNumber(item.orderQuantitySquareMeter)}</td>
                      <td className="px-3 py-3 text-center">{formatNumber(item.weightGram)}</td>
                      <td className="px-3 py-3 text-center">{formatNumber(item.unitPrice)}</td>
                      <td className="px-3 py-3 text-center">{formatNumber(item.amountWon)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-4 py-16 text-center text-[18px] text-[#9ca3af]"
                      colSpan={13}
                    >
                      추가 버튼을 클릭하여 품목을 추가하세요.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {items.length > 0 ? (
            <div className="flex justify-end gap-8 border-t border-[#e7ebf1] bg-[#fbfcff] px-6 py-4 text-[14px] text-[#475569]">
              <span>합계 수주량(m²): {formatFlexibleNumber(totalSquareMeter)}</span>
              <span>합계 금액(원): {formatNumber(totalAmount)}</span>
            </div>
          ) : null}
        </div>
      </section>

      <ClientSelectDialog
        clients={clients}
        isLoading={isLoading}
        onClose={() => setIsClientDialogOpen(false)}
        onSelect={handleClientSelected}
        open={isClientDialogOpen}
      />
      <ItemSelectDialog
        clientNumber={form.clientNumber}
        isLoading={isLoading}
        items={itemMaster}
        onClose={() => setIsItemDialogOpen(false)}
        onConfirm={handleAddItems}
        open={isItemDialogOpen}
        unitPrices={unitPrices}
      />
    </section>
  );
}
