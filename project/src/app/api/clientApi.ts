import { projectId, publicAnonKey } from "@/app/config/supabase";

const API_URL = `https://${projectId}.supabase.co/functions/v1/server`;

export interface ClientInfo {
  id?: string;
  거래처번호?: string;
  거래처명?: string;
  대표자명?: string;
  사업자번호?: string;
  거래처구분?: string;
  계정구분?: string;
  등록일자?: string;
  결제조건?: string;
  담당자명?: string;
  전화번호?: string;
  이메일?: string;
  팩스번호?: string;
  주소?: string;
  비고?: string;
  등록일시?: string;
}

export async function fetchClientList(): Promise<ClientInfo[]> {
  const response = await fetch(`${API_URL}/clients`, {
    headers: {
      Authorization: `Bearer ${publicAnonKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch client list: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as ClientInfo[];
  return Array.isArray(data) ? data : [];
}


