import { projectId, publicAnonKey } from "@/app/config/supabase";

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/server`;

// 출하계획 목록 조회
export async function fetchShippingPlanList() {
  const response = await fetch(`${BASE_URL}/shipping-plan`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch shipping plan list');
  }

  return await response.json();
}

// 출하계획 단일 조회
export async function fetchShippingPlanById(id: string) {
  const response = await fetch(`${BASE_URL}/shipping-plan/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch shipping plan');
  }

  return await response.json();
}

// 출하계획 등록
export async function createShippingPlan(data: any) {
  const response = await fetch(`${BASE_URL}/shipping-plan`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create shipping plan');
  }

  return await response.json();
}

// 출하계획 수정
export async function updateShippingPlan(id: string, data: any) {
  const response = await fetch(`${BASE_URL}/shipping-plan/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update shipping plan');
  }

  return await response.json();
}

// 출하계획 삭제
export async function deleteShippingPlan(id: string) {
  const response = await fetch(`${BASE_URL}/shipping-plan/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete shipping plan');
  }

  return await response.json();
}


