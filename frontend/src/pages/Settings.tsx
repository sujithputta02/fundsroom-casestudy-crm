import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';

export function Settings() {
  const { user, updateSettings, changePassword } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences'>('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [preferencesError, setPreferencesError] = useState('');
  const [preferencesSuccess, setPreferencesSuccess] = useState('');
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    theme: user?.theme || 'dark',
    enableStockAlerts: user?.enableStockAlerts ?? true,
  });


  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordForm.currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    if (!passwordForm.newPassword) {
      setPasswordError('New password is required');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password');
    }
  };

  const handlePreferencesSave = async () => {
    setPreferencesError('');
    setPreferencesSuccess('');
    setIsSavingPreferences(true);

    try {
      await updateSettings(preferences.theme, preferences.enableStockAlerts);
      if (preferences.theme !== theme) {
        toggleTheme();
      }
      setPreferencesSuccess('Preferences saved successfully!');
      setTimeout(() => setPreferencesSuccess(''), 3000);
    } catch (err: any) {
      setPreferencesError(err.message || 'Failed to save preferences');
    } finally {
      setIsSavingPreferences(false);
    }
  };



  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-display text-primary mb-1">System Settings</h1>
          <p className="text-body text-secondary">Manage your operator credentials, application theme, and stock movement logs</p>
        </div>

        {/* Navigation Tabs */}
        <div className="card p-2 border-b border-default">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2.5 rounded-custom-12 font-medium text-sm transition-all ${
                activeTab === 'profile'
                  ? 'bg-accent-soft text-accent shadow-sm'
                  : 'text-secondary hover:text-primary hover:bg-light-card-hover dark:hover:bg-dark-card-hover'
              }`}
            >
              Account Profile
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-4 py-2.5 rounded-custom-12 font-medium text-sm transition-all ${
                activeTab === 'preferences'
                  ? 'bg-accent-soft text-accent shadow-sm'
                  : 'text-secondary hover:text-primary hover:bg-light-card-hover dark:hover:bg-dark-card-hover'
              }`}
            >
              System Preferences
            </button>

          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gap-card">
            <div className="card">
              <span className="card-eyebrow">OPERATOR INFO</span>
              <h2 className="card-title mb-6">User Account Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="card-eyebrow">Full Name</label>
                  <input
                    type="text"
                    value={user?.fullName || ''}
                    disabled
                    className="input-base w-full opacity-75 cursor-not-allowed font-medium"
                  />
                </div>
                <div>
                  <label className="card-eyebrow">Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="input-base w-full opacity-75 cursor-not-allowed font-medium"
                  />
                </div>
                <div>
                  <label className="card-eyebrow">Username Handle</label>
                  <input
                    type="text"
                    value={user?.username || ''}
                    disabled
                    className="input-base w-full opacity-75 cursor-not-allowed font-medium"
                  />
                </div>
                <div>
                  <label className="card-eyebrow">Assigned Role</label>
                  <div className="px-3 py-1.5 bg-accent-soft rounded-custom-12 inline-flex items-center gap-2 border border-accent/20">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-xs font-bold text-accent uppercase tracking-wider">{user?.role}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <span className="card-eyebrow">SECURITY</span>
              <h2 className="card-title mb-6">Update Password</h2>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                {passwordError && (
                  <div className="p-3 bg-rose-500/10 border border-status-negative rounded-custom-12 text-sm text-status-negative">
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-status-positive rounded-custom-12 text-sm text-status-positive">
                    {passwordSuccess}
                  </div>
                )}
                <div>
                  <label className="card-eyebrow">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      className="input-base w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-3 text-secondary hover:text-primary"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="card-eyebrow">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Enter new password (min 6 chars)"
                      className="input-base w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-secondary hover:text-primary"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="card-eyebrow">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    className="input-base w-full"
                  />
                </div>
                <button type="submit" className="btn-primary w-full mt-2">
                  Update Password
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="card max-w-2xl space-y-6">
            <div>
              <span className="card-eyebrow">SYSTEM PREFERENCES</span>
              <h2 className="card-title mb-6">Appearance & Alerts</h2>
            </div>

            {preferencesError && (
              <div className="p-3 bg-rose-500/10 border border-status-negative rounded-custom-12 text-sm text-status-negative">
                {preferencesError}
              </div>
            )}
            {preferencesSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-status-positive rounded-custom-12 text-sm text-status-positive">
                {preferencesSuccess}
              </div>
            )}

            <div>
              <label className="card-eyebrow mb-2">Color Theme</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPreferences({ ...preferences, theme: 'dark' })}
                  className={`p-4 rounded-custom-12 border text-left transition-all ${
                    preferences.theme === 'dark'
                      ? 'border-accent bg-accent-soft shadow-sm'
                      : 'border-default hover:border-accent/40'
                  }`}
                >
                  <p className="font-semibold text-primary">Dark Ops Mode (Recommended)</p>
                  <p className="text-caption text-secondary">Dark purple glassmorphic UI matching frontend.md tokens</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPreferences({ ...preferences, theme: 'light' })}
                  className={`p-4 rounded-custom-12 border text-left transition-all ${
                    preferences.theme === 'light'
                      ? 'border-accent bg-accent-soft shadow-sm'
                      : 'border-default hover:border-accent/40'
                  }`}
                >
                  <p className="font-semibold text-primary">Light Mode</p>
                  <p className="text-caption text-secondary">High contrast off-white surfaces</p>
                </button>
              </div>
            </div>

            <div className="border-t border-light-border dark:border-dark-border pt-6">
              <label className="card-eyebrow mb-2">Automated Notifications</label>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="notif"
                  checked={preferences.enableStockAlerts}
                  onChange={(e) => setPreferences({ ...preferences, enableStockAlerts: e.target.checked })}
                  className="w-4 h-4 accent-accent rounded"
                />
                <label htmlFor="notif" className="text-body font-medium text-primary cursor-pointer">
                  Enable Low Stock Threshold Notifications
                </label>
              </div>
            </div>

            <div className="border-t border-light-border dark:border-dark-border pt-6">
              <button
                onClick={handlePreferencesSave}
                disabled={isSavingPreferences}
                className="btn-primary disabled:opacity-50"
              >
                {isSavingPreferences ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        )}


      </div>
    </Layout>
  );
}
