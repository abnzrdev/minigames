const API_BASE_URL = 'https://faxb76kxra.execute-api.eu-central-1.amazonaws.com';

export type CategorySlug = 'all' | 'puzzle' | 'card' | 'match' | 'farm' | 'strategy' | 'arcade';

export interface Category {
  slug: CategorySlug;
  label: string;
  isDefault: boolean;
}

interface CategoriesResponse {
  data: Category[];
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(`${API_BASE_URL}/api/categories`);

  if (!response.ok) {
    throw new Error(`Failed to load categories: ${response.status}`);
  }

  const result: CategoriesResponse = await response.json();

  return result.data;
}
