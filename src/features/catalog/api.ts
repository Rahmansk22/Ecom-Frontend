import API from '../../config/api';
import type { CategoryResponse, ProductResponse, ProductDetailResponse } from '../../types/catalog';

export const fetchCategories = async (): Promise<CategoryResponse[]> => {
  const response = await API.get('/categories');
  return response.data;
};

export const fetchProducts = async (
  categorySlug?: string,
  brand?: string,
  page = 0,
  size = 12
): Promise<{ content: ProductResponse[]; totalElements: number }> => {
  const params: any = { page, size };
  if (categorySlug) params.category = categorySlug;
  if (brand) params.brand = brand;

  const response = await API.get('/products', { params });
  return {
    content: response.data.content,
    totalElements: response.data.totalElements,
  };
};

export const fetchProductDetail = async (slug: string): Promise<ProductDetailResponse> => {
  const response = await API.get(`/products/${slug}`);
  return response.data;
};
