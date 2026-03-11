import { projectId, publicAnonKey } from "/utils/supabase/info";

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/server`;

interface EmployeeItem {
  직원번호: string;
  직원명: string;
  부서명: string;
  직종: string;
  직급: string;
  연락처: string;
  입사일: string;
  퇴사일: string;
  주소: string;
  상세주소: string;
  국적: string;
  성별: string;
  비고: string;
}

// 직원정보 목록 조회
export async function fetchEmployeeList() {
  try {
    const response = await fetch(`${BASE_URL}/employee`, {
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
    console.error("Error fetching employee list:", error);
    throw error;
  }
}

// 직원정보 단일 조회
export async function fetchEmployeeById(id: string) {
  try {
    const response = await fetch(`${BASE_URL}/employee/${id}`, {
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
    console.error("Error fetching employee by id:", error);
    throw error;
  }
}

// 직원정보 등록 (여러 명)
export async function createEmployee(items: EmployeeItem[]) {
  try {
    const response = await fetch(`${BASE_URL}/employee`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${publicAnonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to create: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error creating employee:", error);
    throw error;
  }
}

// 직원정보 수정
export async function updateEmployee(id: string, item: EmployeeItem) {
  try {
    const response = await fetch(`${BASE_URL}/employee/${id}`, {
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
    console.error("Error updating employee:", error);
    throw error;
  }
}

// 직원정보 삭제
export async function deleteEmployee(id: string) {
  try {
    const response = await fetch(`${BASE_URL}/employee/${id}`, {
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
    console.error("Error deleting employee:", error);
    throw error;
  }
}
