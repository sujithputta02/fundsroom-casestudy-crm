import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Search, Edit, AlertTriangle, X, PackageCheck } from 'lucide-react';
import { Layout } from '../components/Layout';
import { RoleGuard } from '../components/RoleGuard';
import { productAPI } from '../lib/api';
import { Product } from '../types';
import { TableSkeleton } from '../components/skeletons/TableSkeleton';

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unitPrice: 0,
    currentStock: 0,
    minimumStockAlert: 0,
    location: '',
  });
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await productAPI.getAll(50, 0, search, category);
      setProducts(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadProducts, 300);
    return () => clearTimeout(timer);
  }, [search, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      if (editingId) {
        await productAPI.update(editingId, formData);
      } else {
        await productAPI.create(formData);
      }
      loadProducts();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: '',
        sku: '',
        category: '',
        unitPrice: 0,
        currentStock: 0,
        minimumStockAlert: 0,
        location: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      unitPrice: Number(product.unitPrice),
      currentStock: product.currentStock,
      minimumStockAlert: product.minimumStockAlert,
      location: product.location,
    });
    setShowForm(true);
  };

  const isLowStock = (product: Product) => product.currentStock <= product.minimumStockAlert;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-display text-primary mb-1">Product Inventory</h1>
            <p className="text-body text-secondary">Track warehouse stock levels, SKUs, and reorder points</p>
          </div>
          <RoleGuard allowedRoles={['WAREHOUSE', 'ADMIN']}>
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  name: '',
                  sku: '',
                  category: '',
                  unitPrice: 0,
                  currentStock: 0,
                  minimumStockAlert: 0,
                  location: '',
                });
                setShowForm(true);
              }}
              className="btn-primary"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          </RoleGuard>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gap-card">
          <div className="md:col-span-2">
            <span className="card-eyebrow">SEARCH CATALOG</span>
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-secondary" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by product name, SKU, or model..."
                className="input-base pl-10 w-full"
              />
            </div>
          </div>
          <div>
            <span className="card-eyebrow">FILTER BY CATEGORY</span>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Hardware, Cable..."
              className="input-base w-full"
            />
          </div>
        </div>

        {/* Form Modal Drawer */}
        {showForm && createPortal(
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-custom-16 shadow-2xl p-6 animate-fade-in">
              <div className="flex items-center justify-between pb-4 border-b border-light-border dark:border-dark-border mb-6">
                <div>
                  <span className="card-eyebrow">INVENTORY CONTROL</span>
                  <h2 className="text-xl font-bold text-primary">
                    {editingId ? 'Edit Product Item' : 'Add New Product'}
                  </h2>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 text-secondary hover:text-primary rounded-custom-12 hover:bg-light-card-hover dark:hover:bg-dark-card-hover"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-rose-500/10 border border-status-negative rounded-custom-12 text-sm text-status-negative">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="card-eyebrow">Product Title *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-base w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="card-eyebrow">SKU Code *</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="input-base w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="card-eyebrow">Category *</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input-base w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="card-eyebrow">Unit Price (₹) *</label>
                    <input
                      type="number"
                      value={formData.unitPrice || ''}
                      onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                      className="input-base w-full"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="card-eyebrow">Current Stock Qty *</label>
                    <input
                      type="number"
                      value={formData.currentStock || ''}
                      onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                      className="input-base w-full"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="card-eyebrow">Low Stock Alert Qty *</label>
                    <input
                      type="number"
                      value={formData.minimumStockAlert || ''}
                      onChange={(e) => setFormData({ ...formData, minimumStockAlert: Number(e.target.value) })}
                      className="input-base w-full"
                      min="0"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="card-eyebrow">Warehouse Rack / Location *</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="input-base w-full"
                      placeholder="e.g. Aisle 4, Bay 12, Shelf B"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-light-border dark:border-dark-border">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-primary disabled:opacity-50"
                  >
                    {isSaving ? 'Saving Product...' : 'Save Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {/* Products Table */}
        {isLoading ? (
          <TableSkeleton columns={7} rows={6} />
        ) : (
          <div className="card p-0 overflow-hidden">
            {products.length === 0 ? (
              <div className="text-center py-12 text-secondary">
                <PackageCheck className="w-10 h-10 text-muted mx-auto mb-2 opacity-50" />
                <p className="text-body font-semibold text-primary">No inventory products found</p>
                <p className="text-caption text-muted">Add new products to start tracking stock</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table-base">
                  <thead className="table-header">
                    <tr>
                      <th className="table-cell">Product Details</th>
                      <th className="table-cell">SKU</th>
                      <th className="table-cell">Category</th>
                      <th className="table-cell">Unit Price</th>
                      <th className="table-cell">Stock Level</th>
                      <th className="table-cell">Location</th>
                      <th className="table-cell text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => {
                      const low = isLowStock(product);
                      return (
                        <tr
                          key={product.id}
                          className={`table-row ${low ? 'border-l-4 border-l-status-warning bg-amber-500/5' : ''}`}
                        >
                          <td className="table-cell font-semibold text-primary">{product.name}</td>
                          <td className="table-cell text-caption font-mono text-secondary">{product.sku}</td>
                          <td className="table-cell">
                            <span className="text-xs font-medium px-2.5 py-1 rounded-custom-12 bg-light-card-hover dark:bg-dark-card-hover text-secondary border border-light-border dark:border-dark-border">
                              {product.category}
                            </span>
                          </td>
                          <td className="table-cell font-semibold text-primary">
                            ₹{Number(product.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold ${low ? 'text-status-warning' : 'text-primary'}`}>
                                {product.currentStock}
                              </span>
                              {low && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-status-warning bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                  <AlertTriangle className="w-3 h-3" />
                                  Low Stock
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="table-cell text-caption text-secondary">{product.location}</td>
                          <td className="table-cell text-right">
                            <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <RoleGuard allowedRoles={['WAREHOUSE', 'ADMIN']}>
                                <button
                                  onClick={() => handleEdit(product)}
                                  className="btn-ghost text-accent p-2 hover:bg-accent-soft rounded-custom-12"
                                  title="Edit Product"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </RoleGuard>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
