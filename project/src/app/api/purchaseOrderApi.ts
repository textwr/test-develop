import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/server`;

// 발주 생성
export async function createPurchaseOrder(data: any) {
  try {
    const response = await fetch(`${API_URL}/purchase-orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`발주 생성 실패: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating purchase order:', error);
    throw error;
  }
}

// 발주 목록 조회
export async function fetchPurchaseOrderList() {
  try {
    const response = await fetch(`${API_URL}/purchase-orders`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`발주 목록 조회 실패: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching purchase order list:', error);
    throw error;
  }
}

// 발주 상세 조회 (ID로)
export async function fetchPurchaseOrderById(id: string) {
  try {
    const response = await fetch(`${API_URL}/purchase-order/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch purchase order: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching purchase order:", error);
    throw error;
  }
}

// 발주 상세 조회 (발주번호로)
export async function fetchPurchaseOrderByNumber(orderNumber: string) {
  try {
    const response = await fetch(`${API_URL}/purchase-order/number/${encodeURIComponent(orderNumber)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch purchase order: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching purchase order by number:", error);
    throw error;
  }
}

// 발주 수정 (발주번호로)
export async function updatePurchaseOrderByNumber(orderNumber: string, data: any) {
  try {
    const response = await fetch(`${API_URL}/purchase-order/number/${encodeURIComponent(orderNumber)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`발주 수정 실패: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating purchase order:', error);
    throw error;
  }
}

// 발주 삭제
export async function deletePurchaseOrder(id: string) {
  try {
    const response = await fetch(`${API_URL}/purchase-orders/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`발주 삭제 실패: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting purchase order:', error);
    throw error;
  }
}

// 발주번호 생성
export async function generatePurchaseOrderNumber() {
  try {
    const response = await fetch(`${API_URL}/purchase-orders/generate-number`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`발주번호 생성 실패: ${response.status}`);
    }

    const result = await response.json();
    return result.발주번호;
  } catch (error) {
    console.error('Error generating purchase order number:', error);
    throw error;
  }
}

// 파일 업로드
export async function uploadFile(file: File, type: 'material-cert' | 'transaction-statement') {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${API_URL}/purchase-orders/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`파일 업로드 실패: ${response.status}`);
    }

    const result = await response.json();
    return result.fileUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

// 파일 다운로드
export async function downloadFile(fileId: string) {
  try {
    const response = await fetch(`${API_URL}/purchase-orders/files/${fileId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`파일 다운로드 실패: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
}