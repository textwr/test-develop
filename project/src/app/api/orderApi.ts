import { projectId, publicAnonKey } from "@/app/config/supabase";
import type { OrderApiRecord } from "@/app/types/order";

const API_URL = `https://${projectId}.supabase.co/functions/v1/server`;

// Order requests are logged with the orderApi prefix because the user asked to
// monitor this flow with that exact label instead of page-level wording.
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
    console.log("[orderApi] Received order list:", data);
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
    console.log("[orderApi] Received order detail:", data);
    return data;
  } catch (error) {
    console.error("[orderApi] Error fetching order detail:", error);
    throw error;
  }
}


