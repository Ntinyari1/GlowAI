const API_BASE_URL = 'https://world.openbeautyfacts.org/api/v2';

export interface Product {
  code: string;
  product_name: string;
  product_name_en?: string;
  brands?: string;
  categories?: string;
  image_url?: string;
  ingredients_text?: string;
  ecoscore_grade?: string;
  ecoscore_score?: number;
  nutriscore_grade?: string;
  nova_group?: number;
  [key: string]: any; // For additional fields
}
export interface SearchResponse {
  products: Product[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Mock data for development
const MOCK_PRODUCTS: Product[] = [
  {
    code: 'mock1',
    product_name: 'Hydrating Cleanser',
    brands: 'Cerave',
    categories: 'skincare, face, cleanser',
    image_url: 'https://example.com/cleanser.jpg',
    ingredients_text: 'Water, Glycerin, Cetearyl Alcohol',
    nutriscore_grade: 'b',
    nova_group: 1
  },
  {
    code: 'mock2',
    product_name: 'Moisturizing Lotion',
    brands: 'Neutrogena',
    categories: 'skincare, face, moisturizer',
    image_url: 'https://example.com/moisturizer.jpg',
    ingredients_text: 'Water, Glycerin, Petrolatum',
    nutriscore_grade: 'a',
    nova_group: 1
  },
  {
    code: 'mock3',
    product_name: 'Sunscreen SPF 50',
    brands: 'La Roche-Posay',
    categories: 'skincare, face, sunscreen',
    image_url: 'https://example.com/sunscreen.jpg',
    ingredients_text: 'Aqua, Alcohol Denat, Dimethicone',
    nutriscore_grade: 'a',
    nova_group: 2
  }
];

const MOCK_RESPONSE: SearchResponse = {
  products: MOCK_PRODUCTS,
  count: MOCK_PRODUCTS.length,
  page: 1,
  pageSize: 24,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false
};

// Check if we should use mock data (for development only)
const USE_MOCK_DATA = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_DATA === 'true';

interface SearchOptions {
  query?: string;
  page?: number;
  pageSize?: number;
  useMock?: boolean;
  skinType?: string;
  concerns?: string[];
  goals?: string[];
}

export const searchProducts = async ({
  query = "",
  page = 1,
  pageSize = 24,
  useMock = USE_MOCK_DATA
}: SearchOptions = {}): Promise<SearchResponse> => {
  // Return mock data if explicitly requested or in development with mock enabled
  if (useMock) {
    console.warn('Using mock product data');
    return MOCK_RESPONSE;
  }

  try {
    const params = new URLSearchParams({
      query,
      page: String(page),
      pageSize: String(pageSize)
    });
    
    const response = await fetch(`/api/products?${params.toString()}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `API request failed with status ${response.status}`
      );
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error searching products:", error);
    
    // In production, rethrow the error to be handled by the error boundary
    if (!import.meta.env.DEV) {
      throw error;
    }
    
    // In development, log the error and return mock data
    console.warn('Falling back to mock data due to error');
    return MOCK_RESPONSE;
  }
};

export const getProductByBarcode = async (barcode: string): Promise<{ product: Product }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/product/${barcode}.json`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Product not found');
      }
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

export const getProductsByCategory = async (category: string, page: number = 1, pageSize: number = 24): Promise<SearchResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/search?categories_tags=${encodeURIComponent(category)}&page=${page}&page_size=${pageSize}&json=true`
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};

export const getProductCategories = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories.json`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data.tags.map((tag: { name: string }) => tag.name);
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};
