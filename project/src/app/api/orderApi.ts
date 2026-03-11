import { projectId, publicAnonKey } from "/utils/supabase/info";
import type { OrderApiRecord } from "../types/order";

const API_URL = `https://${projectId}.supabase.co/functions/v1/server`;

// Order list data is the primary dataset for this prototype, so successful
// responses are logged for monitoring exactly as requested.
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

export async function createOrder(data: unknown) {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to create order: ${errorData.message ?? response.statusText}`);
    }

    const result = await response.json();
    console.log("[orderApi] Created order:", result);
    return result;
  } catch (error) {
    console.error("[orderApi] Error creating order:", error);
    throw error;
  }
}

export async function updateOrder(id: string, data: unknown) {
  try {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to update order: ${errorData.message ?? response.statusText}`);
    }

    const result = await response.json();
    console.log("[orderApi] Updated order:", result);
    return result;
  } catch (error) {
    console.error("[orderApi] Error updating order:", error);
    throw error;
  }
}

export async function deleteOrder(id: string) {
  try {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete order: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log("[orderApi] Deleted order:", result);
    return result;
  } catch (error) {
    console.error("[orderApi] Error deleting order:", error);
    throw error;
  }
}
