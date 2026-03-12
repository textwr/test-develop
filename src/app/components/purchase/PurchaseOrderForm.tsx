import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, InputHTMLAttributes, ReactNode } from "react";
import type { ClientInfo } from "@/app/api/clientApi";
import { fetchClientList } from "@/app/api/clientApi";
import type { ItemInfo } from "@/app/api/itemApi";
import { fetchItemList } from "@/app/api/itemApi";
import type { UnitPriceStandardRecord } from "@/app/api/unitPriceStandardApi";
import { fetchUnitPriceStandardList } from "@/app/api/unitPriceStandardApi";
import {
  createPurchaseOrder,
  fetchPurchaseOrderByNumber,
  fetchPurchaseOrderList,
  updatePurchaseOrderByNumber,
  uploadFile,
} from "@/app/api/purchaseOrderApi";
import { AppButton } from "@/app/components/common/AppButton";
import { LoadingOverlay } from "@/app/components/common/LoadingOverlay";
import { NotificationCenter, type NotificationItem } from "@/app/components/common/NotificationCenter";
import { PageHeader } from "@/app/components/common/PageHeader";
import { StatusBanner } from "@/app/components/common/StatusBanner";
import { ClientSelectDialog } from "@/app/components/order/ClientSelectDialog";
import { MaterialSelectDialog } from "@/app/components/order/MaterialSelectDialog";
import type {
  PurchaseOrderApiRecord,
  PurchaseOrderCreatePayload,
  PurchaseOrderDocuments,
  PurchaseOrderRegisterItem,
} from "@/app/types/purchaseOrder";
import { cn } from "@/app/utils/cn";
import { formatNumber, parseNumber } from "@/app/utils/orderUtils";
import {
  buildNextPurchaseOrderNumber,
  buildPurchaseEditItems,
  createPurchaseRegisterItem,
  getDocumentDisplayName,
  resolvePurchaseDocuments,
  resolvePurchaseUnitPrice,
} from "@/app/utils/purchaseOrderUtils";

type PurchaseOrderFormProps = {
  mode: "create" | "edit";
  orderNumber?: string;
  onBack: () => void;
  onComplete: (notification: Omit<NotificationItem, "id">) => void;
};

type FormState = {
  clientName: string;
  clientNumber: string;
  incomingRequestDate: string;
  note: string;
  orderDate: string;
  orderNumber: string;
  paymentCondition: string;
};

type DocumentState = PurchaseOrderDocuments & {
  materialCertFile: File | null;
  transactionStatementFile: File | null;
};

const PAYMENT_CONDITION_OPTIONS = [
  "마감후10일",
  "마감후15일",
  "마감후25일",
  "마감후35일",
  "마감후45일",
  "선결제",
  "즉시결제",
  "익월이월",
];

/**
 * 신규 발주 등록의 기본 날짜는 오늘 날짜이므로
 * 브라우저 입력 필드에 바로 넣을 수 있는 `YYYY-MM-DD` 형식으로 반환한다.
 */
function createTodayText() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * 발주 수량과 단가는 문자열로 저장되므로
 * 숫자 입력값을 저장 payload에 넣기 전 소수점 표현을 안정적으로 정리한다.
 */
