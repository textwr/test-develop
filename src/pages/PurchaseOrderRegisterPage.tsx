import type { NotificationItem } from "@/app/components/common/NotificationCenter";
import { PurchaseOrderForm } from "@/app/components/purchase/PurchaseOrderForm";

type PurchaseOrderRegisterPageProps = {
  onBack: () => void;
  onComplete: (notification: Omit<NotificationItem, "id">) => void;
};

// 등록 페이지는 공통 발주 폼을 생성 모드로 감싸
// 목록 화면에서 넘어온 사용 흐름만 단순하게 연결한다.
export function PurchaseOrderRegisterPage({ onBack, onComplete }: PurchaseOrderRegisterPageProps) {
  return (
    <PurchaseOrderForm
      mode="create"
      onBack={onBack}
      onComplete={onComplete}
    />
  );
}
