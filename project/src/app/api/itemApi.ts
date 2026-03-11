import { projectId, publicAnonKey } from "@/app/config/supabase";

const API_URL = `https://${projectId}.supabase.co/functions/v1/server`;

export interface ItemInfo {
  id?: string;
  제품구분?: string;
  거래처명?: string;
  품번?: string;
  품명?: string;
  계정구분?: string;
  규격?: string;
  평량?: string;
  폭?: string;
  색상?: string;
  중량?: string;
  길이?: string;
  생산속도?: string;
  폭단위?: string;
  수입검사유무?: string;
  포장단위?: string;
  적정재고량?: string;
  보관위치?: string;
  비고?: string;
  등록일시?: string;
  수정일시?: string;
}

export async function fetchItemList(): Promise<ItemInfo[]> {
  const response = await fetch(`${API_URL}/items`, {
    headers: {
      Authorization: `Bearer ${publicAnonKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch item list: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as ItemInfo[];
  console.log("[itemApi] Received item list:", data);
  return Array.isArray(data) ? data : [];
}


