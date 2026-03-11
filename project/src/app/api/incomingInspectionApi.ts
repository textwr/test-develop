import { projectId, publicAnonKey } from "@/app/config/supabase";

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/server`;

export interface IncomingInspectionItem {
  id?: string;
  입고검사표준번호: string;
  품번: string;
  품명: string;
  계정구분: string;
  비고: string;
  입고검사표준?: InspectionStandardItem[];
  개정이력?: RevisionHistoryItem[];
  이미지?: string;
}

export interface InspectionStandardItem {
  "No.": string;
  검사항목: string;
  검사기준: string;
  측정구분: string;
  검사방법: string;
  검사주기: string;
  시료수: string;
  기준치: string;
  상한치: string;
  하한치: string;
  비고: string;
}

export interface RevisionHistoryItem {
  개정번호: string;
  개정일자: string;
  개정내용: string;
  등록자: string;
  비고: string;
}

// 입고검사 목록 조회
export async function fetchIncomingInspectionList() {
  try {
    const response = await fetch(`${BASE_URL}/incoming-inspection`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${publicAnonKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Error fetching incoming inspection list:", error);
    throw error;
  }
}

// 입고검사 단일 조회
export async function fetchIncomingInspectionById(id: string) {
  try {
    const response = await fetch(`${BASE_URL}/incoming-inspection/${id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${publicAnonKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching incoming inspection by id:", error);
    throw error;
  }
}

// 입고검사 등록
export async function createIncomingInspection(item: IncomingInspectionItem) {
  try {
    const response = await fetch(`${BASE_URL}/incoming-inspection`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${publicAnonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to create: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error creating incoming inspection:", error);
    throw error;
  }
}

// 입고검사 수정
export async function updateIncomingInspection(id: string, item: IncomingInspectionItem) {
  try {
    const response = await fetch(`${BASE_URL}/incoming-inspection/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${publicAnonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to update: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error updating incoming inspection:", error);
    throw error;
  }
}

// 입고검사 삭제
export async function deleteIncomingInspection(id: string) {
  try {
    const response = await fetch(`${BASE_URL}/incoming-inspection/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${publicAnonKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to delete: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("Error deleting incoming inspection:", error);
    throw error;
  }
}

// ✅ 입고검사 결과 목록 조회
export async function fetchIncomingInspectionResults() {
  try {
    const response = await fetch(`${BASE_URL}/incoming-inspection-result`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${publicAnonKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Error fetching incoming inspection results:", error);
    throw error;
  }
}

