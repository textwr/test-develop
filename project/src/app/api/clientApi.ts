import { projectId, publicAnonKey } from "/utils/supabase/info";

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
  try {
    const response = await fetch(`${API_URL}/clients`, {
      headers: {
        Authorization: `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch client list: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as ClientInfo[];
    console.log("[clientApi] Received client list:", data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("[clientApi] Error fetching client list:", error);
    throw error;
  }
}

export async function fetchClientById(id: string): Promise<ClientInfo> {
  const response = await fetch(`${API_URL}/clients/${id}`, {
    headers: {
      Authorization: `Bearer ${publicAnonKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch client: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as ClientInfo;
  console.log("[clientApi] Received client detail:", data);
  return data;
}

export async function createClient(data: ClientInfo): Promise<ClientInfo> {
  const response = await fetch(`${API_URL}/clients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create client: ${response.status} ${response.statusText}`);
  }

  const result = (await response.json()) as ClientInfo;
  console.log("[clientApi] Created client:", result);
  return result;
}

export async function updateClient(id: string, data: ClientInfo): Promise<ClientInfo> {
  const response = await fetch(`${API_URL}/clients/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update client: ${response.status} ${response.statusText}`);
  }

  const result = (await response.json()) as ClientInfo;
  console.log("[clientApi] Updated client:", result);
  return result;
}

export async function deleteClient(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/clients/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${publicAnonKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete client: ${response.status} ${response.statusText}`);
  }

  console.log("[clientApi] Deleted client:", { id });
}
