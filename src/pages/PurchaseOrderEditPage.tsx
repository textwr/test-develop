import type { NotificationItem } from "@/app/components/common/NotificationCenter";
import { PurchaseOrderForm } from "@/app/components/purchase/PurchaseOrderForm";

type PurchaseOrderEditPageProps = {
  orderNumber: string;
  onBack: () => void;
  onComplete: (notification: Omit<NotificationItem, "id">) => void;
};

// 수정 페이지는 공통 발주 폼을 수정 모드로 감싸
// 상세에서 선택한 발주번호를 기준으로 같은 데이터를 다시 불러오게 한다.
export function PurchaseOrderEditPage({ onBack, onComplete, orderNumber }: PurchaseOrderEditPageProps) {
  return (
    <PurchaseOrderForm
      mode="edit"
      onBack={onBack}
      onComplete={onComplete}
      orderNumber={orderNumber}
    />
  );
}
