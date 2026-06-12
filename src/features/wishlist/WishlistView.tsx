import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import type { RootState, AppDispatch } from '../../store';
import { fetchWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import { addToCart } from '../../store/slices/cartSlice';
import API from '../../config/api';
import { useToast } from '../../components/Toast';

export const WishlistView: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, loading } = useSelector((state: RootState) => state.wishlist);
  const { user } = useSelector((state: RootState) => state.auth);
  const { showToast, showCartToast } = useToast();

  useEffect(() => {
    if (user) {
      dispatch(fetchWishlist());
    } else {
      navigate('/login?redirect=wishlist');
    }
  }, [dispatch, user, navigate]);

  const handleRemove = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(removeFromWishlist(productId));
  };

  const handleAddToCart = async (productSlug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      // Fetch product detail to get the cheapest variant id using slug
      const detailRes = await API.get(`/products/${productSlug}`);
      const product = detailRes.data;
      if (product.variants && product.variants.length > 0) {
        // Find cheapest variant
        const cheapest = product.variants.reduce((prev: any, current: any) =>
          prev.price < current.price ? prev : current
        );

        dispatch(
          addToCart({
            variantId: cheapest.id,
            quantity: 1,
            itemDetails: {
              variantId: cheapest.id,
              productTitle: product.title,
              sku: cheapest.sku,
              price: cheapest.price,
              imageUrl: cheapest.imageUrls?.[0] || null,
              attributesJson: cheapest.attributesJson,
              stock: cheapest.stock,
            },
          })
        );
        showCartToast(product.title);
      } else {
        showToast('No variants available for this product.', 'warning');
      }
    } catch (error) {
      showToast('Failed to add to cart directly. Please view details.', 'error');
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-50 border-b-50 border-indigo-600"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 text-rose-500 mb-6">
          <Heart size={48} className="fill-current" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Your Wishlist is Empty</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
          Add items that you want to keep track of here. They will stay saved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-8">My Wishlist</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((product) => (
          <Link
            to={`/products/${product.slug}`}
            key={product.id}
            className="group relative flex flex-col bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <div className="relative aspect-square w-full bg-slate-50 dark:bg-slate-800/50 p-4 flex items-center justify-center">
              <img
                src={product.imageUrl || 'https://via.placeholder.com/150'}
                alt={product.title}
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
              <button
                onClick={(e) => handleRemove(product.id, e)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-rose-500 hover:scale-110 shadow-sm transition-all duration-200"
                title="Remove from wishlist"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="flex-1 p-5 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  {product.brand}
                </p>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2 transition-colors">
                  {product.title}
                </h3>
              </div>

              <div className="mt-4">
                <div className="flex items-baseline space-x-2">
                  <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                    ₹{product.minPrice.toLocaleString('en-IN')}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.minPrice && (
                    <>
                      <span className="text-sm text-slate-400 dark:text-slate-500 line-through">
                        ₹{product.compareAtPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {Math.round(
                          ((product.compareAtPrice - product.minPrice) / product.compareAtPrice) * 100
                        )}
                        % OFF
                      </span>
                    </>
                  )}
                </div>

                <button
                  onClick={(e) => handleAddToCart(product.slug, e)}
                  className="w-full mt-4 flex items-center justify-center space-x-2 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-800 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 dark:hover:bg-indigo-600 dark:hover:border-indigo-600 font-semibold rounded-2xl transition-all duration-300"
                >
                  <ShoppingCart size={16} />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
