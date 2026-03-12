import type { ClientInfo } from "@/app/api/clientApi";
import type { ItemInfo } from "@/app/api/itemApi";
import type { UnitPriceStandardRecord } from "@/app/api/unitPriceStandardApi";
import { formatDate, parseNumber } from "@/app/utils/orderUtils";
import type {
  PurchaseOrderApiLineItem,
  PurchaseOrderApiRecord,
  PurchaseOrderDetailView,
  PurchaseOrderDocuments,
  PurchaseOrderItemView,
  PurchaseOrderListRow,
  PurchaseOrderRegisterItem,
} from "@/app/types/purchaseOrder";

const EMPTY_TEXT = "-";

type EnrichmentSource = {
  clients: ClientInfo[];
  items: ItemInfo[];
  unitPrices: UnitPriceStandardRecord[];
};

/**
 * 발주 화면은 목록/상세/수정이 모두 같은 원본 값을 재사용하므로
 * 공백 문자열 여부를 한 번만 표준화해 두어 표시 텍스트와 비교 로직을 일관되게 만든다.
 */
function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * 여러 후보 필드 중 실제로 값이 들어 있는 첫 값을 선택해
 * API가 보조 정보와 원본 정보를 섞어 내려줘도 화면에 빈칸이 남지 않게 한다.
 */
function getText(...values: Array<string | undefined>): string {
  const match = values.find(hasText);
  return match ?? EMPTY_TEXT;
}

/**
 * 발주번호 생성 규칙이 연월 단위로 증가하므로
 * 날짜 입력값을 `YYYYMM` 토큰으로 바꿔 동일 월의 마지막 순번을 찾기 쉽게 만든다.
 */
export function getPurchaseMonthToken(dateText: string) {
  return dateText.slice(0, 7).replace(/-/g, "");
}

/**
 * 이미 저장된 발주 목록에서 같은 연월을 가진 발주번호만 추려
 * 다음 발주번호를 만들 때 사용할 마지막 순번을 계산한다.
 */
export function getLatestPurchaseSequenceForMonth(orders: PurchaseOrderApiRecord[], monthToken: string) {
  const pattern = new RegExp(`^PO-${monthToken}-(\\d{3,})$`);

  return orders.reduce((max, order) => {
    const match = order.발주번호?.match(pattern);
    const sequence = match ? Number(match[1]) : 0;
    return Number.isFinite(sequence) ? Math.max(max, sequence) : max;
  }, 0);
}

/**
 * 발주일자를 기준으로 같은 월의 다음 순번을 계산해
 * 화면에서 즉시 확인 가능한 발주번호를 생성한다.
 */
export function buildNextPurchaseOrderNumber(orders: PurchaseOrderApiRecord[], orderDate: string) {
  const effectiveDate = hasText(orderDate) ? orderDate : new Date().toISOString().slice(0, 10);
  const monthToken = getPurchaseMonthToken(effectiveDate);
  const nextSequence = getLatestPurchaseSequenceForMonth(orders, monthToken) + 1;
  return `PO-${monthToken}-${String(nextSequence).padStart(3, "0")}`;
}

/**
 * 발주 데이터에 거래처번호 또는 거래처명이 일부만 들어오는 경우가 있어
 * 거래처 기준정보와 대조해 누락된 이름/번호를 보완한다.
 */
function resolveClient(order: PurchaseOrderApiRecord, clients: ClientInfo[]) {
  return clients.find(
    (client) =>
      client.거래처번호 === order.거래처번호 ||
      (hasText(client.거래처명) && hasText(order.거래처명) && client.거래처명 === order.거래처명),
  );
}

/**
 * 발주 품목이 마스터 품목과 품번 또는 품명으로 연결될 수 있으므로
 * 어느 쪽이 들어와도 규격/단위/계정구분을 보완할 수 있게 매칭 규칙을 완화한다.
 */
function resolveItem(lineItem: PurchaseOrderApiLineItem, items: ItemInfo[]) {
  return items.find(
    (item) =>
      item.품번 === lineItem.품번 ||
      (hasText(item.품명) && hasText(lineItem.품명) && item.품명 === lineItem.품명),
  );
}

/**
 * 구매 단가 기준은 거래처+품번 우선, 품번 공통 단가 차선으로 사용해야 하므로
 * 최신 기준만 남긴 조회 맵을 미리 만들어 품목 선택/금액 계산에서 재사용한다.
 */
