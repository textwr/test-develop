import { projectId, publicAnonKey } from "@/app/config/supabase";

const API_BASE = `https://${projectId}.supabase.co/functions/v1/server`;

// 재고조정 목록 조회
export async function fetchInventoryAdjustmentList() {
  try {
    const response = await fetch(`${API_BASE}/inventory-adjustment`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch inventory adjustment list: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching inventory adjustment list:', error);
    throw error;
  }
}

// 재고조정 상세 조회
export async function fetchInventoryAdjustmentById(id: string) {
  try {
    const response = await fetch(`${API_BASE}/inventory-adjustment/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch inventory adjustment: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching inventory adjustment:', error);
    throw error;
  }
}

// 재고조정 등록
export async function createInventoryAdjustment(data: any) {
  try {
    const response = await fetch(`${API_BASE}/inventory-adjustment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create inventory adjustment: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating inventory adjustment:', error);
    throw error;
  }
}

// 재고조정 수정
export async function updateInventoryAdjustment(id: string, data: any) {
  try {
    const response = await fetch(`${API_BASE}/inventory-adjustment/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update inventory adjustment: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating inventory adjustment:', error);
    throw error;
  }
}

// 재고조정 삭제
export async function deleteInventoryAdjustment(id: string) {
  try {
    const response = await fetch(`${API_BASE}/inventory-adjustment/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete inventory adjustment: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting inventory adjustment:', error);
    throw error;
  }
}


