import { projectId, publicAnonKey } from '/utils/supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/server`;

// 작업지시 목록 조회
export async function fetchWorkOrderList() {
  try {
    const response = await fetch(`${BASE_URL}/work-orders`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[WorkOrderApi] Failed to fetch work orders:', errorText);
      throw new Error(`Failed to fetch work orders: ${response.status}`);
    }

    const data = await response.json();
    console.log('[WorkOrderApi] Fetched work orders:', data);
    return data;
  } catch (error) {
    console.error('[WorkOrderApi] Error fetching work orders:', error);
    throw error;
  }
}

// 작업지시 등록
export async function createWorkOrder(workOrderData: any) {
  try {
    console.log('[WorkOrderApi] Creating work order:', workOrderData);
    
    const response = await fetch(`${BASE_URL}/work-orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workOrderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[WorkOrderApi] Failed to create work order:', errorText);
      throw new Error(`Failed to create work order: ${response.status}`);
    }

    const data = await response.json();
    console.log('[WorkOrderApi] Created work order:', data);
    return data;
  } catch (error) {
    console.error('[WorkOrderApi] Error creating work order:', error);
    throw error;
  }
}

// 작업지시 수정
export async function updateWorkOrder(id: string, workOrderData: any) {
  try {
    console.log('[WorkOrderApi] Updating work order:', id, workOrderData);
    
    const response = await fetch(`${BASE_URL}/work-orders/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workOrderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[WorkOrderApi] Failed to update work order:', errorText);
      throw new Error(`Failed to update work order: ${response.status}`);
    }

    const data = await response.json();
    console.log('[WorkOrderApi] Updated work order:', data);
    return data;
  } catch (error) {
    console.error('[WorkOrderApi] Error updating work order:', error);
    throw error;
  }
}

// 작업지시 삭제
export async function deleteWorkOrder(id: string) {
  try {
    console.log('[WorkOrderApi] Deleting work order:', id);
    
    const response = await fetch(`${BASE_URL}/work-orders/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[WorkOrderApi] Failed to delete work order:', errorText);
      throw new Error(`Failed to delete work order: ${response.status}`);
    }

    const data = await response.json();
    console.log('[WorkOrderApi] Deleted work order:', data);
    return data;
  } catch (error) {
    console.error('[WorkOrderApi] Error deleting work order:', error);
    throw error;
  }
}