function buildPurchasePriceLookup(unitPrices: UnitPriceStandardRecord[]) {
  const exactMatch = new Map<string, number>();
  const itemOnly = new Map<string, number>();

  const sortedRows = [...unitPrices]
    .filter((row) => row.단가구분 === "구매")
    .filter((row) => row.적용유무 !== "X")
    .sort((left, right) => {
      const leftDate = Date.parse(left.적용일자 ?? left.변경일자 ?? left.수정일시 ?? left.생성일시 ?? "");
      const rightDate = Date.parse(right.적용일자 ?? right.변경일자 ?? right.수정일시 ?? right.생성일시 ?? "");
      const leftRevision = left.RevNo ?? left.개정번호 ?? 0;
      const rightRevision = right.RevNo ?? right.개정번호 ?? 0;

      if (leftDate !== rightDate) {
        return rightDate - leftDate;
      }

      return rightRevision - leftRevision;
    });

  for (const row of sortedRows) {
    const price = parseNumber(row.단가);
    const itemCode = row.품번?.trim();
    const clientNumber = row.거래처번호?.trim();

    if (price === null || !itemCode) {
      continue;
    }

    if (clientNumber) {
      const key = `${clientNumber}::${itemCode}`;
      if (!exactMatch.has(key)) {
        exactMatch.set(key, price);
      }
    }

    if (!itemOnly.has(itemCode)) {
      itemOnly.set(itemCode, price);
    }
  }

  return { exactMatch, itemOnly };
}

/**
 * 발주 등록/수정 화면에서 거래처 선택이 바뀌면
 * 즉시 최신 구매 단가를 다시 계산할 수 있도록 단일 조회 함수를 제공한다.
 */
export function resolvePurchaseUnitPrice(
  clientNumber: string,
  itemCode: string,
  unitPrices: UnitPriceStandardRecord[],
) {
  const normalizedClientNumber = clientNumber.trim();
  const normalizedItemCode = itemCode.trim();
  const lookup = buildPurchasePriceLookup(unitPrices);

  return (
    (normalizedClientNumber ? lookup.exactMatch.get(`${normalizedClientNumber}::${normalizedItemCode}`) : undefined) ??
    lookup.itemOnly.get(normalizedItemCode) ??
    null
  );
}

/**
 * 발주 API가 중첩 배열 형태 또는 목록용 평탄화 형태 둘 다 반환할 수 있으므로
 * 어느 형태가 와도 동일한 화면 계산 경로를 타도록 품목 배열을 정규화한다.
 */
function extractPurchaseLineItems(order: PurchaseOrderApiRecord): PurchaseOrderApiLineItem[] {
  if (Array.isArray(order.발주품목) && order.발주품목.length > 0) {
    return order.발주품목;
  }

  if (
    hasText(order.품번) ||
    hasText(order.품명) ||
    hasText(order.규격) ||
    hasText(order.단위) ||
    hasText(order.발주수량) ||
    hasText(order.수량)
  ) {
    return [
      {
        계정구분: order.계정구분,
        품번: order.품번,
        품명: order.품명,
        규격: order.규격,
        단위: order.단위,
        발주수량: order.발주수량 ?? order.수량,
        단가: order.단가,
        금액: order.금액,
      },
    ];
  }

  return [];
}

/**
 * 품목 마스터에 단위가 여러 컬럼으로 나뉘어 있어
 * 발주 화면에서는 포장단위를 우선으로, 없으면 폭단위를 차선으로 보여준다.
 */
function resolveUnit(lineItem: PurchaseOrderApiLineItem, item: ItemInfo | undefined) {
  return getText(lineItem.단위, item?.포장단위, item?.폭단위);
}

/**
 * 발주 수량과 단가가 있으면 금액을 다시 계산해
 * 저장 전 화면 합계와 서버에 전달하는 값이 서로 어긋나지 않게 유지한다.
 */
function calculateAmount(quantity: number | null, unitPrice: number | null, provided: number | null) {
  if (quantity !== null && unitPrice !== null) {
    return Math.round(quantity * unitPrice);
  }

  return provided;
}

/**
 * 발주번호가 비어 있는 비정상 데이터가 있어도 목록 정렬과 선택이 깨지지 않도록
 * 날짜와 행 순서를 기반으로 임시 번호를 만들어 안정적인 키를 제공한다.
 */
