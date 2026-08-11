import { Search, Bell, Command, X, Menu } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useState, useEffect, useRef } from 'react';
import { customerAPI, productAPI, challanAPI } from '../lib/api';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  type: 'customer' | 'product' | 'challan';
  id: string;
  title: string;
  subtitle: string;
  url: string;
}

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [placeholderText, setPlaceholderText] = useState('Search...');

  useEffect(() => {
    const updatePlaceholder = () => {
      if (window.innerWidth < 640) {
        setPlaceholderText('Search...');
      } else {
        setPlaceholderText(
          `Search ${
            user?.role === 'ADMIN'
              ? 'across CRM, inventory, challans'
              : user?.role === 'SALES'
              ? 'customers, challans, products'
              : user?.role === 'WAREHOUSE'
              ? 'products, stock, challans'
              : 'challans'
          }...`
        );
      }
    };
    updatePlaceholder();
    window.addEventListener('resize', updatePlaceholder);
    return () => window.removeEventListener('resize', updatePlaceholder);
  }, [user?.role]);


  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Perform search based on role
  const performSearch = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const results: SearchResult[] = [];

    try {
      const role = user?.role;

      // ADMIN - search everything
      // SALES - search customers, challans, products (read-only)
      // WAREHOUSE - search products, challans (read-only)
      // ACCOUNTS - search challans (read-only)

      // Search Customers (Admin and Sales have access)
      if (role === 'ADMIN' || role === 'SALES') {
        try {
          const customerRes = await customerAPI.getAll(5, 0, query);
          const customers = customerRes.data || [];
          customers.forEach((customer: any) => {
            results.push({
              type: 'customer',
              id: customer.id,
              title: customer.name,
              subtitle: `${customer.mobile} • ${customer.status}`,
              url: '/customers',
            });
          });
        } catch (err) {
          console.error('Customer search error:', err);
        }
      }

      // Search Products (Admin, Sales read-only, Warehouse full access)
      if (role === 'ADMIN' || role === 'SALES' || role === 'WAREHOUSE') {
        try {
          const productRes = await productAPI.getAll(5, 0, query);
          const products = productRes.data || [];
          products.forEach((product: any) => {
            results.push({
              type: 'product',
              id: product.id,
              title: product.name,
              subtitle: `SKU: ${product.sku} • Stock: ${product.currentStock}`,
              url: '/products',
            });
          });
        } catch (err) {
          console.error('Product search error:', err);
        }
      }

      // Search Challans (All roles have at least read access)
      try {
        const challanRes = await challanAPI.getAll(5, 0, query);
        const challans = challanRes.data || [];
        challans.forEach((challan: any) => {
          results.push({
            type: 'challan',
            id: challan.id,
            title: challan.challanNumber,
            subtitle: `${challan.customer?.name || 'Customer'} • ${challan.status}`,
            url: '/challans',
          });
        });
      } catch (err) {
        console.error('Challan search error:', err);
      }

      setSearchResults(results);
      setShowResults(true);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, user?.role]);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    setSearchQuery('');
    setShowResults(false);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'customer':
        return '👤';
      case 'product':
        return '📦';
      case 'challan':
        return '📋';
      default:
        return '🔍';
    }
  };

  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case 'customer':
        return 'Customer';
      case 'product':
        return 'Product';
      case 'challan':
        return 'Challan';
      default:
        return '';
    }
  };

  return (
    <header className="app-bg border-b border-default h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
      {/* Search & Menu Container */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-custom-12 text-secondary hover:text-primary hover:bg-light-card-hover dark:hover:bg-dark-card-hover md:hidden transition-colors shrink-0"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Center-Left */}
        <div className="flex-1 relative" ref={searchRef}>
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-secondary pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowResults(true)}
              placeholder={placeholderText}
              className="input-base pl-10 pr-12 w-full text-xs"
            />
            {searchQuery ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setShowResults(false);
                }}
                className="absolute right-3 p-1 text-secondary hover:text-primary rounded"
              >
                <X className="w-3 h-3" />
              </button>
            ) : (
              <div className="absolute right-3 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-default bg-light-card dark:bg-dark-card text-[10px] text-muted font-medium">
                <Command className="w-3 h-3" />
                <span>F</span>
              </div>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full mt-2 w-full bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-custom-12 shadow-xl max-h-96 overflow-y-auto z-50">
              {isSearching ? (
                <div className="p-4 text-center text-secondary text-sm">Searching...</div>
              ) : searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map((result, idx) => (
                    <button
                      key={`${result.type}-${result.id}-${idx}`}
                      onClick={() => handleResultClick(result)}
                      className="w-full px-4 py-3 hover:bg-light-card-hover dark:hover:bg-dark-card-hover flex items-start gap-3 text-left transition-colors"
                    >
                      <span className="text-xl flex-shrink-0 mt-0.5">{getResultIcon(result.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-accent uppercase">
                            {getResultTypeLabel(result.type)}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-primary truncate">{result.title}</p>
                        <p className="text-xs text-secondary truncate">{result.subtitle}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-secondary mb-1">No results found</p>
                  <p className="text-xs text-muted">Try searching with different keywords</p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Right Section: Notifications & Role Chip */}
      <div className="flex items-center gap-4 ml-4 font-sans">
        {/* Notifications */}
        <button
          className="p-2 rounded-custom-12 text-secondary hover:text-primary hover:bg-light-card-hover dark:hover:bg-dark-card-hover transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-status-warning rounded-full animate-pulse" />
        </button>

        {/* User Profile Chip */}
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-full border border-default card-bg">
          <div className="w-7 h-7 bg-gradient-to-br from-accent to-accent-strong rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="hidden md:block leading-tight">
            <p className="text-xs font-semibold text-primary">{user?.fullName || 'User'}</p>
            <span className="text-[10px] font-medium text-accent tracking-wide uppercase">{user?.role || 'Operator'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
