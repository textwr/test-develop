import { projectId, publicAnonKey } from "@/app/config/supabase";

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/server`;

export interface WorkStandardItem {
  작업표준번호: string;
  품번: string;
  품명: string;
  공정명: string;
  설비명: string;
  비고: string;
  작업조건?: WorkConditionItem[];
  개정이력?: RevisionHistoryItem[];
  이미지?: string;
}

export interface WorkConditionItem {
  작업조건항목: string;
  작업조건기준: string;
  점검방법: string;
  점검주기: string;
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

// 작업표준서 목록 조회
export async function fetchWorkStandardList() {
  try {
    const response = await fetch(`${BASE_URL}/work-standard`, {
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
    console.error("Error fetching work standard list:", error);
    throw error;
  }
}

// 작업표준서 단일 조회
export async function fetchWorkStandardById(id: string) {
  try {
    const response = await fetch(`${BASE_URL}/work-standard/${id}`, {
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
    console.error("Error fetching work standard by id:", error);
    throw error;
  }
}

// 작업표준서 등록
export async function createWorkStandard(item: WorkStandardItem) {
  try {
    const response = await fetch(`${BASE_URL}/work-standard`, {
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
    console.error("Error creating work standard:", error);
    throw error;
  }
}

// 작업표준서 수정
export async function updateWorkStandard(id: string, item: WorkStandardItem) {
  try {
    const response = await fetch(`${BASE_URL}/work-standard/${id}`, {
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
    console.error("Error updating work standard:", error);
    throw error;
  }
}

// 작업표준서 삭제
export async function deleteWorkStandard(id: string) {
  try {
    const response = await fetch(`${BASE_URL}/work-standard/${id}`, {
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
    console.error("Error deleting work standard:", error);
    throw error;
  }
}


