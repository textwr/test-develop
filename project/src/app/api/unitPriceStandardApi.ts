import { projectId, publicAnonKey } from "/utils/supabase/info";

const API_URL = `https://${projectId}.supabase.co/functions/v1/server`;

export interface UnitPriceStandardRecord {
  id?: string;
  거래처번호?: string;
  거래처명?: string;
  품번?: string;
  품명?: string;
  단가?: string;
  단위?: string;
  단가구분?: string;
  적용유무?: string;
  변경일자?: string;
  적용일자?: string;
  생성일시?: string;
  수정일시?: string;
  RevNo?: number;
  개정번호?: number;
  비고?: string;
}

export async function fetchUnitPriceStandardList(): Promise<UnitPriceStandardRecord[]> {
  try {
    const response = await fetch(`${API_URL}/unit-price-standard`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch unit price standard list: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as UnitPriceStandardRecord[];
    console.log("[unitPriceStandardApi] Received unit price list:", data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("[unitPriceStandardApi] Error fetching unit price standard list:", error);
    throw error;
  }
}

export async function fetchUnitPriceStandardById(id: string): Promise<UnitPriceStandardRecord> {
  try {
    const response = await fetch(`${API_URL}/unit-price-standard/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch unit price standard: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as UnitPriceStandardRecord;
    console.log("[unitPriceStandardApi] Received unit price detail:", data);
    return data;
  } catch (error) {
    console.error("[unitPriceStandardApi] Error fetching unit price standard detail:", error);
    throw error;
  }
}

export async function createUnitPriceStandard(data: UnitPriceStandardRecord) {
  try {
    const response = await fetch(`${API_URL}/unit-price-standard`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create unit price standard: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log("[unitPriceStandardApi] Created unit price:", result);
    return result;
  } catch (error) {
    console.error("[unitPriceStandardApi] Error creating unit price standard:", error);
    throw error;
  }
}

export async function updateUnitPriceStandard(id: string, data: UnitPriceStandardRecord) {
  try {
    const response = await fetch(`${API_URL}/unit-price-standard/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update unit price standard: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log("[unitPriceStandardApi] Updated unit price:", result);
    return result;
  } catch (error) {
    console.error("[unitPriceStandardApi] Error updating unit price standard:", error);
    throw error;
  }
}

export async function deleteUnitPriceStandard(id: string) {
  try {
    const response = await fetch(`${API_URL}/unit-price-standard/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete unit price standard: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log("[unitPriceStandardApi] Deleted unit price:", result);
    return result;
  } catch (error) {
    console.error("[unitPriceStandardApi] Error deleting unit price standard:", error);
    throw error;
  }
}
