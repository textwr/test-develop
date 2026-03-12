// 발주 API 응답은 화면별로 일부 필드가 평탄화되어 내려올 수 있으므로
// 목록/상세/등록 화면에서 함께 사용할 수 있게 원본 필드와 화면 모델을 분리한다.
export type PurchaseOrderApiLineItem = {
  계정구분?: string;
  품번?: string;
  품명?: string;
  규격?: string;
  단위?: string;
  발주수량?: string;
  수량?: string;
  단가?: string;
  금액?: string;
};

export type PurchaseOrderCreateLineItem = PurchaseOrderApiLineItem;

export type PurchaseOrderDocumentPayload = {
  재료시험성적서?: string;
  거래명세서?: string;
};

export type PurchaseOrderApiRecord = {
  id?: string;
  거래처번호?: string;
  거래처명?: string;
  발주번호?: string;
  발주일자?: string;
  입고요청일?: string;
  결제조건?: string;
  비고?: string;
  발주품목?: PurchaseOrderApiLineItem[];
  재료시험성적서?: string;
  거래명세서?: string;
  제출서류?: PurchaseOrderDocumentPayload;
  등록일시?: string;
  수정일시?: string;
  계정구분?: string;
  품번?: string;
  품명?: string;
  규격?: string;
  단위?: string;
  발주수량?: string;
  수량?: string;
  단가?: string;
  금액?: string;
};

export type PurchaseOrderCreatePayload = {
  거래처번호: string;
  거래처명: string;
  발주번호: string;
  발주일자: string;
  발주품목: PurchaseOrderCreateLineItem[];
  입고요청일?: string;
  결제조건?: string;
  비고?: string;
  재료시험성적서?: string;
  거래명세서?: string;
};

export type PurchaseOrderItemView = {
  id: string;
  accountCategory: string;
  itemCode: string;
  itemName: string;
  spec: string;
  unit: string;
  quantity: number | null;
  unitPrice: number | null;
  amountWon: number | null;
};

export type PurchaseOrderListRow = PurchaseOrderItemView & {
  orderId: string;
  orderNumber: string;
  orderDate: string;
  clientName: string;
  clientNumber: string;
  incomingRequestDate: string;
  paymentCondition: string;
  note: string;
};

export type PurchaseOrderDocuments = {
  materialCertUrl: string;
  transactionStatementUrl: string;
};

export type PurchaseOrderDetailView = {
  orderId: string;
  orderNumber: string;
  orderDate: string;
  clientName: string;
  clientNumber: string;
  incomingRequestDate: string;
  paymentCondition: string;
  note: string;
  documents: PurchaseOrderDocuments;
  items: PurchaseOrderItemView[];
};

export type PurchaseOrderRegisterItem = PurchaseOrderItemView & {
  isSelected: boolean;
};