function buildFallbackOrderNumber(order: PurchaseOrderApiRecord, orderIndex: number) {
  const dateText = formatDate(order.발주일자 ?? order.등록일시);

  if (dateText !== EMPTY_TEXT) {
    const compactDate = dateText.slice(0, 7).replace(/-/g, "");
    return `PO-${compactDate}-${String(orderIndex + 1).padStart(3, "0")}`;
  }

  return `PO-UNKNOWN-${String(orderIndex + 1).padStart(3, "0")}`;
}

/**
 * 원본 발주 1건을 화면용 품목 행 배열로 바꿔
 * 목록, 상세, 수정 화면이 모두 같은 품목 계산 규칙을 공유하게 만든다.
 */
function buildPurchaseItems(order: PurchaseOrderApiRecord, orderIndex: number, source: EnrichmentSource): PurchaseOrderItemView[] {
  const client = resolveClient(order, source.clients);
  const priceLookup = buildPurchasePriceLookup(source.unitPrices);
  const lineItems = extractPurchaseLineItems(order);

  return lineItems.map((lineItem, lineIndex) => {
    const item = resolveItem(lineItem, source.items);
    const clientNumber = getText(order.거래처번호, client?.거래처번호);
    const itemCode = getText(lineItem.품번, item?.품번);
    const quantity = parseNumber(lineItem.발주수량 ?? lineItem.수량);
    const unitPriceFromLookup =
      (clientNumber !== EMPTY_TEXT ? priceLookup.exactMatch.get(`${clientNumber}::${itemCode}`) : undefined) ??
      priceLookup.itemOnly.get(itemCode);
    const unitPrice = parseNumber(lineItem.단가) ?? unitPriceFromLookup ?? null;

    return {
      id: `${order.id ?? buildFallbackOrderNumber(order, orderIndex)}-${lineIndex + 1}`,
      accountCategory: getText(lineItem.계정구분, item?.계정구분),
      itemCode,
      itemName: getText(lineItem.품명, item?.품명),
      spec: getText(lineItem.규격, item?.규격),
      unit: resolveUnit(lineItem, item),
      quantity,
      unitPrice,
      amountWon: calculateAmount(quantity, unitPrice, parseNumber(lineItem.금액)),
    };
  });
}

/**
 * 발주 화면의 제출서류는 기존 데이터 구조가 바뀔 가능성을 고려해
 * 최상위 컬럼과 제출서류 객체 양쪽에서 모두 URL을 찾아오도록 만든다.
 */
export function resolvePurchaseDocuments(order: PurchaseOrderApiRecord): PurchaseOrderDocuments {
  return {
    materialCertUrl: order.재료시험성적서 ?? order.제출서류?.재료시험성적서 ?? "",
    transactionStatementUrl: order.거래명세서 ?? order.제출서류?.거래명세서 ?? "",
  };
}

/**
 * 목록 화면은 발주 1건을 품목별 행으로 펼쳐 보여줘야 하므로
 * 발주 헤더 정보와 품목 정보를 결합한 평탄화 모델을 만든다.
 */
export function buildPurchaseOrderListRows({
  orders,
  clients,
  items,
  unitPrices,
}: {
  orders: PurchaseOrderApiRecord[];
  clients: ClientInfo[];
  items: ItemInfo[];
  unitPrices: UnitPriceStandardRecord[];
}): PurchaseOrderListRow[] {
  const source = { clients, items, unitPrices };

  return orders
    .flatMap((order, orderIndex) => {
      const client = resolveClient(order, clients);
      const orderNumber =
        getText(order.발주번호) !== EMPTY_TEXT ? getText(order.발주번호) : buildFallbackOrderNumber(order, orderIndex);

      return buildPurchaseItems(order, orderIndex, source).map((itemRow) => ({
        ...itemRow,
        orderId: order.id ?? orderNumber,
        orderNumber,
        orderDate: formatDate(order.발주일자 ?? order.등록일시),
        clientName: getText(order.거래처명, client?.거래처명),
        clientNumber: getText(order.거래처번호, client?.거래처번호),
        incomingRequestDate: formatDate(order.입고요청일),
        paymentCondition: getText(order.결제조건),
        note: getText(order.비고),
      }));
    })
    .sort((left, right) => {
      const leftTime = Date.parse(left.orderDate);
      const rightTime = Date.parse(right.orderDate);

      if (!Number.isNaN(leftTime) && !Number.isNaN(rightTime) && leftTime !== rightTime) {
        return rightTime - leftTime;
      }

      return right.orderNumber.localeCompare(left.orderNumber, "ko-KR");
    });
}

