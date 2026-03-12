import { projectId, publicAnonKey } from "@/app/config/supabase";

const API_URL = `https://${projectId}.supabase.co/functions/v1/server`;

export interface RecipeInfo {
  id?: string;
  품번: string;
  품명: string;
  평량: string;
  폭: string;
  길이: string;
  중량: string;
  소재목록: Array<{
    소재품명: string;
    소요량: string;
  }>;
  비고: string;
  등록일시?: string;
}

export async function fetchRecipeList(): Promise<RecipeInfo[]> {
  try {
    const response = await fetch(`${API_URL}/recipes`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch recipe list: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch recipe list: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('[recipeApi] Received data:', data);
    
    if (Array.isArray(data)) {
      return data;
    }
    
    return [];
  } catch (error) {
    console.error('[recipeApi] Error in fetchRecipeList:', error);
    throw error;
  }
}

export async function fetchRecipeById(id: string): Promise<RecipeInfo> {
  const response = await fetch(`${API_URL}/recipes/${id}`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch recipe');
  }
  
  return response.json();
}

export async function createRecipe(data: RecipeInfo): Promise<RecipeInfo> {
  const response = await fetch(`${API_URL}/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to create recipe:', errorText);
    throw new Error('Failed to create recipe');
  }
  
  return response.json();
}

export async function updateRecipe(id: string, data: RecipeInfo): Promise<RecipeInfo> {
  const response = await fetch(`${API_URL}/recipes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update recipe');
  }
  
  return response.json();
}

export async function deleteRecipe(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/recipes/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete recipe');
  }
}


