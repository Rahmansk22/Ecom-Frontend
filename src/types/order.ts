export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'UPI' | 'COD' | 'NET_BANKING';
export type OrderStatus = 'PLACED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface OrderItemResponse {
  id: string;
  variantId: string;
  productTitle: string;
  sku: string;
  quantity: number;
  priceAtPurchase: number;
  imageUrl: string | null;
}

export interface OrderResponse {
  id: string;
  shippingName: string;
  shippingAddressLine1: string;
  shippingAddressLine2: string | null;
  shippingCity: string;
  shippingState: string;
  shippingCountry: string;
  shippingPincode: string;
  shippingPhone: string | null;
  totalPrice: number;
  discountAmount: number;
  shippingCharge: number;
  netAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionId: string | null;
  createdAt: string;
  items: OrderItemResponse[];
}

export interface CheckoutRequest {
  addressId: string;
  paymentMethod: PaymentMethod;
  transactionId?: string;
}

export interface OrderState {
  orders: OrderResponse[];
  currentOrder: OrderResponse | null;
  loading: boolean;
  error: string | null;
}
