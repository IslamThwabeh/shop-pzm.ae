import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Upload } from 'lucide-react';
import type { Product } from '@shared/types';
import { buildApiUrl } from '../../utils/siteConfig';

interface ProductManagementProps {
  token: string;
}

interface ProductFormState {
  model: string;
  storage: string;
  condition: 'new' | 'used';
  color: string;
  price: string;
  quantity: string;
  description: string;
  brand: string;
  product_type: string;
  google_product_category: string;
  gtin: string;
  mpn: string;
  item_group_id: string;
  warranty: string;
  accessories_included: string;
  cosmetic_grade: string;
  repair_history: string;
  battery_health: string;
  release_year: string;
  images: File[];
  imagePreviews: string[];
}

function createInitialFormState(): ProductFormState {
  return {
    model: '',
    storage: '',
    condition: 'new',
    color: '',
    price: '',
    quantity: '0',
    description: '',
    brand: '',
    product_type: '',
    google_product_category: '',
    gtin: '',
    mpn: '',
    item_group_id: '',
    warranty: '',
    accessories_included: '',
    cosmetic_grade: '',
    repair_history: '',
    battery_health: '',
    release_year: '',
    images: [],
    imagePreviews: [],
  };
}

function buildFormState(product?: Product): ProductFormState {
  if (!product) {
    return createInitialFormState();
  }

  return {
    model: product.model,
    storage: product.storage || '',
    condition: product.condition,
    color: product.color || '',
    price: String(product.price ?? ''),
    quantity: String(product.quantity ?? 0),
    description: product.description || '',
    brand: product.brand || '',
    product_type: product.product_type || '',
    google_product_category: product.google_product_category || '',
    gtin: product.gtin || '',
    mpn: product.mpn || '',
    item_group_id: product.item_group_id || '',
    warranty: product.warranty || '',
    accessories_included: product.accessories_included || '',
    cosmetic_grade: product.cosmetic_grade || '',
    repair_history: product.repair_history || '',
    battery_health: product.battery_health != null ? String(product.battery_health) : '',
    release_year: product.release_year != null ? String(product.release_year) : '',
    images: [],
    imagePreviews: product.images || (product.image_url ? [product.image_url] : []),
  };
}

function appendFormValue(formData: FormData, name: string, value: string) {
  formData.append(name, value.trim());
}

