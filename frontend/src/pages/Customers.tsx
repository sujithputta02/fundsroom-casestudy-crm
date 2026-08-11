import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Search, Edit, X, Building2, MessageSquare, Clock, ClipboardList, Eye } from 'lucide-react';
import { Layout } from '../components/Layout';
import { RoleGuard } from '../components/RoleGuard';
import { customerAPI } from '../lib/api';
import { Customer, CustomerStatus, CustomerType } from '../types';
import { TableSkeleton } from '../components/skeletons/TableSkeleton';

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<CustomerStatus | ''>('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    email: '',
    businessName: '',
    gstNumber: '',
    customerType: 'RETAIL' as CustomerType,
    address: '',
    status: 'LEAD' as CustomerStatus,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // States for Customer Details Drawer
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [isLoadingFollowUps, setIsLoadingFollowUps] = useState(false);
  const [followUpNote, setFollowUpNote] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [followUpStatus, setFollowUpStatus] = useState<CustomerStatus>('LEAD');

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      const response = await customerAPI.getAll(20, 0, search, status);
      setCustomers(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadCustomers, 300);
    return () => clearTimeout(timer);
  }, [search, status]);

  const loadCustomerDetails = async (id: string) => {
    try {
      setIsLoadingFollowUps(true);
      setError('');
      const [customerRes, followUpsRes] = await Promise.all([
        customerAPI.getById(id),
        customerAPI.getFollowUps(id),
      ]);
      setSelectedCustomer(customerRes.data);
      setFollowUps(followUpsRes.data || []);
      if (customerRes.data) {
        setFollowUpStatus(customerRes.data.status);
        if (customerRes.data.followUpDate) {
          setNextFollowUpDate(new Date(customerRes.data.followUpDate).toISOString().split('T')[0]);
        } else {
          setNextFollowUpDate('');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load customer details');
    } finally {
      setIsLoadingFollowUps(false);
    }
  };

  useEffect(() => {
    if (selectedCustomerId) {
      loadCustomerDetails(selectedCustomerId);
    } else {
      setSelectedCustomer(null);
      setFollowUps([]);
    }
  }, [selectedCustomerId]);

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) return;
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      if (!followUpNote.trim()) {
        throw new Error('Follow-up note is required');
      }

      await customerAPI.addFollowUp(selectedCustomerId, followUpNote.trim());
      
      await customerAPI.update(selectedCustomerId, {
        status: followUpStatus,
        followUpDate: nextFollowUpDate ? new Date(nextFollowUpDate).toISOString() : null,
        notes: followUpNote.trim(),
      });

      setFollowUpNote('');
      setSuccess('Follow-up recorded successfully!');
      loadCustomerDetails(selectedCustomerId);
      loadCustomers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to record follow-up');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      if (editingId) {
        await customerAPI.update(editingId, formData);
      } else {
        await customerAPI.create(formData);
      }
      loadCustomers();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: '',
        mobileNumber: '',
        email: '',
        businessName: '',
        gstNumber: '',
        customerType: 'RETAIL',
        address: '',
        status: 'LEAD',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save customer');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingId(customer.id);
    setFormData({
      name: customer.name,
      mobileNumber: customer.mobileNumber,
      email: customer.email,
      businessName: customer.businessName,
      gstNumber: customer.gstNumber || '',
      customerType: customer.customerType,
      address: customer.address,
      status: customer.status,
    });
    setShowForm(true);
  };

  const getStatusBadgeClass = (status: CustomerStatus) => {
    const baseClass = 'status-badge';
    return `${baseClass} status-${status.toLowerCase()}`;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-display text-primary mb-1">Customer CRM</h1>
            <p className="text-body text-secondary">Manage client accounts, lead statuses, and contact details</p>
          </div>
          <RoleGuard allowedRoles={['SALES', 'ADMIN']}>
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  name: '',
                  mobileNumber: '',
                  email: '',
                  businessName: '',
                  gstNumber: '',
                  customerType: 'RETAIL',
                  address: '',
                  status: 'LEAD',
                });
                setShowForm(true);
              }}
              className="btn-primary"
            >
              <Plus className="w-5 h-5" />
              Add Customer
            </button>
          </RoleGuard>
        </div>

        {/* Status Banners */}
        {error && !showForm && !selectedCustomerId && (
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gap-card">
          <div className="md:col-span-2">
            <span className="card-eyebrow">SEARCH CLIENTS</span>
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-secondary" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by client name, email, or mobile..."
                className="input-base pl-10 w-full"
              />
            </div>
          </div>
          <div>
            <span className="card-eyebrow">FILTER BY STATUS</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CustomerStatus)}
              className="input-base w-full"
            >
              <option value="">All Statuses</option>
              <option value="LEAD">Lead</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* Form Slide-over Drawer / Modal */}
        {showForm && createPortal(
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50 animate-fade-in">
            <div className="bg-light-card dark:bg-dark-card border-l border-light-border dark:border-dark-border max-w-xl w-full h-screen md:rounded-l-custom-20 overflow-y-auto animate-slide-over shadow-2xl p-6 flex flex-col">
              <div className="flex items-center justify-between pb-4 border-b border-light-border dark:border-dark-border mb-6">
                <div>
                  <span className="card-eyebrow">CRM MANAGEMENT</span>
                  <h2 className="text-xl font-bold text-primary">
                    {editingId ? 'Edit Customer Record' : 'Add New Customer'}
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

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="card-eyebrow">Contact Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-base w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="card-eyebrow">Mobile Number *</label>
                    <input
                      type="text"
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                      className="input-base w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="card-eyebrow">Email Address *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-base w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="card-eyebrow">Business Name *</label>
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="input-base w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="card-eyebrow">GSTIN Number</label>
                    <input
                      type="text"
                      value={formData.gstNumber}
                      onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                      className="input-base w-full"
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <label className="card-eyebrow">Customer Type *</label>
                    <select
                      value={formData.customerType}
                      onChange={(e) => setFormData({ ...formData, customerType: e.target.value as CustomerType })}
                      className="input-base w-full"
                    >
                      <option value="RETAIL">Retail</option>
                      <option value="WHOLESALE">Wholesale</option>
                      <option value="DISTRIBUTOR">Distributor</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="card-eyebrow">Account Status *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerStatus })}
                      className="input-base w-full"
                    >
                      <option value="LEAD">Lead</option>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="card-eyebrow">Billing & Shipping Address *</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="input-base w-full"
                      rows={3}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-light-border dark:border-dark-border mt-8">
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
                    {isSaving ? 'Saving Customer...' : 'Save Customer'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {/* Customer Table */}
        {isLoading ? (
          <TableSkeleton columns={6} rows={6} />
        ) : (
          <div className="card p-0 overflow-hidden">
            {customers.length === 0 ? (
              <div className="text-center py-12 text-secondary">
                <Building2 className="w-10 h-10 text-muted mx-auto mb-2 opacity-50" />
                <p className="text-body font-semibold text-primary">No customers found</p>
                <p className="text-caption text-muted">Try adjusting search query or filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table-base">
                  <thead className="table-header">
                    <tr>
                      <th className="table-cell">Customer</th>
                      <th className="table-cell">Contact Info</th>
                      <th className="table-cell">Type</th>
                      <th className="table-cell">GSTIN</th>
                      <th className="table-cell">Status</th>
                      <th className="table-cell text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer.id} className="table-row">
                        <td className="table-cell">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-accent-soft text-accent font-bold text-xs flex items-center justify-center flex-shrink-0">
                              {customer.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-primary">{customer.name}</p>
                              <p className="text-caption text-secondary">{customer.businessName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell">
                          <p className="text-body text-primary">{customer.mobileNumber}</p>
                          <p className="text-caption text-muted">{customer.email}</p>
                        </td>
                        <td className="table-cell">
                          <span className="text-xs font-medium px-2.5 py-1 rounded-custom-12 bg-light-card-hover dark:bg-dark-card-hover text-secondary border border-light-border dark:border-dark-border">
                            {customer.customerType}
                          </span>
                        </td>
                        <td className="table-cell text-caption text-secondary">
                          {customer.gstNumber || '—'}
                        </td>
                        <td className="table-cell">
                          <span className={getStatusBadgeClass(customer.status)}>
                            {customer.status}
                          </span>
                        </td>
                        <td className="table-cell text-right">
                          <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setSelectedCustomerId(customer.id)}
                              className="btn-ghost text-accent p-2 hover:bg-accent-soft rounded-custom-12"
                              title="View CRM Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <RoleGuard allowedRoles={['SALES', 'ADMIN']}>
                              <button
                                onClick={() => handleEdit(customer)}
                                className="btn-ghost text-accent p-2 hover:bg-accent-soft rounded-custom-12"
                                title="Edit Customer"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
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
        {/* Customer Details Slide-over Drawer */}
        {selectedCustomerId && createPortal(
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50 animate-fade-in">
            <div className="bg-light-card dark:bg-dark-card border-l border-light-border dark:border-dark-border max-w-2xl w-full h-screen md:rounded-l-custom-20 overflow-y-auto animate-slide-over shadow-2xl p-6 flex flex-col justify-between">
              
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-light-border dark:border-dark-border mb-6">
                  <div>
                    <span className="card-eyebrow">CUSTOMER CRM PROFILE</span>
                    <h2 className="text-xl font-bold text-primary">
                      {selectedCustomer ? selectedCustomer.name : 'Loading Profile...'}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedCustomerId(null)}
                    className="p-2 text-secondary hover:text-primary rounded-custom-12 hover:bg-light-card-hover dark:hover:bg-dark-card-hover"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {isLoadingFollowUps || !selectedCustomer ? (
                  <div className="py-24 text-center">
                    <TableSkeleton columns={3} rows={4} />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Basic details grid */}
                    <div className="grid grid-cols-2 gap-4 bg-light-card-hover/50 dark:bg-dark-card-hover/50 p-4 rounded-custom-12 border border-light-border dark:border-dark-border">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-secondary">Business Name</span>
                        <p className="text-sm font-semibold text-primary">{selectedCustomer.businessName}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-secondary">GST Number</span>
                        <p className="text-sm font-semibold text-primary">{selectedCustomer.gstNumber || '—'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-secondary">Mobile Number</span>
                        <p className="text-sm font-semibold text-primary">{selectedCustomer.mobileNumber}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-secondary">Email Address</span>
                        <p className="text-sm font-semibold text-primary">{selectedCustomer.email}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-secondary">Account Status</span>
                        <div>
                          <span className={getStatusBadgeClass(selectedCustomer.status)}>
                            {selectedCustomer.status}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-secondary">Customer Type</span>
                        <p className="text-sm font-semibold text-primary">{selectedCustomer.customerType}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] uppercase font-bold text-secondary">Billing & Shipping Address</span>
                        <p className="text-sm text-primary">{selectedCustomer.address}</p>
                      </div>
                    </div>

                    {/* CRM followups timeline */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <ClipboardList className="w-4 h-4 text-accent" />
                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider">CRM Activity & Notes Log</h3>
                      </div>
                      
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {followUps.length === 0 ? (
                          <div className="p-4 text-center bg-light-card-hover/20 dark:bg-dark-card-hover/20 rounded-custom-12 border border-dashed border-light-border dark:border-dark-border text-xs text-secondary">
                            <MessageSquare className="w-6 h-6 mx-auto mb-1.5 opacity-40 text-muted" />
                            No activity comments logged yet for this account
                          </div>
                        ) : (
                          followUps.map((log: any) => (
                            <div key={log.id} className="p-3 bg-light-card-hover/30 dark:bg-dark-card-hover/30 rounded-custom-12 border border-light-border dark:border-dark-border flex flex-col space-y-1.5 text-xs">
                              <p className="text-body text-primary">{log.note}</p>
                              <div className="flex justify-between items-center text-[10px] text-muted pt-1 border-t border-light-border-subtle dark:border-dark-border-subtle">
                                <span className="font-semibold text-secondary">By: {log.creator?.fullName || 'Manager'}</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(log.createdAt).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Follow-up / Status Update Form (SALES/ADMIN only) */}
                    <RoleGuard allowedRoles={['SALES', 'ADMIN']}>
                      <div className="border-t border-light-border dark:border-dark-border pt-4">
                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-3">Log Follow-up Activity</h3>
                        <form id="followup-form" onSubmit={handleAddFollowUp} className="space-y-3">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-secondary mb-1 block">Activity Comment / Note *</label>
                            <textarea
                              value={followUpNote}
                              onChange={(e) => setFollowUpNote(e.target.value)}
                              className="input-base w-full resize-none text-xs"
                              rows={3}
                              placeholder="Enter details of conversation or next steps..."
                              required
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] uppercase font-bold text-secondary mb-1 block font-semibold">Update Account Status</label>
                              <select
                                value={followUpStatus}
                                onChange={(e) => setFollowUpStatus(e.target.value as CustomerStatus)}
                                className="input-base w-full text-xs"
                              >
                                <option value="LEAD">Lead</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] uppercase font-bold text-secondary mb-1 block font-semibold">Next Follow-up Date</label>
                              <input
                                type="date"
                                value={nextFollowUpDate}
                                onChange={(e) => setNextFollowUpDate(e.target.value)}
                                className="input-base w-full text-xs"
                              />
                            </div>
                          </div>
                        </form>
                      </div>
                    </RoleGuard>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-6 border-t border-light-border dark:border-dark-border flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedCustomerId(null)}
                  className="btn-secondary text-xs"
                >
                  Close Profile
                </button>
                <RoleGuard allowedRoles={['SALES', 'ADMIN']}>
                  {selectedCustomer && (
                    <button
                      type="submit"
                      form="followup-form"
                      disabled={isSaving}
                      className="btn-primary text-xs disabled:opacity-50"
                    >
                      {isSaving ? 'Logging...' : 'Log Activity Note'}
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
