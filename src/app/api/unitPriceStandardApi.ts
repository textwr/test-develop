import { projectId, publicAnonKey } from "@/app/config/supabase";

const API_URL = `https://${projectId}.supabase.co/functions/v1/server`;

export interface UnitPriceStandardRecord {
  id?: string;
  거래처번호?: string;
  거래처명?: string;
  품번?: string;
  품명?: string;
  단가?: string;
  단위?: string;
  단가구분?: string;
  적용유무?: string;
  변경일자?: string;
  적용일자?: string;
  생성일시?: string;
  수정일시?: string;
  RevNo?: number;
  개정번호?: number;
  비고?: string;
}

export async function fetchUnitPriceStandardList(): Promise<UnitPriceStandardRecord[]> {
  const response = await fetch(`${API_URL}/unit-price-standard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${publicAnonKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch unit price standard list: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as UnitPriceStandardRecord[];
  return Array.isArray(data) ? data : [];
}


