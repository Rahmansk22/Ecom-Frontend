import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './store';
import type { RootState } from './store';
import { ToastProvider } from './components/Toast';
import { DialogProvider } from './components/Dialog';
import { AppShell } from './layout/AppShell';
import { Login } from './features/auth/Login';
import { Signup } from './features/auth/Signup';
import { Profile } from './features/auth/Profile';
import { Home } from './features/catalog/Home';
import { CategoryView } from './features/catalog/CategoryView';
import { ProductDetail } from './features/catalog/ProductDetail';
import { SearchResults } from './features/catalog/SearchResults';
import { CartView } from './features/cart/CartView';
import { WishlistView } from './features/wishlist/WishlistView';
import { CheckoutView } from './features/checkout/CheckoutView';
import { OrdersView } from './features/orders/OrdersView';
import { OrderDetailView } from './features/orders/OrderDetailView';
import { SellerLayout } from './features/seller/SellerLayout';
import { SellerDashboard } from './features/seller/SellerDashboard';
import { SellerProducts } from './features/seller/SellerProducts';
import { SellerProductForm } from './features/seller/SellerProductForm';
import { SellerOrders } from './features/seller/SellerOrders';
import { AdminLayout } from './features/admin/AdminLayout';
import { AdminDashboard } from './features/admin/AdminDashboard';

const queryClient = new QueryClient();

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="categories/:slug" element={<CategoryView />} />
          <Route path="products/:slug" element={<ProductDetail />} />
          <Route path="search" element={<SearchResults />} />
          
          {/* Guest/Shared Cart Route */}
          <Route path="cart" element={<CartView />} />

          {/* Protected Routes */}
          <Route path="wishlist" element={
            <ProtectedRoute>
              <WishlistView />
            </ProtectedRoute>
          } />
          <Route path="checkout" element={
            <ProtectedRoute>
              <CheckoutView />
            </ProtectedRoute>
          } />
          <Route path="orders" element={
            <ProtectedRoute>
              <OrdersView />
            </ProtectedRoute>
          } />
          <Route path="orders/:id" element={
            <ProtectedRoute>
              <OrderDetailView />
            </ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        {/* Seller Workspace */}
        <Route path="/seller" element={<SellerLayout />}>
          <Route index element={<SellerDashboard />} />
          <Route path="products" element={<SellerProducts />} />
          <Route path="products/new" element={<SellerProductForm />} />
          <Route path="products/edit/:slug" element={<SellerProductForm />} />
          <Route path="orders" element={<SellerOrders />} />
        </Route>

        {/* Admin Workspace */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <DialogProvider>
            <AppRoutes />
          </DialogProvider>
        </ToastProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;