function formatDecimalText(value: number | null) {
  if (value === null) {
    return "";
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

/**
 * 발주 품목 행은 수량 또는 단가가 바뀔 때마다 금액이 다시 계산되어야 하므로
 * 화면 상태를 갱신할 때 한 번에 파생값까지 맞춰 주는 헬퍼를 둔다.
 */
function calculatePurchaseItem(item: PurchaseOrderRegisterItem): PurchaseOrderRegisterItem {
  const amountWon = item.quantity !== null && item.unitPrice !== null ? Math.round(item.quantity * item.unitPrice) : null;
  return {
    ...item,
    amountWon,
  };
}

/**
 * 수정 화면은 API 원본 값을 그대로 입력 필드로 복원해야 하므로
 * 공통 form 상태 구조로 변환하는 함수를 따로 분리한다.
 */
function buildFormState(order: PurchaseOrderApiRecord): FormState {
  return {
    clientName: order.거래처명 ?? "",
    clientNumber: order.거래처번호 ?? "",
    incomingRequestDate: order.입고요청일?.slice(0, 10) ?? "",
    note: order.비고 ?? "",
    orderDate: order.발주일자?.slice(0, 10) ?? createTodayText(),
    orderNumber: order.발주번호 ?? "",
    paymentCondition: order.결제조건 ?? "",
  };
}

/**
 * 화면에서 선택된 품목과 제출서류 URL을 실제 API payload로 바꿔
 * 등록/수정 두 화면이 동일한 저장 형식을 사용하게 만든다.
 */
function buildSavePayload(
  form: FormState,
  items: PurchaseOrderRegisterItem[],
  documents: PurchaseOrderDocuments,
): PurchaseOrderCreatePayload {
  return {
    거래처명: form.clientName,
    거래처번호: form.clientNumber,
    발주번호: form.orderNumber,
    발주일자: form.orderDate,
    입고요청일: form.incomingRequestDate || undefined,
    결제조건: form.paymentCondition || undefined,
    비고: form.note || undefined,
    재료시험성적서: documents.materialCertUrl || undefined,
    거래명세서: documents.transactionStatementUrl || undefined,
    발주품목: items.map((item) => ({
      계정구분: item.accountCategory !== "-" ? item.accountCategory : undefined,
      품번: item.itemCode !== "-" ? item.itemCode : undefined,
      품명: item.itemName !== "-" ? item.itemName : undefined,
      규격: item.spec !== "-" ? item.spec : undefined,
      단위: item.unit !== "-" ? item.unit : undefined,
      발주수량: item.quantity !== null ? formatDecimalText(item.quantity) : undefined,
      단가: item.unitPrice !== null ? String(item.unitPrice) : undefined,
      금액: item.amountWon !== null ? String(item.amountWon) : undefined,
    })),
  };
}

/**
 * 거래처 검색 버튼 안에서 사용하는 돋보기 아이콘이다.
 * 수주 화면과 동일한 시각 톤을 유지하기 위해 로컬 SVG 함수로 제공한다.
 */
function SearchIcon() {
  return (
    <svg fill="none" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
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

/**
 * 날짜 필드 오른쪽에 붙는 달력 아이콘이다.
 * 입력 필드 구조를 단순하게 유지하기 위해 별도 컴포넌트 대신 함수로 정의한다.
 */
function CalendarIcon() {
  return (
    <svg fill="none" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
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

/**
 * 표 형식 입력 레이아웃의 셀 안쪽 여백을 통일해
 * 등록/수정 화면이 같은 간격과 높이를 유지하도록 돕는 래퍼다.
 */
function FieldCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("px-4 py-3", className)}>{children}</div>;
}

/**
 * 발주정보 표 안에서 공통으로 쓰는 입력 필드다.
 * 읽기 전용 상태와 우측 아이콘 배치를 한 곳에서 관리해 마크업 중복을 줄인다.
 */
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

/**
 * 제출서류 선택 버튼은 실제 파일 입력을 감춘 뒤 버튼으로 대체해
 * 기존 디자인과 동일한 버튼 모양을 유지하면서 파일 선택 기능을 제공한다.
 */
function DocumentUploadField({
  label,
  fileName,
  inputRef,
  onChange,
}: {
  label: string;
  fileName: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="min-w-[96px] text-[13px] text-[#374151]">{label}</span>
      <input className="hidden" onChange={onChange} ref={inputRef} type="file" />
      <AppButton
        className="!min-h-[34px] min-w-[76px] !rounded-[8px] !px-3 !text-[12px]"
        onClick={() => inputRef.current?.click()}
        size="sm"
        variant="outline"
      >
        파일선택
      </AppButton>
      <span className={cn("text-[13px]", fileName === "미등록" ? "text-[#6b7280]" : "text-[#111827]")}>{fileName}</span>
    </div>
  );
}

/**
 * 등록/수정 공통 발주 폼이다.
 * 수주 화면의 구성과 동작을 그대로 따르되 발주번호 규칙, 제출서류, 결제조건, 구매단가 계산을 추가한다.
 */
export function PurchaseOrderForm({ mode, onBack, onComplete, orderNumber }: PurchaseOrderFormProps) {
  const [form, setForm] = useState<FormState>({
    clientName: "",
    clientNumber: "",
    incomingRequestDate: "",
    note: "",
    orderDate: createTodayText(),
    orderNumber: "",
    paymentCondition: "",
  });
  const [documents, setDocuments] = useState<DocumentState>({
    materialCertFile: null,
    materialCertUrl: "",
    transactionStatementFile: null,
    transactionStatementUrl: "",
  });
  const [items, setItems] = useState<PurchaseOrderRegisterItem[]>([]);
  const [orders, setOrders] = useState<PurchaseOrderApiRecord[]>([]);
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [itemMaster, setItemMaster] = useState<ItemInfo[]>([]);
  const [unitPrices, setUnitPrices] = useState<UnitPriceStandardRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState(false);
  const hasLoadedInitialPricing = useRef(false);
  const materialCertInputRef = useRef<HTMLInputElement>(null);
  const transactionStatementInputRef = useRef<HTMLInputElement>(null);

  const dismissNotification = (id: string) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  };

  const pushNotification = (notification: Omit<NotificationItem, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setNotifications((current) => [...current, { id, ...notification }]);
  };

  useEffect(() => {
    let isMounted = true;

    /**
     * 등록/수정 화면이 필요한 기준정보와 원본 발주 데이터를 한 번에 불러와
     * 화면이 켜지자마자 거래처 선택, 품목 추가, 단가 계산까지 모두 가능한 상태를 만든다.
     */
    async function loadReferences() {
      setIsLoading(true);
      setErrorMessage("");
      setNotifications([]);

      if (mode === "create") {
        const [orderResult, clientResult, itemResult, unitPriceResult] = await Promise.allSettled([
          fetchPurchaseOrderList(),
          fetchClientList(),
          fetchItemList(),
          fetchUnitPriceStandardList(),
        ]);

        if (!isMounted) {
          return;
        }

        const nextOrders = orderResult.status === "fulfilled" ? (orderResult.value as PurchaseOrderApiRecord[]) : [];
        const nextClients = clientResult.status === "fulfilled" ? clientResult.value : [];
        const nextItems = itemResult.status === "fulfilled" ? itemResult.value : [];
        const nextUnitPrices = unitPriceResult.status === "fulfilled" ? unitPriceResult.value : [];

        setOrders(nextOrders);
        setClients(nextClients);
        setItemMaster(nextItems);
        setUnitPrices(nextUnitPrices);
        setForm((current) => ({
          ...current,
          orderNumber: buildNextPurchaseOrderNumber(nextOrders, current.orderDate),
        }));

        const failedApis = [
          orderResult.status === "rejected" ? "발주정보" : "",
          clientResult.status === "rejected" ? "거래처정보" : "",
          itemResult.status === "rejected" ? "품목정보" : "",
          unitPriceResult.status === "rejected" ? "단가기준정보" : "",
        ].filter(Boolean);

        if (failedApis.length > 0) {
          const message = `${failedApis.join(", ")} 데이터를 불러오는 데 실패하여 가능한 데이터만 표시합니다.`;
          setErrorMessage(message);
          pushNotification({ title: "초기 조회 경고", message, variant: "warning" });
        }

        setIsLoading(false);
        return;
      }

      const [orderResult, clientResult, itemResult, unitPriceResult] = await Promise.allSettled([
        fetchPurchaseOrderByNumber(orderNumber ?? ""),
        fetchClientList(),
        fetchItemList(),
        fetchUnitPriceStandardList(),
      ]);

      if (!isMounted) {
        return;
      }

      if (orderResult.status === "rejected") {
        const message = `선택한 발주(${orderNumber ?? "-"})를 불러오지 못했습니다.`;
        setErrorMessage(message);
        pushNotification({ title: "발주 조회 실패", message, variant: "error" });
        setIsLoading(false);
        return;
      }

      const nextOrder = orderResult.value as PurchaseOrderApiRecord;
      const nextClients = clientResult.status === "fulfilled" ? clientResult.value : [];
      const nextItems = itemResult.status === "fulfilled" ? itemResult.value : [];
      const nextUnitPrices = unitPriceResult.status === "fulfilled" ? unitPriceResult.value : [];
      const nextDocuments = resolvePurchaseDocuments(nextOrder);

      setClients(nextClients);
      setItemMaster(nextItems);
      setUnitPrices(nextUnitPrices);
      setForm(buildFormState(nextOrder));
      setDocuments({
        materialCertFile: null,
        materialCertUrl: nextDocuments.materialCertUrl,
        transactionStatementFile: null,
        transactionStatementUrl: nextDocuments.transactionStatementUrl,
      });
      setItems(buildPurchaseEditItems(nextOrder, nextItems, nextUnitPrices));
      hasLoadedInitialPricing.current = false;

      const failedApis = [
        clientResult.status === "rejected" ? "거래처정보" : "",
        itemResult.status === "rejected" ? "품목정보" : "",
        unitPriceResult.status === "rejected" ? "단가기준정보" : "",
      ].filter(Boolean);

      if (failedApis.length > 0) {
        const message = `${failedApis.join(", ")} 데이터를 불러오지 못해 가능한 정보만 반영했습니다.`;
        setErrorMessage(message);
        pushNotification({ title: "보조 데이터 부분 실패", message, variant: "warning" });
      }

      setIsLoading(false);
    }

    void loadReferences();

    return () => {
      isMounted = false;
    };
  }, [mode, orderNumber]);

  useEffect(() => {
    if (mode !== "create") {
      return;
    }

    setForm((current) => ({
      ...current,
      orderNumber: buildNextPurchaseOrderNumber(orders, current.orderDate),
    }));
  }, [mode, orders, form.orderDate]);

  useEffect(() => {
    if (!form.clientNumber || items.length === 0 || unitPrices.length === 0) {
      return;
    }

    if (mode === "edit" && !hasLoadedInitialPricing.current) {
      hasLoadedInitialPricing.current = true;
      return;
    }

    /**
     * 거래처가 바뀌면 거래처별 구매단가 기준을 다시 적용해
     * 화면 합계와 저장 payload의 금액이 항상 현재 거래처 기준으로 유지되게 한다.
     */
    setItems((current) =>
      current.map((item) =>
        calculatePurchaseItem({
          ...item,
          unitPrice: resolvePurchaseUnitPrice(form.clientNumber, item.itemCode, unitPrices),
        }),
      ),
    );
  }, [form.clientNumber, items.length, mode, unitPrices]);

  const totalAmount = useMemo(() => items.reduce((sum, item) => sum + (item.amountWon ?? 0), 0), [items]);
  const totalQuantity = useMemo(() => items.reduce((sum, item) => sum + (item.quantity ?? 0), 0), [items]);
  const isAllSelected = items.length > 0 && items.every((item) => item.isSelected);

  /**
   * 거래처를 선택하면 거래처번호와 결제조건 후보를 동시에 채워
   * 발주 헤더 입력을 최소화하고 이후 구매단가 계산에도 즉시 반영한다.
   */
  const handleClientSelected = (client: ClientInfo) => {
    setForm((current) => ({
      ...current,
      clientName: client.거래처명 ?? "",
      clientNumber: client.거래처번호 ?? "",
      paymentCondition: current.paymentCondition || client.결제조건 || "",
    }));
    setIsClientDialogOpen(false);
  };

  /**
   * 품목 선택 다이얼로그에서 넘어온 품목은 중복 품번을 제외하고 추가해
   * 같은 품목이 여러 번 들어가 저장 payload가 꼬이는 상황을 막는다.
   */
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

        nextRows.push(createPurchaseRegisterItem(item, form.clientNumber, unitPrices));
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

    setIsMaterialDialogOpen(false);
  };

  /**
   * 발주 수량 입력이 바뀌면 해당 행 금액을 즉시 다시 계산해
   * 사용자가 저장 전 총 금액을 바로 확인할 수 있게 한다.
   */
  const handleQuantityChange = (itemId: string, rawValue: string) => {
    const parsedValue = rawValue.trim() === "" ? null : parseNumber(rawValue);

    setItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? calculatePurchaseItem({
              ...item,
              quantity: parsedValue,
            })
          : item,
      ),
    );
  };

  /**
   * 제출서류 파일 입력은 즉시 업로드하지 않고 저장 직전에만 업로드해
   * 사용자가 중간에 폼을 닫더라도 불필요한 파일 업로드가 발생하지 않게 한다.
   */
  const handleDocumentChange = (type: "material-cert" | "transaction-statement", event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (type === "material-cert") {
      setDocuments((current) => ({
        ...current,
        materialCertFile: file,
      }));
    } else {
      setDocuments((current) => ({
        ...current,
        transactionStatementFile: file,
      }));
    }

    event.target.value = "";
  };

  const handleToggleAllRows = (checked: boolean) => {
    setItems((current) => current.map((item) => ({ ...item, isSelected: checked })));
  };

  const handleToggleRow = (itemId: string, checked: boolean) => {
    setItems((current) => current.map((item) => (item.id === itemId ? { ...item, isSelected: checked } : item)));
  };

  /**
   * 저장 직전 선택된 파일만 업로드하고, 기존 URL이 있는 서류는 그대로 유지해
   * 수정 화면에서 파일을 다시 고르지 않아도 기존 제출서류가 보존되게 한다.
   */
  const uploadPendingDocuments = async (): Promise<PurchaseOrderDocuments> => {
    const [materialCertUrl, transactionStatementUrl] = await Promise.all([
      documents.materialCertFile
        ? uploadFile(documents.materialCertFile, "material-cert")
        : Promise.resolve(documents.materialCertUrl),
      documents.transactionStatementFile
        ? uploadFile(documents.transactionStatementFile, "transaction-statement")
        : Promise.resolve(documents.transactionStatementUrl),
    ]);

    return {
      materialCertUrl,
      transactionStatementUrl,
    };
  };

  /**
   * 저장 버튼은 필수값 검증, 제출서류 업로드, payload 생성, 등록/수정 API 호출을 순서대로 수행한다.
   * 검증 실패 메시지를 먼저 보여 줘 사용자가 어떤 값을 보완해야 하는지 즉시 알 수 있게 한다.
   */
  const handleSave = async () => {
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
        message: "발주품목을 한 건 이상 추가해주세요.",
        variant: "warning",
      });
      return;
    }

    const selectedItems = items.filter((item) => item.isSelected);

    if (selectedItems.length === 0) {
      pushNotification({
        title: "필수값 확인",
        message: "저장할 발주품목을 선택해주세요.",
        variant: "warning",
      });
      return;
    }

    const invalidItems = selectedItems.filter((item) => item.quantity === null || item.quantity <= 0);

    if (invalidItems.length > 0) {
      pushNotification({
        title: "필수값 확인",
        message: "선택한 발주품목의 수량을 입력해주세요.",
        variant: "warning",
      });
      return;
    }

    try {
      setIsSaving(true);
      const uploadedDocuments = await uploadPendingDocuments();
      const payload = buildSavePayload(form, selectedItems, uploadedDocuments);

      setDocuments((current) => ({
        ...current,
        ...uploadedDocuments,
        materialCertFile: null,
        transactionStatementFile: null,
      }));

      if (mode === "create") {
        await createPurchaseOrder(payload);
        onComplete({
          title: "등록 완료",
          message: "발주 등록이 완료되었습니다.",
          variant: "info",
        });
      } else {
        await updatePurchaseOrderByNumber(form.orderNumber, payload);
        onComplete({
          title: "수정 완료",
          message: "발주 정보가 수정되었습니다.",
          variant: "info",
        });
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : mode === "create"
            ? "발주 등록 중 알 수 없는 오류가 발생했습니다."
            : "발주 수정 중 알 수 없는 오류가 발생했습니다.";

      pushNotification({
        title: mode === "create" ? "등록 실패" : "수정 실패",
        message,
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const materialCertName = useMemo(() => {
    if (documents.materialCertFile) {
      return documents.materialCertFile.name;
    }

    return getDocumentDisplayName(documents.materialCertUrl);
  }, [documents.materialCertFile, documents.materialCertUrl]);

  const transactionStatementName = useMemo(() => {
    if (documents.transactionStatementFile) {
      return documents.transactionStatementFile.name;
    }

    return getDocumentDisplayName(documents.transactionStatementUrl);
  }, [documents.transactionStatementFile, documents.transactionStatementUrl]);

  return (
    <section className="space-y-6">
      <NotificationCenter notifications={notifications} onDismiss={dismissNotification} />
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
              {mode === "create" ? "저장" : "수정"}
            </AppButton>
            <AppButton className="min-w-[92px]" onClick={onBack} size="sm" variant="outline">
              {mode === "create" ? "목록" : "상세"}
            </AppButton>
          </>
        }
        title={mode === "create" ? "발주 등록" : "발주 수정"}
      />

      {errorMessage ? <StatusBanner variant="warning">{errorMessage}</StatusBanner> : null}

      <section className="space-y-5">
        <h2 className="text-[20px] font-bold tracking-[-0.02em] text-[#0f172a]">발주정보</h2>
        <div className="overflow-hidden rounded-[10px] border border-[#d7dce5] border-t-[3px] border-t-[#5a6fe0] bg-white">
          <table className="w-full border-collapse text-[13px] text-[#4b5563]">
            <tbody>
              <tr className="border-b border-[#e3e7ee]">
                <th className="w-[128px] bg-[#f3f4f6] px-4 text-left font-semibold text-[#5669d8]">
                  <span className="text-[#ef4444]">*</span>발주번호
                </th>
                <td className="border-r border-[#e3e7ee]">
                  <FieldCell>
                    <FieldInput readOnly value={form.orderNumber} />
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
                    <FieldInput placeholder="선택" readOnly value={form.clientNumber} />
                  </FieldCell>
                </td>
                <th className="bg-[#f3f4f6] px-4 text-left font-semibold text-[#5669d8]">발주일자</th>
                <td>
                  <FieldCell>
                    <FieldInput
                      icon={<CalendarIcon />}
                      onChange={(event) => setForm((current) => ({ ...current, orderDate: event.target.value }))}
                      type="date"
                      value={form.orderDate}
                    />
                  </FieldCell>
                </td>
              </tr>
              <tr className="border-b border-[#e3e7ee]">
                <th className="bg-[#f3f4f6] px-4 text-left font-semibold text-[#5669d8]">입고요청일</th>
                <td className="border-r border-[#e3e7ee]">
                  <FieldCell>
                    <FieldInput
                      icon={<CalendarIcon />}
                      onChange={(event) => setForm((current) => ({ ...current, incomingRequestDate: event.target.value }))}
                      type="date"
                      value={form.incomingRequestDate}
                    />
                  </FieldCell>
                </td>
                <th className="bg-[#f3f4f6] px-4 text-left font-semibold text-[#5669d8]">결제조건</th>
                <td>
                  <FieldCell>
                    <select
                      className="h-[44px] w-full rounded-[10px] border border-[#dfe3ea] bg-white px-4 text-[14px] text-[#374151] outline-none"
                      onChange={(event) => setForm((current) => ({ ...current, paymentCondition: event.target.value }))}
                      value={form.paymentCondition}
                    >
                      <option value="">선택</option>
                      {PAYMENT_CONDITION_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </FieldCell>
                </td>
              </tr>
              <tr className="border-b border-[#e3e7ee]">
                <th className="bg-[#f3f4f6] px-4 text-left font-semibold text-[#5669d8]">제출서류</th>
                <td className="border-r border-[#e3e7ee]">
                  <FieldCell className="space-y-3">
                    <DocumentUploadField
                      fileName={materialCertName}
                      inputRef={materialCertInputRef}
                      label="재료시험성적서"
                      onChange={(event) => handleDocumentChange("material-cert", event)}
                    />
                    <DocumentUploadField
                      fileName={transactionStatementName}
                      inputRef={transactionStatementInputRef}
                      label="거래명세서"
                      onChange={(event) => handleDocumentChange("transaction-statement", event)}
                    />
                  </FieldCell>
                </td>
                <th className="bg-[#f3f4f6] px-4 text-left font-semibold text-[#5669d8]">비고</th>
                <td>
                  <FieldCell>
                    <FieldInput
                      onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
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
          <h2 className="text-[20px] font-bold tracking-[-0.02em] text-[#0f172a]">발주품목</h2>
          <AppButton className="min-w-[78px]" onClick={() => setIsMaterialDialogOpen(true)} size="sm" variant="dark">
            추가
          </AppButton>
        </div>

        <div className="relative overflow-hidden rounded-[12px] border border-[#d8dde6] bg-white">
          <LoadingOverlay
            isVisible={isLoading || isSaving}
            message={isSaving ? "발주 정보를 저장하는 중입니다." : "발주 화면 데이터를 불러오는 중입니다."}
          />
          <div className="overflow-auto">
            <table className="w-full min-w-[1280px] border-collapse">
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
                  <th className="bg-[#5669d8] px-3 py-3 text-center text-[13px] font-semibold text-white">계정구분</th>
                  <th className="bg-[#5669d8] px-3 py-3 text-center text-[13px] font-semibold text-white">품번</th>
                  <th className="bg-[#5669d8] px-3 py-3 text-center text-[13px] font-semibold text-white">품명</th>
                  <th className="bg-[#5669d8] px-3 py-3 text-center text-[13px] font-semibold text-white">규격</th>
                  <th className="bg-[#5669d8] px-3 py-3 text-center text-[13px] font-semibold text-white">단위</th>
                  <th className="bg-[#5669d8] px-3 py-3 text-center text-[13px] font-semibold text-white">수량</th>
                  <th className="bg-[#5669d8] px-3 py-3 text-center text-[13px] font-semibold text-white">단가</th>
                  <th className="bg-[#5669d8] px-3 py-3 text-center text-[13px] font-semibold text-white">금액</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <tr className="border-b border-[#e7ebf1] text-[13px] text-[#4b5563] last:border-b-0" key={item.id}>
                      <td className="px-3 py-3 text-center">
                        <input
                          checked={item.isSelected}
                          className="h-4 w-4 rounded border-[#d1d5db]"
                          onChange={(event) => handleToggleRow(item.id, event.target.checked)}
                          type="checkbox"
                        />
                      </td>
                      <td className="px-3 py-3 text-center">{index + 1}</td>
                      <td className="px-3 py-3 text-center">{item.accountCategory}</td>
                      <td className="px-3 py-3 text-center">{item.itemCode}</td>
                      <td className="px-3 py-3 text-center">{item.itemName}</td>
                      <td className="px-3 py-3 text-center">{item.spec}</td>
                      <td className="px-3 py-3 text-center">{item.unit}</td>
                      <td className="px-3 py-2 text-center">
                        <input
                          className="h-[38px] w-[120px] rounded-[8px] border border-[#dfe3ea] px-3 text-right text-[13px] text-[#374151] outline-none"
                          inputMode="decimal"
                          onChange={(event) => handleQuantityChange(item.id, event.target.value)}
                          value={item.quantity === null ? "" : formatDecimalText(item.quantity)}
                        />
                      </td>
                      <td className="px-3 py-3 text-center">{formatNumber(item.unitPrice)}</td>
                      <td className="px-3 py-3 text-center">{formatNumber(item.amountWon)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-16 text-center text-[18px] text-[#9ca3af]" colSpan={10}>
                      추가 버튼을 클릭하여 발주품목을 추가하세요.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {items.length > 0 ? (
            <div className="flex justify-end gap-8 border-t border-[#e7ebf1] bg-[#fbfcff] px-6 py-4 text-[14px] text-[#475569]">
              <span>합계 수량: {formatNumber(totalQuantity)}</span>
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
      <MaterialSelectDialog
        clientNumber={form.clientNumber}
        isLoading={isLoading}
        items={itemMaster}
        onClose={() => setIsMaterialDialogOpen(false)}
        onConfirm={handleAddItems}
        open={isMaterialDialogOpen}
        unitPrices={unitPrices}
      />
    </section>
  );
}
