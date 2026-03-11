import type { ClientInfo } from "@/app/api/clientApi";
import type { ItemInfo } from "@/app/api/itemApi";
import type { UnitPriceStandardRecord } from "@/app/api/unitPriceStandardApi";
import type { OrderApiLineItem, OrderApiRecord, OrderDetailView, OrderItemView, OrderListRow } from "@/app/types/order";

const EMPTY_TEXT = "-";

type EnrichmentSource = {
  clients: ClientInfo[];
  items: ItemInfo[];
  unitPrices: UnitPriceStandardRecord[];
};

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

// Numeric fields are stored as strings in several APIs, sometimes with units.
// Normalizing them here keeps calculation logic predictable across pages.
export function parseNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (!hasText(value)) {
    return null;
  }

  const normalized = value.replace(/,/g, "").replace(/[^0-9.-]/g, "");
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatDate(value: string | undefined): string {
  if (!hasText(value)) {
    return EMPTY_TEXT;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toISOString().slice(0, 10);
}

export function formatNumber(value: number | null, digits = 0): string {
  if (value === null) {
    return EMPTY_TEXT;
  }

  return new Intl.NumberFormat("ko-KR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatFlexibleNumber(value: number | null): string {
  if (value === null) {
    return EMPTY_TEXT;
  }

  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

function getText(...values: Array<string | undefined>): string {
  const match = values.find(hasText);
  return match ?? EMPTY_TEXT;
}

function resolveClient(order: OrderApiRecord, clients: ClientInfo[]) {
  return clients.find(
    (client) =>
      client.거래처번호 === order.거래처번호 ||
      (hasText(client.거래처명) && hasText(order.거래처명) && client.거래처명 === order.거래처명),
  );
}

function resolveItem(lineItem: OrderApiLineItem, items: ItemInfo[]) {
  return items.find(
    (item) =>
      item.품번 === lineItem.품번 ||
      (hasText(item.품명) && hasText(lineItem.품명) && item.품명 === lineItem.품명),
  );
}

function buildPriceLookup(unitPrices: UnitPriceStandardRecord[]) {
  const exactMatch = new Map<string, number>();
  const itemOnly = new Map<string, number>();

  const sortedRows = [...unitPrices]
    .filter((row) => row.단가구분 !== "구매")
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
      const exactKey = `${clientNumber}::${itemCode}`;
      if (!exactMatch.has(exactKey)) {
        exactMatch.set(exactKey, price);
      }
    }

    if (!itemOnly.has(itemCode)) {
      itemOnly.set(itemCode, price);
    }
  }

  return { exactMatch, itemOnly };
}

function calculateSquareMeter(orderQuantityMeter: number | null, width: number | null, provided: number | null) {
  if (provided !== null) {
    return provided;
  }

  if (orderQuantityMeter === null || width === null) {
    return null;
  }

  return Number(((orderQuantityMeter * width) / 1000).toFixed(2));
}

function calculateWeight(squareMeter: number | null, gsm: number | null, provided: number | null) {
  if (squareMeter !== null && gsm !== null) {
    return Math.round(squareMeter * gsm);
  }

  return provided;
}

function calculateEa(orderQuantityMeter: number | null, length: number | null, provided: number | null) {
  if (orderQuantityMeter !== null && length !== null && length > 0) {
    return Math.floor(orderQuantityMeter / length);
  }

  return provided;
}

function calculateAmount(squareMeter: number | null, unitPrice: number | null, provided: number | null) {
  if (squareMeter !== null && unitPrice !== null) {
    return Math.round(squareMeter * unitPrice);
  }

  return provided;
}

function buildFallbackOrderNumber(order: OrderApiRecord, orderIndex: number) {
  const dateText = formatDate(order.수주일자 ?? order.등록일시);

  if (dateText !== EMPTY_TEXT) {
    const compactDate = dateText.slice(0, 7).replace(/-/g, "");
    return `SO-${compactDate}-${String(orderIndex + 1).padStart(3, "0")}`;
  }

  return `SO-UNKNOWN-${String(orderIndex + 1).padStart(3, "0")}`;
}

function buildOrderItems(order: OrderApiRecord, orderIndex: number, source: EnrichmentSource): OrderItemView[] {
  const client = resolveClient(order, source.clients);
  const priceLookup = buildPriceLookup(source.unitPrices);
  const lineItems = order.수주품목 && order.수주품목.length > 0 ? order.수주품목 : [{}];

  return lineItems.map((lineItem, lineIndex) => {
    const item = resolveItem(lineItem, source.items);
    const clientNumber = getText(order.거래처번호, client?.거래처번호);
    const itemCode = getText(lineItem.품번, item?.품번);
    const orderQuantityMeter = parseNumber(lineItem.수주량m);
    const width = parseNumber(lineItem.폭) ?? parseNumber(item?.폭);
    const length = parseNumber(lineItem.길이) ?? parseNumber(item?.길이);
    const gsm = parseNumber(lineItem.평량) ?? parseNumber(item?.평량);
    const orderQuantitySquareMeter = calculateSquareMeter(orderQuantityMeter, width, parseNumber(lineItem.수주량m2));
    const unitPriceFromLookup =
      (clientNumber !== EMPTY_TEXT ? priceLookup.exactMatch.get(`${clientNumber}::${itemCode}`) : undefined) ??
      priceLookup.itemOnly.get(itemCode);
    const unitPrice = parseNumber(lineItem.단가) ?? unitPriceFromLookup ?? null;

    return {
      id: `${order.id ?? buildFallbackOrderNumber(order, orderIndex)}-${lineIndex + 1}`,
      itemCode,
      itemName: getText(lineItem.품명, item?.품명),
      gsm,
      width,
      length,
      orderQuantityMeter,
      orderQuantityEa: calculateEa(orderQuantityMeter, length, parseNumber(lineItem.수주량EA)),
      orderQuantitySquareMeter,
      weightGram: calculateWeight(orderQuantitySquareMeter, gsm, parseNumber(lineItem.중량)),
      unitPrice,
      amountWon: calculateAmount(orderQuantitySquareMeter, unitPrice, parseNumber(lineItem.금액)),
    };
  });
}

export function buildOrderListRows({
  orders,
  clients,
  items,
  unitPrices,
}: {
  orders: OrderApiRecord[];
  clients: ClientInfo[];
  items: ItemInfo[];
  unitPrices: UnitPriceStandardRecord[];
}): OrderListRow[] {
  const source = { clients, items, unitPrices };

  return orders
    .flatMap((order, orderIndex) => {
      const client = resolveClient(order, clients);
      const orderNumber = getText(order.수주번호) !== EMPTY_TEXT
        ? getText(order.수주번호)
        : buildFallbackOrderNumber(order, orderIndex);

      return buildOrderItems(order, orderIndex, source).map((itemRow) => ({
        ...itemRow,
        orderId: order.id ?? orderNumber,
        orderNumber,
        orderDate: formatDate(order.수주일자 ?? order.등록일시),
        clientName: getText(order.거래처명, client?.거래처명),
        clientNumber: getText(order.거래처번호, client?.거래처번호),
        deliveryRequestDate: formatDate(order.납품요청일),
        deliveryPlace: getText(order.납품장소),
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

// Detail views reuse the same enrichment and calculation path as the list page
// so numbers stay consistent between summary and detail screens.
export function buildOrderDetailView({
  order,
  clients,
  items,
  unitPrices,
}: {
  order: OrderApiRecord;
  clients: ClientInfo[];
  items: ItemInfo[];
  unitPrices: UnitPriceStandardRecord[];
}): OrderDetailView {
  const client = resolveClient(order, clients);
  const detailItems = buildOrderItems(order, 0, { clients, items, unitPrices });

  return {
    orderId: order.id ?? EMPTY_TEXT,
    orderNumber: getText(order.수주번호),
    orderDate: formatDate(order.수주일자 ?? order.등록일시),
    clientName: getText(order.거래처명, client?.거래처명),
    clientNumber: getText(order.거래처번호, client?.거래처번호),
    deliveryRequestDate: formatDate(order.납품요청일),
    deliveryPlace: getText(order.납품장소),
    note: getText(order.비고),
    items: detailItems,
  };
}
