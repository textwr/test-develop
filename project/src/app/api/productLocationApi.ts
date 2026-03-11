import { projectId, publicAnonKey } from "@/app/config/supabase";

const API_URL = `https://${projectId}.supabase.co/functions/v1/server`;

export interface ProductLocation {
  id?: string;
  품번: string;
  품명: string;
  평량: string;
  폭: string;
  길이: string;
  보관위치: string;
  비고: string;
  등록일시?: string;
}

// 제품보관위치 목록 조회
export async function fetchProductLocationList(): Promise<ProductLocation[]> {
  const response = await fetch(`${API_URL}/product-locations`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch product location list');
  }
  
  return response.json();
}

// 제품보관위치 단일 조회
export async function fetchProductLocationById(id: string): Promise<ProductLocation> {
  const response = await fetch(`${API_URL}/product-locations/${id}`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch product location');
  }
  
  return response.json();
}

// 제품보관위치 등록
export async function createProductLocation(data: ProductLocation): Promise<ProductLocation> {
  const response = await fetch(`${API_URL}/product-locations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create product location');
  }
  
  return response.json();
}

// 제품보관위치 수정
export async function updateProductLocation(id: string, data: ProductLocation): Promise<ProductLocation> {
  const response = await fetch(`${API_URL}/product-locations/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update product location');
  }
  
  return response.json();
}

// 제품보관위치 삭제
export async function deleteProductLocation(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/product-locations/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete product location');
  }
}

// 품번으로 제품보관위치 조회
export async function fetchProductLocationByItemCode(품번: string): Promise<ProductLocation | null> {
  const response = await fetch(`${API_URL}/product-locations/by-item-code/${encodeURIComponent(품번)}`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch product location by item code');
  }
  
  return response.json();
}


