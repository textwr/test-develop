import { projectId, publicAnonKey } from "@/app/config/supabase";

const API_URL = `https://${projectId}.supabase.co/functions/v1/server`;

export interface PreReceivingItem {
  id?: string;
  발주번호: string;
  계정구분: string;
  품번: string;
  품명: string;
  규격: string;
  단위: string;
  거래처명: string;
  거래처번호: string;
  발주일자: string;
  입고요청일: string;
  발주수량: string;
  가입고수량: string;
  입고검사수량: string;
  가입고일자: string;
  입고검사날짜: string;
  스티커부착: string;
  등록일시?: string;
}

// 가입고정보 목록 조회
export async function fetchPreReceivingList(): Promise<PreReceivingItem[]> {
  const response = await fetch(`${API_URL}/pre-receiving`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch pre-receiving list');
  }
  
  return response.json();
}

// 가입고정보 단일 조회
export async function fetchPreReceivingById(id: string): Promise<PreReceivingItem> {
  const response = await fetch(`${API_URL}/pre-receiving/${id}`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch pre-receiving');
  }
  
  return response.json();
}

// 가입고정보 등록
export async function createPreReceiving(items: PreReceivingItem[]): Promise<PreReceivingItem[]> {
  const response = await fetch(`${API_URL}/pre-receiving`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify({ items }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create pre-receiving');
  }
  
  return response.json();
}

// 가입고정보 수정
export async function updatePreReceiving(id: string, data: PreReceivingItem): Promise<PreReceivingItem> {
  const response = await fetch(`${API_URL}/pre-receiving/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update pre-receiving');
  }
  
  return response.json();
}

// 가입고정보 삭제
export async function deletePreReceiving(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/pre-receiving/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete pre-receiving');
  }
}


