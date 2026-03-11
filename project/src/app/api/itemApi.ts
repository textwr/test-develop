import { projectId, publicAnonKey } from "/utils/supabase/info";

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

export async function fetchItemById(id: string): Promise<ItemInfo> {
  const response = await fetch(`${API_URL}/items/${id}`, {
    headers: {
      Authorization: `Bearer ${publicAnonKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch item: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as ItemInfo;
  console.log("[itemApi] Received item detail:", data);
  return data;
}

export async function createItem(data: ItemInfo): Promise<ItemInfo> {
  const response = await fetch(`${API_URL}/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create item: ${response.status} ${response.statusText}`);
  }

  const result = (await response.json()) as ItemInfo;
  console.log("[itemApi] Created item:", result);
  return result;
}

export async function updateItem(id: string, data: ItemInfo): Promise<ItemInfo> {
  const response = await fetch(`${API_URL}/items/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update item: ${response.status} ${response.statusText}`);
  }

  const result = (await response.json()) as ItemInfo;
  console.log("[itemApi] Updated item:", result);
  return result;
}

export async function deleteItem(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/items/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${publicAnonKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete item: ${response.status} ${response.statusText}`);
  }

  console.log("[itemApi] Deleted item:", { id });
}
