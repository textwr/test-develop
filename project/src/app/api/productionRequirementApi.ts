import { projectId, publicAnonKey } from '../../../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/server`;

export interface ProductionRequirement {
  id?: string;
  수주일자: string;
  수주번호: string;
  거래처번호: string;
  품번: string;
  품명: string;
  평량: string;
  폭: string;
  길이: string;
  수주량: string;
  재고량: string;
  적정재고량: string;
  과부족량: string;
  출하예정량: string;
  생산소요량: string;
  시간당생산량: string;
  예상생산소요시간: string;
  등록일시?: string;
}

// 생산소요량 산출 목록 조회
export async function fetchProductionRequirementList(): Promise<ProductionRequirement[]> {
  const response = await fetch(`${API_URL}/production-requirements`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch production requirement list');
  }
  
  return response.json();
}

// 생산소요량 산출 일괄 등록
export async function createProductionRequirementsBatch(items: ProductionRequirement[]): Promise<ProductionRequirement[]> {
  const response = await fetch(`${API_URL}/production-requirements/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify({ items }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create production requirements');
  }
  
  return response.json();
}
