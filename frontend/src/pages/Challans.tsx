import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, Check, X, ShoppingCart, Minus, AlertCircle, Eye, Printer } from 'lucide-react';
import { Layout } from '../components/Layout';
import { RoleGuard } from '../components/RoleGuard';
import { challanAPI, customerAPI, productAPI } from '../lib/api';
import { Challan, ChallanStatus, Customer, Product } from '../types';
import { TableSkeleton } from '../components/skeletons/TableSkeleton';

export function Challans() {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<ChallanStatus | ''>('');
  const [showForm, setShowForm] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // States for Challan Details Drawer
  const [selectedChallanId, setSelectedChallanId] = useState<string | null>(null);
  const [selectedChallan, setSelectedChallan] = useState<Challan | null>(null);
  const [isLoadingChallan, setIsLoadingChallan] = useState(false);

  const [formData, setFormData] = useState({
    customerId: '',
    items: [{ productId: '', quantity: 1 }],
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [challansRes, customersRes, productsRes] = await Promise.all([
        challanAPI.getAll(50, 0, status),
        customerAPI.getAll(100),
        productAPI.getAll(100),
      ]);
      setChallans(challansRes.data || []);
      setCustomers(customersRes.data || []);
      setProducts(productsRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [status]);

  const loadChallanDetails = async (id: string) => {
    try {
      setIsLoadingChallan(true);
      setError('');
      const response = await challanAPI.getById(id);
      setSelectedChallan(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load challan details');
    } finally {
      setIsLoadingChallan(false);
    }
  };

  useEffect(() => {
    if (selectedChallanId) {
      loadChallanDetails(selectedChallanId);
    } else {
      setSelectedChallan(null);
    }
  }, [selectedChallanId]);

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', quantity: 1 }],
    });
  };

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateQuantity = (index: number, delta: number) => {
    const newItems = [...formData.items];
    const currentQty = newItems[index].quantity || 1;
    newItems[index].quantity = Math.max(1, currentQty + delta);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      if (!formData.customerId) {
        throw new Error('Please select a customer');
      }
      if (formData.items.length === 0 || !formData.items[0].productId) {
        throw new Error('Please select at least one product');
      }

      const payload = {
        customerId: formData.customerId,
        items: formData.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      await challanAPI.create(payload);
      setSuccess('Challan created successfully!');
      loadData();
      setShowForm(false);
      setFormData({
        customerId: '',
        items: [{ productId: '', quantity: 1 }],
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create challan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirm = async (challanId: string) => {
    if (!window.confirm('Confirm this challan? Stock will be deducted automatically.')) return;

    try {
      setError('');
      await challanAPI.confirm(challanId);
      setSuccess('Challan confirmed successfully!');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || err.code || 'Failed to confirm challan');
    }
  };

  const handleCancel = async (challanId: string) => {
    if (!window.confirm('Cancel this challan? Stock will be restored if previously confirmed.')) return;

    try {
      setError('');
      await challanAPI.cancel(challanId);
      setSuccess('Challan cancelled successfully!');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to cancel challan');
    }
  };

  const getStatusBadgeClass = (status: ChallanStatus) => {
    const baseClass = 'status-badge';
    return `${baseClass} status-${status.toLowerCase()}`;
  };

  const getProductDetails = (productId: string) => {
    return products.find((p) => p.id === productId);
  };

  const calculatedTotal = formData.items.reduce((sum, item) => {
    const p = getProductDetails(item.productId);
    return sum + (p ? Number(p.unitPrice) * item.quantity : 0);
  }, 0);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-display text-primary mb-1">Sales Challans</h1>
            <p className="text-body text-secondary">Dispatch challans, stock reserve notes, and order fulfillment</p>
          </div>
          <RoleGuard allowedRoles={['SALES', 'ADMIN']}>
            <button
              onClick={() => {
                setFormData({
                  customerId: '',
                  items: [{ productId: '', quantity: 1 }],
                });
                setShowForm(true);
              }}
              className="btn-primary"
            >
              <Plus className="w-5 h-5" />
              New Sales Challan
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

        {/* Filter bar */}
        <div className="flex items-center justify-between">
          <div>
            <span className="card-eyebrow">FILTER STATUS</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ChallanStatus)}
              className="input-base w-48"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Create Challan Slide-over Form Drawer */}
        {showForm && createPortal(
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50 animate-fade-in">
            <div className="bg-light-card dark:bg-dark-card border-l border-light-border dark:border-dark-border max-w-2xl w-full h-screen md:rounded-l-custom-20 overflow-y-auto animate-slide-over shadow-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-light-border dark:border-dark-border mb-6">
                  <div>
                    <span className="card-eyebrow">SALES DISPATCH BUILDER</span>
                    <h2 className="text-xl font-bold text-primary">Create New Sales Challan</h2>
                  </div>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-2 text-secondary hover:text-primary rounded-custom-12 hover:bg-light-card-hover dark:hover:bg-dark-card-hover"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form id="challan-form" onSubmit={handleSubmit} className="space-y-6">
                  {/* Select Customer */}
                  <div>
                    <label className="card-eyebrow">Select Client Account *</label>
                    <select
                      value={formData.customerId}
                      onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                      className="input-base w-full"
                      required
                    >
                      <option value="">-- Select Customer Account --</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.businessName})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Multi-Product Line Item Mini Cards (frontend.md Form Pattern) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="card-eyebrow">CHALLAN LINE ITEMS *</span>
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="btn-ghost text-xs text-accent"
                      >
                        + Add Another Line Item
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formData.items.map((item, index) => {
                        const productDetails = getProductDetails(item.productId);
                        const available = productDetails?.currentStock || 0;
                        const isStockLow = productDetails && item.quantity > available;

                        return (
                          <div
                            key={index}
                            className="p-4 rounded-custom-12 border border-light-border dark:border-dark-border bg-light-card-hover/50 dark:bg-dark-card-hover/50 space-y-3 transition-colors hover:border-accent/40"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="w-full sm:flex-1">
                                <label className="text-[11px] uppercase tracking-wider text-secondary mb-1 block">
                                  Product Item #{index + 1}
                                </label>
                                <select
                                  value={item.productId}
                                  onChange={(e) => {
                                    const newItems = [...formData.items];
                                    newItems[index].productId = e.target.value;
                                    setFormData({ ...formData, items: newItems });
                                  }}
                                  className="input-base w-full text-xs"
                                  required
                                >
                                  <option value="">-- Choose Product --</option>
                                  {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.name} (Stock: {p.currentStock}, ₹{Number(p.unitPrice).toFixed(2)})
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Quantity & Trash Stepper Container */}
                              <div className="flex items-end gap-2 w-full sm:w-auto">
                                {/* Quantity Stepper */}
                                <div className="flex-1 sm:w-36">
                                  <label className="text-[11px] uppercase tracking-wider text-secondary mb-1 block">
                                    Quantity
                                  </label>
                                  <div className="flex items-center input-base p-1 justify-between">
                                    <button
                                      type="button"
                                      onClick={() => updateQuantity(index, -1)}
                                      className="p-1 text-secondary hover:text-primary rounded-custom-12 hover:bg-accent-soft"
                                    >
                                      <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <input
                                      type="number"
                                      min="1"
                                      value={item.quantity}
                                      onChange={(e) => {
                                        const newItems = [...formData.items];
                                        newItems[index].quantity = parseInt(e.target.value) || 1;
                                        setFormData({ ...formData, items: newItems });
                                      }}
                                      className="w-12 text-center bg-transparent focus:outline-none text-body font-semibold text-primary"
                                      required
                                    />
                                    <button
                                      type="button"
                                      onClick={() => updateQuantity(index, 1)}
                                      className="p-1 text-secondary hover:text-primary rounded-custom-12 hover:bg-accent-soft"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {formData.items.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItem(index)}
                                    className="p-2.5 text-secondary hover:text-status-negative hover:bg-rose-500/10 rounded-custom-12 border border-default sm:border-transparent flex-shrink-0"
                                    title="Remove Item"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Stock Indicator & Line Subtotal */}
                            {productDetails && (
                              <div className="flex items-center justify-between text-xs pt-1 border-t border-light-border-subtle dark:border-dark-border-subtle">
                                <span className={isStockLow ? 'text-status-negative font-semibold flex items-center gap-1' : 'text-muted'}>
                                  {isStockLow && <AlertCircle className="w-3.5 h-3.5" />}
                                  Available stock: {available} units {isStockLow && '(Insufficient Stock!)'}
                                </span>
                                <span className="font-semibold text-primary">
                                  Subtotal: ₹{(Number(productDetails.unitPrice) * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </form>
              </div>

              {/* Sticky Total & Action Buttons Bar (frontend.md specification) */}
              <div className="pt-4 mt-6 border-t border-light-border dark:border-dark-border flex items-center justify-between bg-light-card dark:bg-dark-card p-4 rounded-custom-16">
                <div>
                  <span className="card-eyebrow">ESTIMATED TOTAL</span>
                  <p className="text-xl font-bold text-accent">₹{calculatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="challan-form"
                    disabled={isSaving}
                    className="btn-primary disabled:opacity-50"
                  >
                    {isSaving ? 'Creating...' : 'Issue Sales Challan'}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Table List */}
        {isLoading ? (
          <TableSkeleton columns={7} rows={6} />
        ) : (
          <div className="card p-0 overflow-hidden">
            {challans.length === 0 ? (
              <div className="text-center py-12 text-secondary">
                <ShoppingCart className="w-10 h-10 text-muted mx-auto mb-2 opacity-50" />
                <p className="text-body font-semibold text-primary">No sales challans found</p>
                <p className="text-caption text-muted">Create a new sales challan to track customer dispatches</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table-base">
                  <thead className="table-header">
                    <tr>
                      <th className="table-cell">Challan No.</th>
                      <th className="table-cell">Customer</th>
                      <th className="table-cell">Items Qty</th>
                      <th className="table-cell">Status</th>
                      <th className="table-cell">Created By</th>
                      <th className="table-cell">Date Issued</th>
                      <th className="table-cell text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {challans.map((challan) => (
                      <tr key={challan.id} className="table-row">
                        <td className="table-cell">
                          <span className="font-mono text-sm font-semibold text-primary px-2.5 py-1 rounded-custom-12 bg-accent-soft text-accent">
                            {challan.challanNumber}
                          </span>
                        </td>
                        <td className="table-cell font-semibold text-primary">
                          {challan.customer?.name || '—'}
                          {challan.customer?.businessName && (
                            <span className="block text-caption text-secondary font-normal">
                              {challan.customer.businessName}
                            </span>
                          )}
                        </td>
                        <td className="table-cell font-semibold text-primary">{challan.totalQuantity} items</td>
                        <td className="table-cell">
                          <span className={getStatusBadgeClass(challan.status)}>
                            {challan.status}
                          </span>
                        </td>
                        <td className="table-cell text-caption text-secondary">
                          {challan.creator?.fullName || 'Manager'}
                        </td>
                        <td className="table-cell text-caption text-secondary">
                          {new Date(challan.createdAt).toLocaleDateString()}
                        </td>
                        <td className="table-cell text-right">
                          <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setSelectedChallanId(challan.id)}
                              className="btn-ghost text-accent p-2 hover:bg-accent-soft rounded-custom-12"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <RoleGuard allowedRoles={['SALES', 'ADMIN']}>
                              {challan.status === 'DRAFT' && (
                                <button
                                  onClick={() => handleConfirm(challan.id)}
                                  className="btn-ghost text-status-positive p-2 hover:bg-emerald-500/10 rounded-custom-12"
                                  title="Confirm Challan & Deduct Stock"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                            </RoleGuard>
                            <RoleGuard allowedRoles={['SALES', 'ADMIN']}>
                              {(challan.status === 'DRAFT' || challan.status === 'CONFIRMED') && (
                                <button
                                  onClick={() => handleCancel(challan.id)}
                                  className="btn-ghost text-status-negative p-2 hover:bg-rose-500/10 rounded-custom-12"
                                  title="Cancel Challan"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </RoleGuard>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {/* Challan Details Slide-over Drawer */}
        {selectedChallanId && createPortal(
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50 animate-fade-in">
            <div className="bg-light-card dark:bg-dark-card border-l border-light-border dark:border-dark-border max-w-2xl w-full h-screen md:rounded-l-custom-20 overflow-y-auto animate-slide-over shadow-2xl p-6 flex flex-col justify-between">
              
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-light-border dark:border-dark-border mb-6">
                  <div>
                    <span className="card-eyebrow">CHALLAN RECEIPT AUDIT</span>
                    <h2 className="text-xl font-bold text-primary">
                      {selectedChallan ? selectedChallan.challanNumber : 'Loading Challan...'}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedChallanId(null)}
                    className="p-2 text-secondary hover:text-primary rounded-custom-12 hover:bg-light-card-hover dark:hover:bg-dark-card-hover print:hidden"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {isLoadingChallan || !selectedChallan ? (
                  <div className="py-24 text-center">
                    <TableSkeleton columns={3} rows={4} />
                  </div>
                ) : (
                  <div className="space-y-6" id="print-area">
                    {/* Basic details grid */}
                    <div className="grid grid-cols-2 gap-4 bg-light-card-hover/50 dark:bg-dark-card-hover/50 p-4 rounded-custom-12 border border-light-border dark:border-dark-border">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-secondary">Customer Name</span>
                        <p className="text-sm font-semibold text-primary">{selectedChallan.customer?.name || '—'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-secondary">Business Name</span>
                        <p className="text-sm font-semibold text-primary">{selectedChallan.customer?.businessName || '—'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-secondary">Challan Status</span>
                        <div>
                          <span className={getStatusBadgeClass(selectedChallan.status)}>
                            {selectedChallan.status}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-secondary">Created By</span>
                        <p className="text-sm font-semibold text-primary">{selectedChallan.creator?.fullName || 'Manager'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-secondary">Date Issued</span>
                        <p className="text-sm font-semibold text-primary">{new Date(selectedChallan.createdAt).toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-secondary">Total Dispatch Qty</span>
                        <p className="text-sm font-semibold text-primary">{selectedChallan.totalQuantity} items</p>
                      </div>
                    </div>

                    {/* Dispatch Items Snapshots */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <ShoppingCart className="w-4 h-4 text-accent" />
                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Dispatch Item Snapshot</h3>
                      </div>
                      
                      <div className="overflow-hidden border border-light-border dark:border-dark-border rounded-custom-12">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-light-card-hover dark:bg-dark-card-hover border-b border-light-border dark:border-dark-border text-secondary font-bold uppercase text-[10px] tracking-wider">
                              <th className="p-3">Product Description (Snapshot)</th>
                              <th className="p-3 text-right">Price</th>
                              <th className="p-3 text-right">Qty</th>
                              <th className="p-3 text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(selectedChallan.items || []).map((item) => (
                              <tr key={item.id} className="border-b border-light-border dark:border-dark-border last:border-0 hover:bg-light-card-hover/20 dark:hover:bg-dark-card-hover/20">
                                  <td className="p-3">
                                    <p className="font-semibold text-primary">{item.productNameSnapshot}</p>
                                    <p className="text-[10px] text-muted">SKU: {item.skuSnapshot}</p>
                                  </td>
                                  <td className="p-3 text-right text-secondary">₹{Number(item.unitPriceSnapshot).toLocaleString()}</td>
                                  <td className="p-3 text-right font-medium text-primary">{item.quantity}</td>
                                  <td className="p-3 text-right font-bold text-primary">₹{Number(item.total).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Financial summary */}
                    <div className="flex justify-between items-center p-4 bg-accent/5 rounded-custom-12 border border-accent/20">
                      <div>
                        <span className="text-caption text-secondary font-medium">Estimated Gross Total</span>
                        <p className="text-[10px] text-muted">Stock deduction calculations based on dispatch snapshot</p>
                      </div>
                      <p className="text-xl font-bold text-accent">
                        ₹{(selectedChallan.items || []).reduce((sum, item) => sum + Number(item.total), 0).toLocaleString()}
                      </p>
                    </div>

                  </div>
                )}
              </div>

              <div className="pt-4 mt-6 border-t border-light-border dark:border-dark-border flex gap-3 justify-end print:hidden">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-secondary text-xs flex items-center gap-1.5"
                  title="Print / Save PDF"
                >
                  <Printer className="w-4 h-4" />
                  Print PDF
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedChallanId(null)}
                  className="btn-secondary text-xs"
                >
                  Close Receipt
                </button>
                <RoleGuard allowedRoles={['SALES', 'ADMIN']}>
                  {selectedChallan && selectedChallan.status === 'DRAFT' && (
                    <button
                      onClick={() => handleConfirm(selectedChallan.id)}
                      className="btn-primary text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Confirm & Deduct Stock
                    </button>
                  )}
                  {selectedChallan && (selectedChallan.status === 'DRAFT' || selectedChallan.status === 'CONFIRMED') && (
                    <button
                      onClick={() => handleCancel(selectedChallan.id)}
                      className="btn-primary text-xs bg-rose-600 hover:bg-rose-700 text-white"
                    >
                      Cancel Challan
                    </button>
                  )}
                </RoleGuard>
              </div>

            </div>
          </div>,
          document.body
        )}
      </div>
    </Layout>
  );
}
