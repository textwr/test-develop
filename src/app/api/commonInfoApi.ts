import { projectId, publicAnonKey } from "@/app/config/supabase";

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/server`;

interface CommonInfoItem {
  항목코드: string;
  항목: string;
  세부항목코드: string;
  세부항목: string;
  등록일자: string;
  세부항목내용목록: string[];
  사용여부: string;
}

// 공통정보 목록 조회
export async function fetchCommonInfoList() {
  try {
    const response = await fetch(`${BASE_URL}/common-info`, {
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
    console.error("Error fetching common info list:", error);
    throw error;
  }
}

// 공통정보 단일 조회
export async function fetchCommonInfoById(id: string) {
  try {
    const response = await fetch(`${BASE_URL}/common-info/${id}`, {
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
    console.error("Error fetching common info by id:", error);
    throw error;
  }
}

// 공통정보 등록 (여러 개)
export async function createCommonInfo(items: CommonInfoItem[]) {
  try {
    const response = await fetch(`${BASE_URL}/common-info`, {
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
    console.error("Error creating common info:", error);
    throw error;
  }
}

// 공통정보 수정
export async function updateCommonInfo(id: string, item: CommonInfoItem) {
  try {
    const response = await fetch(`${BASE_URL}/common-info/${id}`, {
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
    console.error("Error updating common info:", error);
    throw error;
  }
}

// 공통정보 삭제
export async function deleteCommonInfo(id: string) {
  try {
    const response = await fetch(`${BASE_URL}/common-info/${id}`, {
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
    console.error("Error deleting common info:", error);
    throw error;
  }
}

// 특정 항목의 세부내용 목록 조회 (드롭다운용)
export async function fetchDetailContentsByItemName(itemName: string): Promise<string[]> {
  try {
    const allData = await fetchCommonInfoList();
    
    console.log("=== 공통정보 전체 데이터 ===", allData);
    console.log("=== 찾는 항목명 ===", itemName);
    
    // 항목명이 일치하고 사용유무가 "사용"인 데이터 필터링
    const matchedItems = allData.filter(
      (item: any) => {
        console.log(`항목: ${item.항목}, 사용유무: ${item.사용유무}, 일치여부: ${item.항목 === itemName && item.사용유무 === "사용"}`);
        return item.항목 === itemName && item.사용유무 === "사용";
      }
    );
    
    console.log("=== 필터링된 항목들 ===", matchedItems);
    
    // 모든 세부내용을 하나의 배열로 합치기
    const allDetailContents: string[] = [];
    matchedItems.forEach((item: any) => {
      console.log(`세부내용 배열:`, item.세부내용);
      if (item.세부내용 && Array.isArray(item.세부내용)) {
        allDetailContents.push(...item.세부내용);
      }
    });
    
    console.log("=== 최종 세부내용 목록 ===", allDetailContents);
    
    // 중복 제거
    const uniqueContents = [...new Set(allDetailContents)];
    console.log("=== 중복 제거 후 ===", uniqueContents);
    
    return uniqueContents;
  } catch (error) {
    console.error(`Error fetching detail contents for ${itemName}:`, error);
    return [];
  }
}

