import { projectId, publicAnonKey } from "@/app/config/supabase";
import type { OrderApiRecord, OrderCreatePayload } from "@/app/types/order";

const API_URL = `https://${projectId}.supabase.co/functions/v1/server`;

// 수주 요청 로그는 화면 단위가 아니라 orderApi 접두어로 통일해
// 같은 흐름의 요청을 한눈에 추적할 수 있게 맞춘다.
export async function fetchOrderList(): Promise<OrderApiRecord[]> {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch order list: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as OrderApiRecord[];
    return data;
  } catch (error) {
    console.error("[orderApi] Error fetching order list:", error);
    throw error;
  }
}

export async function fetchOrderById(id: string): Promise<OrderApiRecord> {
  try {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch order: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as OrderApiRecord;
    return data;
  } catch (error) {
    console.error("[orderApi] Error fetching order detail:", error);
    throw error;
  }
}

export async function createOrder(payload: OrderCreatePayload): Promise<OrderApiRecord | null> {
  try {
    console.log("[orderApi] 수주 등록 요청 데이터:", payload);

    const response = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to create order: ${response.status} ${response.statusText}`);
    }

    const rawText = await response.text();
    const data = rawText ? (JSON.parse(rawText) as OrderApiRecord) : null;
    console.log("[orderApi] 수주 등록 응답 데이터:", data);
    return data;
  } catch (error) {
    console.error("[orderApi] Error creating order:", error);
    throw error;
  }
}
