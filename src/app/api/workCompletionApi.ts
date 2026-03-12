import { projectId, publicAnonKey } from "@/app/config/supabase";

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/server`;

export interface WorkCompletionData {
  id?: string;
  작업자명?: string;
  등록일시?: string;
  수정일시?: string;
  
  // 생산현황
  생산현황: {
    제품구분: string;
    라인구분: string;
    작업일: string;
    품번: string;
    품명: string;
    지시량: string;
    생산량: string;
    LOT번호: string;
    제품보관위치: string;
  };
  
  // 가동현황
  가동현황: {
    지시량: string;
    생산량: string;
    가동시간: string;
    비가동시간: string;
    계획정지: string;
    기계고장: string;
    전기문제: string;
    니들문제: string;
    원료문제: string;
    온도문제: string;
    교육청소: string;
  };
  
  // 품질현황
  품질현황: {
    생산량: string;
    검사수량: string;
    양품수량: string;
    불량수량: string;
    불량률: string;
    외관불량: string;
    치수불량: string;
  };
}

// 작업완료 목록 조회
export async function fetchWorkCompletionList(): Promise<WorkCompletionData[]> {
  try {
    const response = await fetch(`${BASE_URL}/work-completion`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${publicAnonKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to fetch: ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Error fetching work completion list:", error);
    throw error;
  }
}

// 작업완료 단일 조회
export async function fetchWorkCompletionById(id: string): Promise<WorkCompletionData> {
  try {
    const response = await fetch(`${BASE_URL}/work-completion/${id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${publicAnonKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to fetch: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching work completion by id:", error);
    throw error;
  }
}

// 작업완료 등록 (작업자 화면)
export async function createWorkCompletion(data: WorkCompletionData): Promise<WorkCompletionData> {
  try {
    const response = await fetch(`${BASE_URL}/work-completion`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${publicAnonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to create: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error creating work completion:", error);
    throw error;
  }
}

// 작업완료 수정
export async function updateWorkCompletion(id: string, data: Partial<WorkCompletionData>): Promise<WorkCompletionData> {
  try {
    const response = await fetch(`${BASE_URL}/work-completion/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${publicAnonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to update: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error updating work completion:", error);
    throw error;
  }
}

// 작업완료 삭제
export async function deleteWorkCompletion(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/work-completion/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${publicAnonKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to delete: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("Error deleting work completion:", error);
    throw error;
  }
}

// 날짜별 조회
export async function fetchWorkCompletionByDate(date: string): Promise<WorkCompletionData[]> {
  try {
    const response = await fetch(`${BASE_URL}/work-completion/by-date/${date}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${publicAnonKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to fetch: ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Error fetching work completion by date:", error);
    throw error;
  }
}

// 라인별 조회
export async function fetchWorkCompletionByLine(line: string): Promise<WorkCompletionData[]> {
  try {
    const response = await fetch(`${BASE_URL}/work-completion/by-line/${line}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${publicAnonKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to fetch: ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Error fetching work completion by line:", error);
    throw error;
  }
}


