import { BarChart3, Package, ShoppingCart, Users, LogOut, Moon, Sun, Settings, History, Shield, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';
import { Logo } from './Logo';

interface SidebarProps {
  collapsed?: boolean;
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ collapsed = true, mobileOpen = false, onClose }: SidebarProps) {
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Customers', path: '/customers' },
    { icon: Package, label: 'Inventory', path: '/products' },
    { icon: History, label: 'Stock Movements', path: '/stock-movements' },
    { icon: ShoppingCart, label: 'Challans', path: '/challans' },
    ...(user?.role === 'ADMIN' ? [{ icon: Shield, label: 'Users', path: '/users' }] : []),
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isCollapsed = collapsed && !mobileOpen;

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside
      className={`sidebar-bg border-r border-default h-screen flex flex-col transition-all duration-300 fixed left-0 top-0 z-50 shadow-lg ${
        mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
      } ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}
    >
      {/* Brand Logo */}
      <div className="p-4 border-b border-default flex items-center justify-between h-16 shrink-0">
        <Link to="/dashboard" onClick={handleLinkClick} className="transition-transform hover:scale-105 flex-1 flex justify-center">
          <Logo size="sm" showLabel={!isCollapsed} />
        </Link>
        {mobileOpen && (
          <button
            onClick={onClose}
            className="p-1 rounded-custom-12 hover:bg-light-card-hover dark:hover:bg-dark-card-hover text-secondary hover:text-primary md:hidden transition-colors"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Nav Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              className={`relative group flex items-center ${
                isCollapsed ? 'justify-center' : 'px-3'
              } py-2.5 rounded-custom-12 transition-all duration-150 ${
                active
                  ? 'bg-accent-soft text-accent font-semibold shadow-inner'
                  : 'text-secondary hover:text-primary hover:bg-light-card-hover dark:hover:bg-dark-card-hover'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${active ? 'text-accent' : ''}`} />
              {!isCollapsed && <span className="ml-3 text-sm font-medium">{item.label}</span>}
              
              {/* Tooltip for collapsed icon mode */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-dark-card border border-dark-border text-dark-text-primary text-caption rounded-custom-12 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Controls */}
      <div className="border-t border-default p-3 space-y-2 shrink-0">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`relative group w-full flex items-center ${
            isCollapsed ? 'justify-center' : 'px-3'
          } py-2.5 rounded-custom-12 text-secondary hover:text-primary hover:bg-light-card-hover dark:hover:bg-dark-card-hover transition-colors`}
          title="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 flex-shrink-0 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 flex-shrink-0 text-indigo-400" />
          )}
          {!isCollapsed && <span className="ml-3 text-sm font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1 bg-dark-card border border-dark-border text-dark-text-primary text-caption rounded-custom-12 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
              {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            </div>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={() => {
            handleLinkClick();
            logout();
          }}
          className={`relative group w-full flex items-center ${
            isCollapsed ? 'justify-center' : 'px-3'
          } py-2.5 rounded-custom-12 text-secondary hover:text-status-negative hover:bg-rose-500/10 transition-colors`}
          title="Logout"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="ml-3 text-sm font-medium">Logout</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1 bg-dark-card border border-dark-border text-status-negative text-caption rounded-custom-12 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
              Logout
            </div>
          )}
        </button>

        {/* Role Avatar Pill */}
        {user && isCollapsed && (
          <div className="pt-2 flex justify-center">
            <div
              className="w-8 h-8 rounded-full bg-accent/20 text-accent font-semibold text-xs flex items-center justify-center border border-accent/30"
              title={`${user.fullName} (${user.role})`}
            >
              {user.fullName.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

