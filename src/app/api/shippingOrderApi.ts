import { projectId, publicAnonKey } from "@/app/config/supabase";

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/server`;

// 출하지시 목록 조회
export async function fetchShippingOrderList() {
  const response = await fetch(`${BASE_URL}/shipping-order`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch shipping order list');
  }

  return await response.json();
}

// 출하지시 단일 조회
export async function fetchShippingOrderById(id: string) {
  const response = await fetch(`${BASE_URL}/shipping-order/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch shipping order');
  }

  return await response.json();
}

// 출하지시 등록 (여러 개)
export async function createShippingOrders(items: any[]) {
  const response = await fetch(`${BASE_URL}/shipping-order`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items }),
  });

  if (!response.ok) {
    throw new Error('Failed to create shipping orders');
  }

  return await response.json();
}

// 출하지시 수정
export async function updateShippingOrder(id: string, data: any) {
  const response = await fetch(`${BASE_URL}/shipping-order/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update shipping order');
  }

  return await response.json();
}

// 출하지시 삭제
export async function deleteShippingOrder(id: string) {
  const response = await fetch(`${BASE_URL}/shipping-order/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete shipping order');
  }

  return await response.json();
}


