import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { CartState, CartItem } from '../../types/cart';
import API from '../../config/api';

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

// Sync/Fetch Cart
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as any;
    const isLoggedIn = !!state.auth.user;

    if (isLoggedIn) {
      try {
        const response = await API.get<CartItem[]>('/cart');
        return response.data;
      } catch (error: any) {
        // If the server call fails (expired token, network issue, etc.)
        // fall back to localStorage so items still appear
        const stored = localStorage.getItem('guest_cart');
        if (stored) {
          try {
            const items = JSON.parse(stored);
            if (items.length > 0) return items;
          } catch { /* ignore */ }
        }
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
      }
    } else {
      const stored = localStorage.getItem('guest_cart');
      return stored ? JSON.parse(stored) : [];
    }
  }
);

// Add Item
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (
    payload: { variantId: string; quantity: number; itemDetails?: Omit<CartItem, 'quantity'> },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as any;
      const isLoggedIn = !!state.auth.user;

      if (isLoggedIn) {
        const response = await API.post<CartItem[]>('/cart', {
          variantId: payload.variantId,
          quantity: payload.quantity,
        });
        return response.data;
      } else {
        const stored = localStorage.getItem('guest_cart');
        const items: CartItem[] = stored ? JSON.parse(stored) : [];
        const existing = items.find((i) => i.variantId === payload.variantId);

        if (existing) {
          existing.quantity += payload.quantity;
          if (existing.quantity > existing.stock) {
            existing.quantity = existing.stock;
          }
        } else if (payload.itemDetails) {
          items.push({
            ...payload.itemDetails,
            quantity: payload.quantity,
          });
        }
        localStorage.setItem('guest_cart', JSON.stringify(items));
        return items;
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add item to cart');
    }
  }
);

// Update Quantity
export const updateCartItemQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async (payload: { variantId: string; quantity: number }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const isLoggedIn = !!state.auth.user;

      if (isLoggedIn) {
        const response = await API.put<CartItem[]>(`/cart/${payload.variantId}`, {
          quantity: payload.quantity,
        });
        return response.data;
      } else {
        const stored = localStorage.getItem('guest_cart');
        let items: CartItem[] = stored ? JSON.parse(stored) : [];

        if (payload.quantity <= 0) {
          items = items.filter((i) => i.variantId !== payload.variantId);
        } else {
          const item = items.find((i) => i.variantId === payload.variantId);
          if (item) {
            item.quantity = Math.min(payload.quantity, item.stock);
          }
        }
        localStorage.setItem('guest_cart', JSON.stringify(items));
        return items;
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update item quantity');
    }
  }
);

// Remove Item
export const removeCartItem = createAsyncThunk(
  'cart/removeItem',
  async (variantId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const isLoggedIn = !!state.auth.user;

      if (isLoggedIn) {
        const response = await API.delete<CartItem[]>(`/cart/${variantId}`);
        return response.data;
      } else {
        const stored = localStorage.getItem('guest_cart');
        let items: CartItem[] = stored ? JSON.parse(stored) : [];
        items = items.filter((i) => i.variantId !== variantId);
        localStorage.setItem('guest_cart', JSON.stringify(items));
        return items;
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove item from cart');
    }
  }
);

// Merge Guest Cart
export const mergeCartOnLogin = createAsyncThunk(
  'cart/mergeCart',
  async (_, { rejectWithValue }) => {
    try {
      const stored = localStorage.getItem('guest_cart');
      if (!stored) return [];

      const guestItems: CartItem[] = JSON.parse(stored);
      if (guestItems.length === 0) return [];

      const response = await API.post<CartItem[]>('/cart/merge', guestItems);
      localStorage.removeItem('guest_cart');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to merge guest cart');
    }
  }
);

// Clear Cart
export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const isLoggedIn = !!state.auth.user;

      if (isLoggedIn) {
        await API.delete('/cart');
      } else {
        localStorage.removeItem('guest_cart');
      }
      return [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
    }
  }
);

const slugify = (text: string): string => {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

const sanitizeCartItems = (items: CartItem[]): CartItem[] => {
  if (!items || !Array.isArray(items)) return [];
  return items.map((item) => {
    let slug = item.productSlug;
    if (!slug || slug === 'null') {
      slug = slugify(item.productTitle);
    }
    return {
      ...item,
      productSlug: slug,
    };
  });
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Synchronously load guest cart from localStorage (no async needed)
    syncFromLocalStorage: (state) => {
      try {
        const stored = localStorage.getItem('guest_cart');
        if (stored) {
          state.items = sanitizeCartItems(JSON.parse(stored));
        }
      } catch {
        // ignore parse errors
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = sanitizeCartItems(action.payload);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Keep existing items so cart stays visible even if refresh fails
      })
      // Add Item
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = sanitizeCartItems(action.payload);
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Quantity
      .addCase(updateCartItemQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.loading = false;
        state.items = sanitizeCartItems(action.payload);
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Remove Item
      .addCase(removeCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = sanitizeCartItems(action.payload);
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Merge Cart
      .addCase(mergeCartOnLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(mergeCartOnLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.items = sanitizeCartItems(action.payload);
      })
      .addCase(mergeCartOnLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Clear Cart
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { syncFromLocalStorage } = cartSlice.actions;
export default cartSlice.reducer;
