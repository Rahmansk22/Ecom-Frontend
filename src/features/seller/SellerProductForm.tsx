import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Tag, AlertCircle } from 'lucide-react';
import API from '../../config/api';
import type { ProductDetailResponse } from '../../types/catalog';
import { useDialog } from '../../components/Dialog';

interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  subcategories?: CategoryNode[];
}

interface VariantField {
  id?: string;
  sku: string;
  price: number;
  compareAtPrice: number;
  stock: number;
  attributes: { key: string; value: string }[];
  imageUrls: string[];
}

export const SellerProductForm: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const { showAlert } = useDialog();
  const isEdit = !!slug;

  // Form Fields
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status] = useState('ACTIVE');
  const [countryOfOrigin, setCountryOfOrigin] = useState('');
  const [hsnCode, setHsnCode] = useState('');
  const [productId, setProductId] = useState<string | null>(null);

  const [variants, setVariants] = useState<VariantField[]>([
    { sku: '', price: 0, compareAtPrice: 0, stock: 10, attributes: [{ key: 'color', value: '' }], imageUrls: [''] }
  ]);

  // Categories list
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
    if (isEdit) {
      loadProductData();
    }
  }, [slug]);

  const loadCategories = async () => {
    try {
      const res = await API.get<CategoryNode[]>('/categories');
      const flatList: { id: string; name: string }[] = [];
      const flatten = (nodes: CategoryNode[], prefix = '') => {
        nodes.forEach((n) => {
          flatList.push({ id: n.id, name: prefix ? `${prefix} > ${n.name}` : n.name });
          if (n.subcategories && n.subcategories.length > 0) {
            flatten(n.subcategories, prefix ? `${prefix} > ${n.name}` : n.name);
          }
        });
      };
      flatten(res.data);
      setCategories(flatList);
    } catch (err: any) {
      console.error('Failed to load categories', err);
    }
  };

  const loadProductData = async () => {
    setLoading(true);
    try {
      const res = await API.get<ProductDetailResponse>(`/products/${slug}`);
      const p = res.data;
      setProductId(p.id);
      setTitle(p.title);
      setBrand(p.brand);
      setDescription(p.description);
      setCountryOfOrigin(p.countryOfOrigin || '');
      setHsnCode(p.hsnCode || '');

      // Load variants
      if (p.variants && p.variants.length > 0) {
        const mapped = p.variants.map((v) => {
          let attrs: { key: string; value: string }[] = [];
          try {
            if (v.attributesJson) {
              const obj = JSON.parse(v.attributesJson);
              attrs = Object.keys(obj).map((k) => ({ key: k, value: obj[k] }));
            }
          } catch (e) {
            console.error('Failed to parse variant attributes', e);
          }
          if (attrs.length === 0) {
            attrs = [{ key: 'color', value: '' }];
          }

          return {
            id: v.id,
            sku: v.sku,
            price: v.price,
            compareAtPrice: v.compareAtPrice || 0,
            stock: v.stock,
            attributes: attrs,
            imageUrls: v.imageUrls && v.imageUrls.length > 0 ? v.imageUrls : [''],
          };
        });
        setVariants(mapped);
      }
    } catch (err: any) {
      setError('Failed to retrieve product details for editing.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      { sku: '', price: 0, compareAtPrice: 0, stock: 10, attributes: [{ key: 'color', value: '' }], imageUrls: [''] }
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length === 1) {
      showAlert('You must provide at least one variant for the product listing.', 'warning');
      return;
    }
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: keyof VariantField, value: any) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAttrChange = (vIndex: number, attrIndex: number, field: 'key' | 'value', value: string) => {
    setVariants((prev) => {
      const copy = [...prev];
      const attrs = [...copy[vIndex].attributes];
      attrs[attrIndex] = { ...attrs[attrIndex], [field]: value };
      copy[vIndex] = { ...copy[vIndex], attributes: attrs };
      return copy;
    });
  };

  const handleAddAttr = (vIndex: number) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[vIndex] = { ...copy[vIndex], attributes: [...copy[vIndex].attributes, { key: '', value: '' }] };
      return copy;
    });
  };

  const handleRemoveAttr = (vIndex: number, attrIndex: number) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[vIndex] = { ...copy[vIndex], attributes: copy[vIndex].attributes.filter((_, i) => i !== attrIndex) };
      return copy;
    });
  };

  const handleImageUrlChange = (vIndex: number, imgIndex: number, value: string) => {
    setVariants((prev) => {
      const copy = [...prev];
      const urls = [...copy[vIndex].imageUrls];
      urls[imgIndex] = value;
      copy[vIndex] = { ...copy[vIndex], imageUrls: urls };
      return copy;
    });
  };

  const handleAddImageUrl = (vIndex: number) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[vIndex] = { ...copy[vIndex], imageUrls: [...copy[vIndex].imageUrls, ''] };
      return copy;
    });
  };

  const handleRemoveImageUrl = (vIndex: number, imgIndex: number) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[vIndex] = { ...copy[vIndex], imageUrls: copy[vIndex].imageUrls.filter((_, i) => i !== imgIndex) };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      showAlert('Please select a Category', 'warning');
      return;
    }

    setError(null);
    setLoading(true);

    // Prepare payload variants
    const payloadVariants = variants.map((v) => {
      const attrsObj: Record<string, string> = {};
      v.attributes.forEach((a) => {
        if (a.key.trim() && a.value.trim()) {
          attrsObj[a.key.trim()] = a.value.trim();
        }
      });

      return {
        id: v.id,
        sku: v.sku.trim() || 'SKU-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
        price: Number(v.price),
        compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
        stock: Number(v.stock),
        attributesJson: JSON.stringify(attrsObj),
        imageUrls: v.imageUrls.filter((url) => url.trim() !== ''),
      };
    });

    const payload = {
      title: title.trim(),
      brand: brand.trim(),
      description: description.trim(),
      categoryId,
      status,
      countryOfOrigin: countryOfOrigin.trim() || undefined,
      hsnCode: hsnCode.trim() || undefined,
      variants: payloadVariants,
    };

    try {
      if (isEdit && productId) {
        await API.put(`/seller/products/${productId}`, payload);
      } else {
        await API.post('/seller/products', payload);
      }
      showAlert(`Product successfully ${isEdit ? 'updated' : 'created'}`, 'success');
      navigate('/seller/products');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit product details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit && !productId) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-50 border-b-50 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <Link to="/seller/products" className="flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-700 mb-1.5">
          <ArrowLeft size={14} className="mr-1" /> Back to Products List
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {isEdit ? 'Edit Product Listing' : 'Create New Product Listing'}
        </h1>
        <p className="text-sm text-slate-500">
          {isEdit ? 'Update product description, details and stock limits.' : 'Add a new product with multiple variants.'}
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400 rounded-2xl flex items-start gap-2">
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info Section */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b dark:border-slate-800">
            <Tag size={18} className="text-indigo-600" />
            1. Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Product Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  // Auto-populate category selection during load if matched
                  if (categories.length > 0 && !categoryId && isEdit) {
                    // Pre-fill matching category
                  }
                }}
                required
                placeholder="e.g. Sony Wireless Noise Cancelling Headphones"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Brand Name</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
                placeholder="e.g. Sony"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl text-sm"
              >
                <option value="">Select Category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                placeholder="Explain the detailed features, specifications, and warranty details..."
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Country of Origin</label>
              <input
                type="text"
                value={countryOfOrigin}
                onChange={(e) => setCountryOfOrigin(e.target.value)}
                placeholder="e.g. Japan"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">HSN Code</label>
              <input
                type="text"
                value={hsnCode}
                onChange={(e) => setHsnCode(e.target.value)}
                placeholder="e.g. 85183000"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        {/* Variants Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">2. Product Variants</h3>
            <button
              type="button"
              onClick={handleAddVariant}
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/80 px-3.5 py-2 rounded-xl transition-all"
            >
              <Plus size={14} /> Add Variant Option
            </button>
          </div>

          {variants.map((variant, vIndex) => (
            <div
              key={vIndex}
              className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm space-y-4 relative"
            >
              <button
                type="button"
                onClick={() => handleRemoveVariant(vIndex)}
                className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 transition-colors p-1"
                title="Delete Variant"
              >
                <Trash2 size={16} />
              </button>

              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Variant #{vIndex + 1} Settings</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={variant.sku}
                    onChange={(e) => handleVariantChange(vIndex, 'sku', e.target.value)}
                    placeholder="e.g. SONY-1000XM5-B"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={variant.price}
                    onChange={(e) => handleVariantChange(vIndex, 'price', e.target.value)}
                    required
                    placeholder="e.g. 29990"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">MRP / Compare Price (₹)</label>
                  <input
                    type="number"
                    value={variant.compareAtPrice}
                    onChange={(e) => handleVariantChange(vIndex, 'compareAtPrice', e.target.value)}
                    placeholder="e.g. 34990"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Inventory Stock</label>
                  <input
                    type="number"
                    value={variant.stock}
                    onChange={(e) => handleVariantChange(vIndex, 'stock', e.target.value)}
                    required
                    placeholder="10"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Attributes Map */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Variant Attributes (Color, Storage, Size, etc.)</label>
                  <button
                    type="button"
                    onClick={() => handleAddAttr(vIndex)}
                    className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
                  >
                    + Add Attribute
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {variant.attributes.map((attr, aIndex) => (
                    <div key={aIndex} className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Key (e.g. color)"
                        value={attr.key}
                        onChange={(e) => handleAttrChange(vIndex, aIndex, 'key', e.target.value)}
                        className="w-1/2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. Black)"
                        value={attr.value}
                        onChange={(e) => handleAttrChange(vIndex, aIndex, 'value', e.target.value)}
                        className="w-1/2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl text-xs"
                      />
                      {variant.attributes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAttr(vIndex, aIndex)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Image URLs */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Image URLs</label>
                  <button
                    type="button"
                    onClick={() => handleAddImageUrl(vIndex)}
                    className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
                  >
                    + Add Image URL
                  </button>
                </div>

                <div className="space-y-2">
                  {variant.imageUrls.map((url, imgIndex) => (
                    <div key={imgIndex} className="flex items-center space-x-2">
                      <input
                        type="url"
                        placeholder="e.g. https://images.unsplash.com/... or S3 URL"
                        value={url}
                        onChange={(e) => handleImageUrlChange(vIndex, imgIndex, e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl text-xs"
                      />
                      {variant.imageUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveImageUrl(vIndex, imgIndex)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t dark:border-slate-800">
          <Link
            to="/seller/products"
            className="px-6 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-bold px-6 py-2.5 rounded-2xl shadow-md transition-colors text-sm"
          >
            <Save size={16} />
            {loading ? 'Submitting...' : 'Save Product Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};
