import { projectId, publicAnonKey } from "@/app/config/supabase";

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/server`;

// 제품재고 목록 조회
export async function fetchProductInventoryList() {
  const response = await fetch(`${BASE_URL}/product-inventory`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch product inventory list');
  }

  return await response.json();
}

// 제품재고 단일 조회
export async function fetchProductInventoryById(id: string) {
  const response = await fetch(`${BASE_URL}/product-inventory/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch product inventory');
  }

  return await response.json();
}

// 제품재고 등록
export async function createProductInventory(data: any) {
  const response = await fetch(`${BASE_URL}/product-inventory`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create product inventory');
  }

  return await response.json();
}

// 제품재고 수정
export async function updateProductInventory(id: string, data: any) {
  const response = await fetch(`${BASE_URL}/product-inventory/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update product inventory');
  }

  return await response.json();
}

// 제품재고 삭제
export async function deleteProductInventory(id: string) {
  const response = await fetch(`${BASE_URL}/product-inventory/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete product inventory');
  }

  return await response.json();
}


