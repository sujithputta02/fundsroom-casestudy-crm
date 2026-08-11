import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Edit, Trash2, X, Users as UsersIcon, Key, Shield } from 'lucide-react';
import { Layout } from '../components/Layout';
import { RoleGuard } from '../components/RoleGuard';
import { userAPI } from '../lib/api';
import { TableSkeleton } from '../components/skeletons/TableSkeleton';

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [resetPasswordId, setResetPasswordId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'SALES' as User['role'],
    isActive: true,
  });
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await userAPI.getAll(50, 0);
      setUsers(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      if (editingId) {
        await userAPI.update(editingId, {
          email: formData.email,
          fullName: formData.fullName,
          role: formData.role,
          isActive: formData.isActive,
        });
        setSuccess('User updated successfully!');
      } else {
        await userAPI.create(formData);
        setSuccess('User created successfully!');
      }
      
      loadUsers();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        fullName: '',
        role: 'SALES',
        isActive: true,
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save user');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!window.confirm(`Delete user "${userName}"? This action cannot be undone.`)) return;

    try {
      setError('');
      await userAPI.delete(userId);
      setSuccess('User deleted successfully!');
      loadUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordId || !newPassword) return;

    try {
      setError('');
      setIsSaving(true);
      await userAPI.resetPassword(resetPasswordId, newPassword);
      setSuccess('Password reset successfully!');
      setShowPasswordModal(false);
      setResetPasswordId(null);
      setNewPassword('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadgeClass = (role: User['role']) => {
    const baseClass = 'text-xs font-medium px-2.5 py-1 rounded-custom-12 border';
    switch (role) {
      case 'ADMIN':
        return `${baseClass} bg-rose-500/10 text-rose-600 border-rose-500/20`;
      case 'SALES':
        return `${baseClass} bg-blue-500/10 text-blue-600 border-blue-500/20`;
      case 'WAREHOUSE':
        return `${baseClass} bg-emerald-500/10 text-emerald-600 border-emerald-500/20`;
      case 'ACCOUNTS':
        return `${baseClass} bg-amber-500/10 text-amber-600 border-amber-500/20`;
      default:
        return `${baseClass} bg-gray-500/10 text-gray-600 border-gray-500/20`;
    }
  };

  return (
    <Layout>
      <RoleGuard allowedRoles={['ADMIN']}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-display text-primary mb-1">User Management</h1>
              <p className="text-body text-secondary">Manage system users, roles, and permissions</p>
            </div>
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  username: '',
                  email: '',
                  password: '',
                  fullName: '',
                  role: 'SALES',
                  isActive: true,
                });
                setShowForm(true);
              }}
              className="btn-primary"
            >
              <Plus className="w-5 h-5" />
              Add User
            </button>
          </div>

          {/* Status Messages */}
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

          {/* User Form Modal */}
          {showForm && createPortal(
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
              <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-custom-16 shadow-2xl p-6 animate-fade-in">
                <div className="flex items-center justify-between pb-4 border-b border-light-border dark:border-dark-border mb-6">
                  <div>
                    <span className="card-eyebrow">USER MANAGEMENT</span>
                    <h2 className="text-xl font-bold text-primary">
                      {editingId ? 'Edit User Account' : 'Add New User'}
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-2 text-secondary hover:text-primary rounded-custom-12 hover:bg-light-card-hover dark:hover:bg-dark-card-hover"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {!editingId && (
                      <div>
                        <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-2">Username *</label>
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          className="input-base w-full"
                          required
                          disabled={!!editingId}
                        />
                      </div>
                    )}
                    <div className={!editingId ? '' : 'md:col-span-2'}>
                      <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-2">Email Address *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input-base w-full"
                        required
                      />
                    </div>
                    {!editingId && (
                      <div>
                        <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-2">Password *</label>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="input-base w-full"
                          required={!editingId}
                          minLength={6}
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="input-base w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-2">Role *</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                        className="input-base w-full"
                        required
                      >
                        <option value="SALES">Sales</option>
                        <option value="WAREHOUSE">Warehouse</option>
                        <option value="ACCOUNTS">Accounts</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="isActive" className="text-sm text-primary">
                      Active account (user can log in)
                    </label>
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
                      {isSaving ? 'Saving...' : editingId ? 'Update User' : 'Create User'}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body
          )}

          {/* Password Reset Modal */}
          {showPasswordModal && createPortal(
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
              <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border max-w-md w-full rounded-custom-16 shadow-2xl p-6 animate-fade-in">
                <div className="flex items-center justify-between pb-4 border-b border-light-border dark:border-dark-border mb-6">
                  <div>
                    <span className="card-eyebrow">SECURITY</span>
                    <h2 className="text-xl font-bold text-primary">Reset Password</h2>
                  </div>
                  <button
                    onClick={() => {
                      setShowPasswordModal(false);
                      setResetPasswordId(null);
                      setNewPassword('');
                    }}
                    className="p-2 text-secondary hover:text-primary rounded-custom-12 hover:bg-light-card-hover dark:hover:bg-dark-card-hover"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-2">New Password *</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-base w-full"
                      placeholder="Enter new password (min 6 characters)"
                      minLength={6}
                      required
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-light-border dark:border-dark-border">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordModal(false);
                        setResetPasswordId(null);
                        setNewPassword('');
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleResetPassword}
                      disabled={isSaving || !newPassword || newPassword.length < 6}
                      className="btn-primary disabled:opacity-50"
                    >
                      {isSaving ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* Users Table */}
          {isLoading ? (
            <TableSkeleton columns={6} rows={6} />
          ) : (
            <div className="card p-0 overflow-hidden">
              {users.length === 0 ? (
                <div className="text-center py-12 text-secondary">
                  <UsersIcon className="w-10 h-10 text-muted mx-auto mb-2 opacity-50" />
                  <p className="text-body font-semibold text-primary">No users found</p>
                  <p className="text-caption text-muted">Add users to manage system access</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table-base">
                    <thead className="table-header">
                      <tr>
                        <th className="table-cell">User</th>
                        <th className="table-cell">Role</th>
                        <th className="table-cell">Status</th>
                        <th className="table-cell">Created</th>
                        <th className="table-cell text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="table-row">
                          <td className="table-cell">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-accent-soft text-accent font-bold text-xs flex items-center justify-center flex-shrink-0">
                                {user.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-primary">{user.fullName}</p>
                                <p className="text-caption text-secondary">@{user.username}</p>
                                <p className="text-caption text-muted">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="table-cell">
                            <span className={getRoleBadgeClass(user.role)}>
                              <Shield className="w-3 h-3 inline mr-1" />
                              {user.role}
                            </span>
                          </td>
                          <td className="table-cell">
                            <span className={`status-badge ${user.isActive ? 'status-active' : 'status-inactive'}`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="table-cell text-caption text-secondary">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="table-cell text-right">
                            <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEdit(user)}
                                className="btn-ghost text-accent p-2 hover:bg-accent-soft rounded-custom-12"
                                title="Edit User"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setResetPasswordId(user.id);
                                  setShowPasswordModal(true);
                                }}
                                className="btn-ghost text-amber-600 p-2 hover:bg-amber-500/10 rounded-custom-12"
                                title="Reset Password"
                              >
                                <Key className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(user.id, user.fullName)}
                                className="btn-ghost text-status-negative p-2 hover:bg-rose-500/10 rounded-custom-12"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
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
          )}
        </div>
      </RoleGuard>
    </Layout>
  );
}