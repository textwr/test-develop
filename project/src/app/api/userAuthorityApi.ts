import { projectId, publicAnonKey } from "@/app/config/supabase";

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/server`;

// 사용권한 목록 조회
export async function fetchUserAuthorityList() {
  try {
    const response = await fetch(`${BASE_URL}/user-authority`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user authority list: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Error fetching user authority list:", error);
    throw error;
  }
}

// 사용권한 등록
export async function createUserAuthority(userAuthority: any) {
  try {
    const response = await fetch(`${BASE_URL}/user-authority`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(userAuthority),
    });

    if (!response.ok) {
      throw new Error(`Failed to create user authority: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating user authority:", error);
    throw error;
  }
}

// 사용권한 수정
export async function updateUserAuthority(id: string, userAuthority: any) {
  try {
    const response = await fetch(`${BASE_URL}/user-authority/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(userAuthority),
    });

    if (!response.ok) {
      throw new Error(`Failed to update user authority: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating user authority:", error);
    throw error;
  }
}

// 사용권한 삭제
export async function deleteUserAuthority(id: string) {
  try {
    const response = await fetch(`${BASE_URL}/user-authority/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete user authority: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Error deleting user authority:", error);
    throw error;
  }
}

// 특정 사용권한 조회
export async function fetchUserAuthorityById(id: string) {
  try {
    const response = await fetch(`${BASE_URL}/user-authority/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user authority: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user authority:", error);
    throw error;
  }
}

