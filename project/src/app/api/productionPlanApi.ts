import { projectId, publicAnonKey } from '../../../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/server`;

export interface ProductionPlanItem {
  id?: string;
  라인구분: string;
  생산계획일: string;
  품번: string;
  품명: string;
  평량: string;
  폭: string;
  길이: string;
  재고량m: string;
  계획량m: string;
  관리중량: string;
  생산속도: string;
  예상소요시간: string;
  비고: string;
  등록일시?: string;
}

export async function fetchProductionPlanList(): Promise<ProductionPlanItem[]> {
  const response = await fetch(`${API_URL}/production-plans`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch production plan list');
  }
  
  return response.json();
}

export async function fetchProductionPlanById(id: string): Promise<ProductionPlanItem> {
  const response = await fetch(`${API_URL}/production-plans/${id}`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch production plan');
  }
  
  return response.json();
}

export async function createProductionPlan(data: ProductionPlanItem): Promise<ProductionPlanItem> {
  const response = await fetch(`${API_URL}/production-plans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create production plan: ${errorText}`);
  }
  
  return response.json();
}

export async function updateProductionPlan(id: string, data: ProductionPlanItem): Promise<ProductionPlanItem> {
  const response = await fetch(`${API_URL}/production-plans/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update production plan');
  }
  
  return response.json();
}

export async function deleteProductionPlan(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/production-plans/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete production plan');
  }
}