/**
 * 상세 화면은 목록과 동일한 품목 보정 로직을 그대로 써야 하므로
 * 공통 계산 함수를 재사용해 한 건의 발주를 상세 모델로 변환한다.
 */
export function buildPurchaseOrderDetailView({
  order,
  clients,
  items,
  unitPrices,
}: {
  order: PurchaseOrderApiRecord;
  clients: ClientInfo[];
  items: ItemInfo[];
  unitPrices: UnitPriceStandardRecord[];
}): PurchaseOrderDetailView {
  const client = resolveClient(order, clients);

  return {
    orderId: order.id ?? EMPTY_TEXT,
    orderNumber: getText(order.발주번호),
    orderDate: formatDate(order.발주일자 ?? order.등록일시),
    clientName: getText(order.거래처명, client?.거래처명),
    clientNumber: getText(order.거래처번호, client?.거래처번호),
    incomingRequestDate: formatDate(order.입고요청일),
    paymentCondition: getText(order.결제조건),
    note: getText(order.비고),
    documents: resolvePurchaseDocuments(order),
    items: buildPurchaseItems(order, 0, { clients, items, unitPrices }),
  };
}

/**
 * 품목 선택 다이얼로그에서 고른 품목을 발주 등록 행으로 바꿀 때
 * 수량은 비워 두고 규격/단위/구매단가만 미리 채워 입력 부담을 줄인다.
 */
export function createPurchaseRegisterItem(
  item: ItemInfo,
  clientNumber: string,
  unitPrices: UnitPriceStandardRecord[],
): PurchaseOrderRegisterItem {
  const itemCode = item.품번?.trim() ?? "-";
  const unitPrice = resolvePurchaseUnitPrice(clientNumber, itemCode, unitPrices);
  const quantity = null;

  return {
    id: item.id ?? `${itemCode}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    isSelected: true,
    accountCategory: getText(item.계정구분),
    itemCode,
    itemName: item.품명?.trim() ?? "-",
    spec: getText(item.규격),
    unit: getText(item.포장단위, item.폭단위),
    quantity,
    unitPrice,
    amountWon: calculateAmount(quantity, unitPrice, null),
  };
}

/**
 * 수정 화면은 API 원본 품목과 마스터 품목을 함께 참고해
 * 저장되어 있던 값이 일부 비어 있어도 사용자가 바로 편집 가능한 행으로 복원한다.
 */
export function buildPurchaseEditItems(
  order: PurchaseOrderApiRecord,
  itemMaster: ItemInfo[],
  unitPrices: UnitPriceStandardRecord[],
): PurchaseOrderRegisterItem[] {
  return extractPurchaseLineItems(order).map((lineItem, index) => {
    const item = resolveItem(lineItem, itemMaster);
    const itemCode = getText(lineItem.품번, item?.품번);
    const quantity = parseNumber(lineItem.발주수량 ?? lineItem.수량);
    const unitPrice = parseNumber(lineItem.단가) ?? resolvePurchaseUnitPrice(order.거래처번호 ?? "", itemCode, unitPrices);

    return {
      id: `${order.id ?? order.발주번호 ?? "purchase-order"}-${index + 1}`,
      isSelected: true,
      accountCategory: getText(lineItem.계정구분, item?.계정구분),
      itemCode,
      itemName: getText(lineItem.품명, item?.품명),
      spec: getText(lineItem.규격, item?.규격),
      unit: resolveUnit(lineItem, item),
      quantity,
      unitPrice,
      amountWon: calculateAmount(quantity, unitPrice, parseNumber(lineItem.금액)),
    };
  });
}

/**
 * 파일 URL은 그대로 노출하면 너무 길기 때문에
 * 화면에서는 마지막 파일명만 추출해 제출서류 상태를 읽기 쉽게 만든다.
 */
export function getDocumentDisplayName(url: string) {
  if (!hasText(url)) {
    return "미등록";
  }

  const segments = url.split("/");
  const lastSegment = segments[segments.length - 1];
  return decodeURIComponent(lastSegment || url);
}
