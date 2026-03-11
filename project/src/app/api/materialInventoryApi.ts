import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/server`;

export interface MaterialInventoryItem {
  id?: string;
  계정구분: string;
  거래처명: string;
  거래처번호: string;
  품번: string;
  품명: string;
  색상: string;
  폭: string;
  중량: string;
  적정재고량: string;
  현재재고: string;
  보관위치: string;
  최근입고일: string;
  비고: string;
  등록일시?: string;
}

// 자재재고 목록 조회
export async function fetchMaterialInventoryList(): Promise<MaterialInventoryItem[]> {
  const response = await fetch(`${API_URL}/material-inventory`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch material inventory list');
  }
  
  return response.json();
}

// 자재재고 단일 조회
export async function fetchMaterialInventoryById(id: string): Promise<MaterialInventoryItem> {
  const response = await fetch(`${API_URL}/material-inventory/${id}`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch material inventory');
  }
  
  return response.json();
}

// 자재재고 등록
export async function createMaterialInventory(data: MaterialInventoryItem): Promise<MaterialInventoryItem> {
  const response = await fetch(`${API_URL}/material-inventory`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create material inventory');
  }
  
  return response.json();
}

// 자재재고 수정
export async function updateMaterialInventory(id: string, data: MaterialInventoryItem): Promise<MaterialInventoryItem> {
  const response = await fetch(`${API_URL}/material-inventory/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update material inventory');
  }
  
  return response.json();
}

// 자재재고 삭제
export async function deleteMaterialInventory(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/material-inventory/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete material inventory');
  }
}
