import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Edit2, Trash2, Plus, Search, ArrowLeft } from 'lucide-react';
import API from '../../config/api';
import type { ProductResponse } from '../../types/catalog';
import { useDialog } from '../../components/Dialog';

export const SellerProducts: React.FC = () => {
  const { showAlert, showConfirm } = useDialog();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await API.get<ProductResponse[]>('/seller/products');
      setProducts(res.data);
      setFilteredProducts(res.data);
    } catch (err: any) {
      setError('Failed to fetch seller products directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const results = products.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.categoryName.toLowerCase().includes(term)
    );
    setFilteredProducts(results);
  }, [searchTerm, products]);

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm('Are you sure you want to deactivate this product listing? Customers will not be able to buy it.');
    if (!confirmed) return;

    try {
      await API.delete(`/seller/products/${id}`);
      showAlert('Product successfully deactivated.', 'success');
      loadProducts();
    } catch (err: any) {
      showAlert(err.response?.data?.message || 'Failed to deactivate product listing', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-50 border-b-50 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link to="/seller" className="flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-700 mb-1.5">
            <ArrowLeft size={14} className="mr-1" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="text-indigo-600" />
            My Products Directory
          </h1>
          <p className="text-sm text-slate-500">Manage all your product listings and inventory stock levels.</p>
        </div>
        <Link
          to="new"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-2xl shadow-md transition-colors text-sm"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400 rounded-2xl">
          {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-sm">
        <Search className="text-slate-400 mr-2 h-5 w-5" />
        <input
          type="text"
          placeholder="Filter by title, brand, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-sm text-slate-800 dark:text-white"
        />
      </div>

      {/* Table grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No products found matching your search. Click "Add Product" to create your first listing!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="px-6 py-4">Product Info</th>
                  <th className="px-6 py-4">Brand</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-right">Starting Price</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 flex items-center space-x-3 min-w-[280px]">
                      <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 flex items-center justify-center border dark:border-slate-700">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.title} className="max-h-full max-w-full object-contain" />
                        ) : (
                          <Package className="text-slate-400" size={20} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">{p.title}</p>
                        <p className="text-xs text-slate-400 truncate">Slug: {p.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{p.brand}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{p.categoryName}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">
                      ₹{p.minPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <Link
                          to={`edit/${p.id}`}
                          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition-all"
                          title="Edit Listing"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all"
                          title="Deactivate Listing"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
