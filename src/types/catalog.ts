export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  bannerUrl?: string;
  iconUrl?: string;
  children: CategoryResponse[];
}

export interface ProductResponse {
  id: string;
  title: string;
  slug: string;
  brand: string;
  categoryName: string;
  categorySlug: string;
  minPrice: number;
  compareAtPrice?: number;
  imageUrl?: string;
}

export interface ProductVariantDto {
  id: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  attributesJson: string; // e.g. '{"color":"Titanium Gray","storage":"256GB"}'
  imageUrls: string[];
}

export interface ProductDetailResponse {
  id: string;
  title: string;
  slug: string;
  description: string;
  brand: string;
  categoryName: string;
  categorySlug: string;
  countryOfOrigin?: string;
  hsnCode?: string;
  variants: ProductVariantDto[];
}
