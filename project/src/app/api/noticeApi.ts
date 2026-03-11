import { projectId, publicAnonKey } from "@/app/config/supabase";

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/server/api/v1`;

export interface NoticeData {
  id?: string;
  제목: string;
  내용: string;
  등록일자: string;
  상태: string;
}

// 공지사항 목록 조회
export async function getNotices(searchParams?: { 제목?: string; 내용?: string }): Promise<NoticeData[]> {
  try {
    const params = new URLSearchParams();
    if (searchParams?.제목) params.append("제목", searchParams.제목);
    if (searchParams?.내용) params.append("내용", searchParams.내용);
    
    const url = `${API_BASE_URL}/notices${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${publicAnonKey}`,
      },
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch notices");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching notices:", error);
    throw error;
  }
}

// 공지사항 상세 조회
export async function getNoticeById(id: string): Promise<NoticeData> {
  try {
    const response = await fetch(`${API_BASE_URL}/notices/${id}`, {
      headers: {
        Authorization: `Bearer ${publicAnonKey}`,
      },
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch notice");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching notice:", error);
    throw error;
  }
}

// 공지사항 등록
export async function createNotice(data: Omit<NoticeData, "id">): Promise<NoticeData> {
  try {
    const response = await fetch(`${API_BASE_URL}/notices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error("Failed to create notice");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error creating notice:", error);
    throw error;
  }
}

// 공지사항 수정
export async function updateNotice(id: string, data: Omit<NoticeData, "id">): Promise<NoticeData> {
  try {
    const response = await fetch(`${API_BASE_URL}/notices/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error("Failed to update notice");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error updating notice:", error);
    throw error;
  }
}

// 공지사항 삭제
export async function deleteNotice(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/notices/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${publicAnonKey}`,
      },
    });
    
    if (!response.ok) {
      throw new Error("Failed to delete notice");
    }
  } catch (error) {
    console.error("Error deleting notice:", error);
    throw error;
  }
}

