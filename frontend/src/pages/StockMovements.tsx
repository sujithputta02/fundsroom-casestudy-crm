// Stock movements audit log component
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Download, ArrowDownLeft, ArrowUpRight, History, Plus, X } from 'lucide-react';
import { Layout } from '../components/Layout';
import { stockAPI, productAPI } from '../lib/api';
import { StockMovement, Product } from '../types';
import { TableSkeleton } from '../components/skeletons/TableSkeleton';
import { RoleGuard } from '../components/RoleGuard';

export function StockMovements() {
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [movementFilter, setMovementFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [movementLimit, setMovementLimit] = useState(50);
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    productId: '',
    quantityChanged: 1,
    reason: '',
  });

  const loadStockMovements = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await stockAPI.getAll(
        movementLimit,
        0,
        undefined,
        movementFilter !== 'ALL' ? movementFilter : undefined
      );
      setStockMovements(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load stock movements');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productAPI.getAll(100);
      setProducts(response.data || []);
    } catch (err: any) {
      console.error('Failed to load products for form dropdown:', err);
    }
  };

  useEffect(() => {
    loadStockMovements();
  }, [movementFilter, movementLimit]);

  useEffect(() => {
    if (showForm) {
      loadProducts();
    }
  }, [showForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      if (!formData.productId) {
        throw new Error('Please select a product');
      }
      if (formData.quantityChanged <= 0) {
        throw new Error('Quantity must be greater than zero');
      }
      if (!formData.reason.trim()) {
        throw new Error('Reason is required');
      }

      await stockAPI.create({
        productId: formData.productId,
        quantityChanged: Number(formData.quantityChanged),
        movementType: 'IN',
        reason: formData.reason.trim(),
      });

      setSuccess('Stock IN recorded successfully! Product inventory updated.');
      setShowForm(false);
      setFormData({ productId: '', quantityChanged: 1, reason: '' });
      
      // Reload stock movements to show the new entry
      await loadStockMovements();
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to record stock movement');
    } finally {
      setIsSaving(false);
    }
  };

  const exportMovements = () => {
    const csv = [
      ['Product', 'SKU', 'Quantity', 'Type', 'Reason', 'Created By', 'Date'],
      ...stockMovements.map((movement) => [
        movement.product?.name || 'Product',
        movement.product?.sku || '—',
        movement.quantityChanged,
        movement.movementType,
        movement.reason,
        movement.creator?.fullName || 'Manager',
        new Date(movement.createdAt).toLocaleDateString(),
      ]),
    ];
    const csvContent = csv.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-movements-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-display text-primary mb-1">Stock Movements</h1>
            <p className="text-body text-secondary">Verify and log inventory transactions, receipts, and allocations</p>
          </div>
          <RoleGuard allowedRoles={['WAREHOUSE', 'ADMIN']}>
            <button
              onClick={() => {
                setFormData({ productId: '', quantityChanged: 1, reason: '' });
                setShowForm(true);
              }}
              className="btn-primary"
            >
              <Plus className="w-5 h-5" />
              Record Stock IN
            </button>
          </RoleGuard>
        </div>

        {/* Status Banners */}
        {error && (
          <div className="p-4 bg-rose-500/10 border border-status-negative rounded-custom-12 text-sm text-status-negative flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="p-1 hover:bg-rose-500/20 rounded-custom-12">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {success && (
          <div className="p-4 bg-emerald-500/10 border border-status-positive rounded-custom-12 text-sm text-status-positive flex items-center justify-between">
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="p-1 hover:bg-emerald-500/20 rounded-custom-12">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gap-card items-end">
          <div>
            <span className="card-eyebrow">MOVEMENT TYPE</span>
            <select
              value={movementFilter}
              onChange={(e) => setMovementFilter(e.target.value as 'ALL' | 'IN' | 'OUT')}
              className="input-base w-full"
            >
              <option value="ALL">All Movements (IN & OUT)</option>
              <option value="IN">Stock IN (+)</option>
              <option value="OUT">Stock OUT (-)</option>
            </select>
          </div>
          <div>
            <span className="card-eyebrow">RECORDS LIMIT</span>
            <select
              value={movementLimit}
              onChange={(e) => setMovementLimit(parseInt(e.target.value))}
              className="input-base w-full"
            >
              <option value={10}>10 records</option>
              <option value={25}>25 records</option>
              <option value={50}>50 records</option>
              <option value={100}>100 records</option>
            </select>
          </div>
          <div>
            <button
              onClick={exportMovements}
              disabled={stockMovements.length === 0}
              className="btn-secondary w-full"
            >
              <Download className="w-4 h-4" />
              Export CSV Audit
            </button>
          </div>
        </div>

        {/* Record Stock IN Form Drawer */}
        {showForm && createPortal(
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50 animate-fade-in">
            <div className="bg-light-card dark:bg-dark-card border-l border-light-border dark:border-dark-border max-w-lg w-full h-screen md:rounded-l-custom-20 overflow-y-auto animate-slide-over shadow-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-light-border dark:border-dark-border mb-6">
                  <div>
                    <span className="card-eyebrow">RECEIPTS LOG</span>
                    <h2 className="text-xl font-bold text-primary">Record Stock IN (Restock)</h2>
                  </div>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-2 text-secondary hover:text-primary rounded-custom-12 hover:bg-light-card-hover dark:hover:bg-dark-card-hover"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form id="stock-in-form" onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="card-eyebrow">Select Product *</label>
                    <select
                      value={formData.productId}
                      onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                      className="input-base w-full"
                      required
                    >
                      <option value="">-- Choose Product to Receive --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (SKU: {p.sku} | Current: {p.currentStock})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="card-eyebrow">Quantity to Add *</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.quantityChanged}
                      onChange={(e) => setFormData({ ...formData, quantityChanged: e.target.value === '' ? '' as any : parseInt(e.target.value) })}
                      className="input-base w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="card-eyebrow">Reason / Reference *</label>
                    <textarea
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="input-base w-full resize-none"
                      rows={4}
                      placeholder="e.g. Received from Supplier purchase order #PO-2026, Restock of shelves..."
                      required
                    />
                  </div>
                </form>
              </div>

              <div className="pt-4 mt-6 border-t border-light-border dark:border-dark-border flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="stock-in-form"
                  disabled={isSaving}
                  className="btn-primary disabled:opacity-50"
                >
                  {isSaving ? 'Recording Receipts...' : 'Log Stock IN'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* History Table */}
        {isLoading ? (
          <TableSkeleton columns={7} rows={6} />
        ) : (
          <div className="card p-0 overflow-hidden">
            {stockMovements.length === 0 ? (
              <div className="text-center py-12 text-secondary">
                <History className="w-10 h-10 text-muted mx-auto mb-2 opacity-50" />
                <p className="text-body font-semibold text-primary">No stock movement logs found</p>
                <p className="text-caption text-muted">Stock movements appear automatically when items are received or dispatched</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table-base">
                  <thead className="table-header">
                    <tr>
                      <th className="table-cell">Product</th>
                      <th className="table-cell">SKU</th>
                      <th className="table-cell">Direction</th>
                      <th className="table-cell">Quantity</th>
                      <th className="table-cell">Reason / Reference</th>
                      <th className="table-cell">Operator</th>
                      <th className="table-cell">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockMovements.map((movement) => {
                      const isIn = movement.movementType === 'IN';
                      return (
                        <tr key={movement.id} className="table-row">
                          <td className="table-cell font-semibold text-primary">
                            {movement.product?.name || 'Product'}
                          </td>
                          <td className="table-cell font-mono text-caption text-secondary">
                            {movement.product?.sku || '—'}
                          </td>
                          <td className="table-cell">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-bold ${
                                isIn
                                  ? 'bg-emerald-500/10 text-status-positive border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-status-negative border border-rose-500/20'
                              }`}
                            >
                              {isIn ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                              {isIn ? 'STOCK IN' : 'STOCK OUT'}
                            </span>
                          </td>
                          <td className="table-cell font-bold text-primary">
                            {isIn ? `+${movement.quantityChanged}` : `-${movement.quantityChanged}`}
                          </td>
                          <td className="table-cell text-body text-secondary max-w-xs truncate" title={movement.reason}>
                            {movement.reason}
                          </td>
                          <td className="table-cell text-caption text-secondary">
                            {movement.creator?.fullName || 'Manager'}
                          </td>
                          <td className="table-cell text-caption text-muted">
                            {new Date(movement.createdAt).toLocaleString()}
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