export default function ProductManagement({ token }: ProductManagementProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormState>(createInitialFormState);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(buildApiUrl('/products'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load products');
      }

      const data = await response.json();
      setProducts(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product?: Product) => {
    setEditingProduct(product || null);
    setFormData(buildFormState(product));
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData(createInitialFormState());
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) {
      return;
    }

    const newImages = Array.from(files).slice(0, 4 - formData.images.length);
    const newPreviews = newImages.map((file) => URL.createObjectURL(file));

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
      imagePreviews: [...prev.imagePreviews, ...newPreviews],
    }));
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => {
      const newImages = prev.images.filter((_, imageIndex) => imageIndex !== index);
      const newPreviews = prev.imagePreviews.filter((_, previewIndex) => previewIndex !== index);

      if (index >= prev.imagePreviews.length - prev.images.length) {
        URL.revokeObjectURL(prev.imagePreviews[index]);
      }

      return {
        ...prev,
        images: newImages,
        imagePreviews: newPreviews,
      };
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      if (!formData.model.trim() || !formData.price.trim()) {
        throw new Error('Model and price are required');
      }

      const formDataToSend = new FormData();
      appendFormValue(formDataToSend, 'model', formData.model);
      appendFormValue(formDataToSend, 'storage', formData.storage);
      formDataToSend.append('condition', formData.condition);
      appendFormValue(formDataToSend, 'color', formData.color);
      appendFormValue(formDataToSend, 'price', formData.price);
      appendFormValue(formDataToSend, 'quantity', formData.quantity || '0');
      appendFormValue(formDataToSend, 'description', formData.description);
      appendFormValue(formDataToSend, 'brand', formData.brand);
      appendFormValue(formDataToSend, 'product_type', formData.product_type);
      appendFormValue(formDataToSend, 'google_product_category', formData.google_product_category);
      appendFormValue(formDataToSend, 'gtin', formData.gtin);
      appendFormValue(formDataToSend, 'mpn', formData.mpn);
      appendFormValue(formDataToSend, 'item_group_id', formData.item_group_id);
      appendFormValue(formDataToSend, 'warranty', formData.warranty);
      appendFormValue(formDataToSend, 'accessories_included', formData.accessories_included);
      appendFormValue(formDataToSend, 'cosmetic_grade', formData.cosmetic_grade);
      appendFormValue(formDataToSend, 'repair_history', formData.repair_history);
      appendFormValue(formDataToSend, 'battery_health', formData.battery_health);
      appendFormValue(formDataToSend, 'release_year', formData.release_year);

      formData.images.forEach((image, index) => {
        formDataToSend.append(`image${index}`, image);
      });

      const url = editingProduct
        ? buildApiUrl(`/products/${editingProduct.id}`)
        : buildApiUrl('/products');

      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || (editingProduct ? 'Failed to update product' : 'Failed to create product'));
      }

      await loadProducts();
      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(buildApiUrl(`/products/${productId}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-6 rounded-lg border border-red-500 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Products</h3>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <p className="text-slate-400">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-slate-400">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="overflow-hidden rounded-lg bg-slate-700 shadow-lg transition-shadow hover:shadow-xl"
            >
              <div className="h-48 overflow-hidden bg-slate-600">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.model}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400">
                    No image
                  </div>
                )}
              </div>

              <div className="p-4">
                <h4 className="mb-1 text-lg font-bold text-white">{product.model}</h4>
                {product.brand && <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">{product.brand}</p>}
                <p className="mb-3 mt-2 text-sm text-slate-300 line-clamp-2">{product.description || 'No description yet.'}</p>

                <div className="mb-3 flex flex-wrap gap-2 text-[11px] text-slate-300">
                  {product.warranty && <span className="rounded-full bg-slate-600 px-2.5 py-1">{product.warranty}</span>}
                  {product.battery_health != null && (
                    <span className="rounded-full bg-slate-600 px-2.5 py-1">Battery {product.battery_health}%</span>
                  )}
                  {product.cosmetic_grade && (
                    <span className="rounded-full bg-slate-600 px-2.5 py-1">{product.cosmetic_grade}</span>
                  )}
                </div>

                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Price</p>
                    <p className="font-bold text-green-400">AED {product.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Quantity</p>
                    <p className={`font-bold ${product.quantity > 0 ? 'text-blue-400' : 'text-red-400'}`}>
                      {product.quantity}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(product)}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-slate-700 bg-slate-800 p-8 shadow-xl">
            <h2 className="mb-6 text-2xl font-bold text-white">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-300">Product Model</label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., iPhone 15 Pro"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Storage / Variant</label>
                  <input
                    type="text"
                    name="storage"
                    value={formData.storage}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Color / Finish</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Condition</label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="new">Brand New</option>
                    <option value="used">Used</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Apple, Samsung, Lenovo..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Price (AED)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Write original factual copy. Avoid putting warranty, battery health, or accessories into color/storage."
                />
              </div>

              <div className="grid grid-cols-1 gap-4 rounded-lg border border-slate-700 bg-slate-900/35 p-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Warranty</label>
                  <input
                    type="text"
                    name="warranty"
                    value={formData.warranty}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Official warranty, 30-day store warranty..."
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Release Year</label>
                  <input
                    type="number"
                    name="release_year"
                    value={formData.release_year}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Battery Health</label>
                  <input
                    type="number"
                    name="battery_health"
                    value={formData.battery_health}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Used devices only"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Cosmetic Grade</label>
                  <input
                    type="text"
                    name="cosmetic_grade"
                    value={formData.cosmetic_grade}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Grade A, Excellent..."
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Repair History</label>
                  <input
                    type="text"
                    name="repair_history"
                    value={formData.repair_history}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Never repaired, new screen..."
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Accessories Included</label>
                  <input
                    type="text"
                    name="accessories_included"
                    value={formData.accessories_included}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Charger, box, keyboard..."
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-lg border border-slate-700 bg-slate-900/35 p-4">
                <div>
                  <p className="text-sm font-semibold text-white">Merchant fields</p>
                  <p className="mt-1 text-xs text-slate-400">Fill only with verified values. Leave blank if you are not sure.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Product Type</label>
                    <input
                      type="text"
                      name="product_type"
                      value={formData.product_type}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Brand New Devices > Phones & Tablets"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Google Product Category</label>
                    <input
                      type="text"
                      name="google_product_category"
                      value={formData.google_product_category}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Electronics > Communications > Telephony > Mobile Phones"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">GTIN</label>
                    <input
                      type="text"
                      name="gtin"
                      value={formData.gtin}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Verified barcode only"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">MPN</label>
                    <input
                      type="text"
                      name="mpn"
                      value={formData.mpn}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Manufacturer part number"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-300">Item Group ID</label>
                    <input
                      type="text"
                      name="item_group_id"
                      value={formData.item_group_id}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Shared ID for color/storage variants"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Product Images (Max 4)</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      disabled={formData.imagePreviews.length >= 4}
                      className="flex-1 rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <Upload size={20} className="text-slate-400" />
                  </div>

                  {formData.imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {formData.imagePreviews.map((preview, index) => (
                        <div key={index} className="group relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="h-24 w-full rounded-lg border border-slate-600 object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                            >
                              Remove
                            </button>
                          </div>
                          {index === 0 && formData.imagePreviews.length > 1 && (
                            <div className="absolute left-1 top-1 rounded bg-blue-600 px-2 py-1 text-xs text-white">
                              Primary
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-slate-400">
                    {formData.imagePreviews.length}/4 images ({4 - formData.imagePreviews.length} remaining)
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-blue-600 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 rounded-lg bg-slate-700 py-2 font-medium text-white transition-colors hover:bg-slate-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
