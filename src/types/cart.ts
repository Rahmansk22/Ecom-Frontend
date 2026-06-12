export interface CartItem {
  variantId: string;
  productTitle: string;
  sku: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  attributesJson: string;
  stock: number;
  productSlug: string;
}

export interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}
