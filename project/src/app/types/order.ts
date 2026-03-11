// Types in this file represent the order API contract and the flat row model
// that the reusable table component consumes on the page.
export type OrderApiLineItem = {
  품번?: string;
  품명?: string;
  평량?: string;
  폭?: string;
  길이?: string;
  단가?: string;
  금액?: string;
  중량?: string;
  수주량m?: string;
  수주량EA?: string;
  수주량m2?: string;
};

export type OrderApiRecord = {
  id?: string;
  거래처번호?: string;
  거래처명?: string;
  수주번호?: string;
  수주일자?: string;
  수주품목?: OrderApiLineItem[];
  납품요청일?: string;
  납품장소?: string;
  비고?: string;
  등록일시?: string;
  수정일시?: string;
};

export type OrderTableRow = {
  id: string;
  orderId: string;
  orderNumber: string;
  orderDate: string;
  clientName: string;
  clientNumber: string;
  itemCode: string;
  itemName: string;
  gsm: number | null;
  width: number | null;
  length: number | null;
  orderQuantityMeter: number | null;
  orderQuantityEa: number | null;
  orderQuantitySquareMeter: number | null;
  weightGram: number | null;
  unitPrice: number | null;
  amountWon: number | null;
  deliveryRequestDate: string;
  deliveryPlace: string;
  note: string;
};
