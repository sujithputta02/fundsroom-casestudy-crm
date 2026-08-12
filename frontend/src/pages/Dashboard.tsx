import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { TrendingUp, AlertTriangle, ShoppingCart, Clock, ArrowRight, CheckCircle2, ShieldAlert, Package, Users, History, Calendar } from 'lucide-react';
import { challanAPI, productAPI, dashboardAPI, customerAPI, stockAPI } from '../lib/api';
import { DashboardSkeleton } from '../components/skeletons/DashboardSkeleton';
import { Challan, Product, StockMovement } from '../types';
import { useAuthStore } from '../store/authStore';

interface KPICard {
  label: string;
  value: number | string;
  gradient: string;
  icon: any;
  subtext?: string;
  percentage?: number;
}

export function Dashboard() {
  const { user } = useAuthStore();
  const [kpis, setKpis] = useState<KPICard[]>([]);
  const [recentChallans, setRecentChallans] = useState<Challan[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [salesTrend, setSalesTrend] = useState<any>(null);
  const [stockHealth, setStockHealth] = useState<any>(null);
  const [recentCustomers, setRecentCustomers] = useState<any[]>([]);
  const [upcomingFollowUps, setUpcomingFollowUps] = useState<any[]>([]);
  const [recentMovements, setRecentMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [animateCircles, setAnimateCircles] = useState(false);
  const [animateChart, setAnimateChart] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const role = user?.role;

      const promises: Promise<any>[] = [
        dashboardAPI.getSummary(),
        challanAPI.getAll(100, 0),
        productAPI.getLowStock(),
        dashboardAPI.getSalesTrend(),
        dashboardAPI.getStockHealth(),
      ];

      if (role === 'SALES') {
        promises.push(customerAPI.getAll(50, 0));
      } else if (role === 'WAREHOUSE') {
        promises.push(stockAPI.getAll(5, 0));
      }

      const results = await Promise.all(promises);
      const dashboardData = results[0].data;
      const allChallans: Challan[] = results[1].data || [];
      const lowStockData = results[2].data || [];
      const salesData = results[3].data || null;
      const healthData = results[4].data || {};

      setRecentChallans(allChallans.slice(0, 5));
      setLowStockProducts(lowStockData.slice(0, 5));
      setSalesTrend(salesData);
      setStockHealth(healthData);

      if (role === 'SALES') {
        const customers = results[5]?.data || [];
        setRecentCustomers(customers.slice(0, 5));
        
        const followups = customers
          .filter((c: any) => c.status === 'LEAD' && c.followUpDate)
          .sort((a: any, b: any) => new Date(a.followUpDate).getTime() - new Date(b.followUpDate).getTime());
        setUpcomingFollowUps(followups.slice(0, 5));
      } else if (role === 'WAREHOUSE') {
        setRecentMovements(results[5]?.data || []);
      }

      const calculatePercentage = (value: number, maxReference: number = 10) => {
        if (value === 0) return 0;
        if (value >= maxReference) return 100;
        return Math.max(20, Math.min(100, (value / maxReference) * 100));
      };

      const salesPercentage = dashboardData.todaySales === 0 ? 0 : 
        Math.max(15, Math.min(100, (dashboardData.todaySales / 50000) * 100));
      
      if (role === 'ADMIN') {
        setKpis([
          {
            label: "TODAY'S SALES",
            value: `₹${dashboardData.todaySales.toLocaleString()}`,
            gradient: 'bg-glass-blue',
            icon: TrendingUp,
            subtext: `${dashboardData.confirmedOrdersToday} confirmed orders today`,
            percentage: salesPercentage,
          },
          {
            label: 'STOCK ALERTS',
            value: dashboardData.stockAlerts,
            gradient: 'bg-glass-teal',
            icon: AlertTriangle,
            subtext: 'Items below minimum stock threshold',
            percentage: calculatePercentage(dashboardData.stockAlerts, 5),
          },
          {
            label: 'PENDING CHALLANS',
            value: dashboardData.pendingChallans,
            gradient: 'bg-glass-pink',
            icon: ShoppingCart,
            subtext: 'Drafts awaiting manager confirmation',
            percentage: calculatePercentage(dashboardData.pendingChallans, 10),
          },
          {
            label: 'FOLLOW-UPS DUE',
            value: dashboardData.followUpsDue,
            gradient: 'bg-glass-blue',
            icon: Clock,
            subtext: 'Active CRM lead follow-ups this week',
            percentage: calculatePercentage(dashboardData.followUpsDue, 15),
          },
        ]);
      } else if (role === 'SALES') {
        setKpis([
          {
            label: "TODAY'S SALES",
            value: `₹${dashboardData.todaySales.toLocaleString()}`,
            gradient: 'bg-glass-blue',
            icon: TrendingUp,
            subtext: `${dashboardData.confirmedOrdersToday} confirmed orders today`,
            percentage: salesPercentage,
          },
          {
            label: 'PENDING CHALLANS',
            value: dashboardData.pendingChallans,
            gradient: 'bg-glass-pink',
            icon: ShoppingCart,
            subtext: 'Drafts awaiting confirmation',
            percentage: calculatePercentage(dashboardData.pendingChallans, 10),
          },
          {
            label: 'ACTIVE LEADS',
            value: dashboardData.followUpsDue,
            gradient: 'bg-glass-teal',
            icon: Users,
            subtext: 'Customers requiring follow-up',
            percentage: calculatePercentage(dashboardData.followUpsDue, 15),
          },
          {
            label: 'FOLLOW-UPS DUE',
            value: dashboardData.followUpsDue,
            gradient: 'bg-glass-blue',
            icon: Clock,
            subtext: 'CRM follow-ups this week',
            percentage: calculatePercentage(dashboardData.followUpsDue, 15),
          },
        ]);
      } else if (role === 'WAREHOUSE') {
        const totalProductsPercentage = healthData?.totalProducts === 0 ? 0 :
          Math.min(100, Math.max(25, (healthData?.totalProducts / 50) * 100));
          
        setKpis([
          {
            label: 'TOTAL PRODUCTS',
            value: healthData?.totalProducts || 0,
            gradient: 'bg-glass-blue',
            icon: Package,
            subtext: 'Active products in inventory',
            percentage: totalProductsPercentage,
          },
          {
            label: 'LOW STOCK ITEMS',
            value: dashboardData.stockAlerts,
            gradient: 'bg-glass-teal',
            icon: AlertTriangle,
            subtext: 'Items below minimum threshold',
            percentage: calculatePercentage(dashboardData.stockAlerts, 5),
          },
          {
            label: 'PENDING CHALLANS',
            value: dashboardData.pendingChallans,
            gradient: 'bg-glass-pink',
            icon: ShoppingCart,
            subtext: 'Challans to review',
            percentage: calculatePercentage(dashboardData.pendingChallans, 10),
          },
          {
            label: 'STOCK HEALTH',
            value: `${healthData?.healthPercentage || 0}%`,
            gradient: 'bg-glass-blue',
            icon: CheckCircle2,
            subtext: 'Overall inventory health',
            percentage: healthData?.healthPercentage || 0,
          },
        ]);
      } else if (role === 'ACCOUNTS') {
        const weeklySales = salesData?.currentTotal || 0;
        const weeklyPercentage = weeklySales === 0 ? 0 :
          Math.max(15, Math.min(100, (weeklySales / 200000) * 100));
          
        setKpis([
          {
            label: "TODAY'S SALES",
            value: `₹${dashboardData.todaySales.toLocaleString()}`,
            gradient: 'bg-glass-blue',
            icon: TrendingUp,
            subtext: `${dashboardData.confirmedOrdersToday} confirmed orders today`,
            percentage: salesPercentage,
          },
          {
            label: 'CONFIRMED CHALLANS',
            value: dashboardData.confirmedOrdersToday,
            gradient: 'bg-glass-teal',
            icon: CheckCircle2,
            subtext: 'Completed sales today',
            percentage: calculatePercentage(dashboardData.confirmedOrdersToday, 10),
          },
          {
            label: 'PENDING CHALLANS',
            value: dashboardData.pendingChallans,
            gradient: 'bg-glass-pink',
            icon: ShoppingCart,
            subtext: 'Drafts awaiting confirmation',
            percentage: calculatePercentage(dashboardData.pendingChallans, 10),
          },
          {
            label: 'WEEKLY SALES',
            value: `₹${weeklySales.toLocaleString()}`,
            gradient: 'bg-glass-blue',
            icon: TrendingUp,
            subtext: 'Total sales this week',
            percentage: weeklyPercentage,
          },
        ]);
      }
      
      setTimeout(() => setAnimateCircles(true), 100);
      setTimeout(() => setAnimateChart(true), 300);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      
      // Retry after delay on cold start errors
      if (err?.code === 'COLD_START' || err?.code === 'SERVER_STARTING') {
        // Auto-retry after 10 seconds
        setTimeout(() => {
          loadData();
        }, 10000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Server-Sent Events for instant real-time updates
    const sseUrl = `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5001/api/v1'}/dashboard/live`;
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'update') {
          console.log('⚡ Real-time dashboard update received!');
          loadData();
        }
      } catch (err) {
        console.error('Failed to parse SSE event:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.warn('SSE connection issue, falling back to polling.', err);
    };

    // Fallback updates every 30 seconds
    const interval = setInterval(() => {
      loadData();
    }, 30000);

    return () => {
      eventSource.close();
      clearInterval(interval);
    };
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <DashboardSkeleton />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-display text-primary mb-1">
              {user?.role === 'ADMIN' && 'Operations Portal'}
              {user?.role === 'SALES' && 'Sales Dashboard'}
              {user?.role === 'WAREHOUSE' && 'Warehouse Dashboard'}
              {user?.role === 'ACCOUNTS' && 'Accounts Dashboard'}
            </h1>
            <p className="text-body text-secondary">
              {user?.role === 'ADMIN' && 'Overview of sales challans, inventory alerts, and CRM leads'}
              {user?.role === 'SALES' && 'Track your sales performance, challans, and customer follow-ups'}
              {user?.role === 'WAREHOUSE' && 'Monitor inventory levels, stock health, and product alerts'}
              {user?.role === 'ACCOUNTS' && 'View financial summaries, confirmed sales, and pending transactions'}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-caption bg-emerald-500/10 text-status-positive border border-emerald-500/20 font-medium">
              <span className="w-2 h-2 rounded-full bg-status-positive animate-pulse" />
              Live Operations Sync
            </span>
          </div>
        </div>

        {/* Reference 2 Glass KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gap-card">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            const pct = kpi.percentage || 0; // Default to 0 if undefined
            const dashOffset = animateCircles ? 100 - pct : 100; // When not animated, show 100 (empty)

            return (
              <div
                key={idx}
                className={`glass-kpi-card ${kpi.gradient} stagger-${idx + 1}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-eyebrow text-white/70 font-medium tracking-wider">{kpi.label}</span>

                  {/* SVG Circular Progress Ring (Reference 1 style) */}
                  <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
                      {/* Background circle (always visible) */}
                      <path
                        className="text-white/20"
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      {/* Progress circle (only shows if percentage > 0) */}
                      {pct > 0 && (
                        <path
                          className="text-white transition-all duration-1000 ease-out"
                          strokeDasharray="100, 100"
                          strokeDashoffset={dashOffset}
                          strokeLinecap="round"
                          strokeWidth="3"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          style={{ transitionDelay: `${idx * 100}ms` }}
                        />
                      )}
                    </svg>
                    <Icon className="w-4 h-4 text-white absolute opacity-90" />
                  </div>
                </div>

                <p className="text-kpi font-bold text-white mb-1.5 tracking-tight">{kpi.value}</p>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-caption text-white/60 mt-1">{kpi.subtext}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts & Workload Section */}
        {(user?.role === 'ADMIN' || user?.role === 'ACCOUNTS') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gap-card">
            {/* Weekly Sales Trend */}
            <div className="card lg:col-span-2">
              <div className="card-header">
                <div>
                  <span className="card-eyebrow">FINANCE PERFORMANCE</span>
                  <h2 className="card-title">Weekly Sales Trend</h2>
                </div>
                {salesTrend && (
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      salesTrend.percentageChange >= 0
                        ? 'text-status-positive bg-emerald-500/10 border-emerald-500/20'
                        : 'text-status-negative bg-rose-500/10 border-rose-500/20'
                    }`}>
                      {salesTrend.percentageChange >= 0 ? '↑' : '↓'} {salesTrend.percentageChange >= 0 ? '+' : ''}{salesTrend.percentageChange}%
                    </span>
                  </div>
                )}
              </div>

              {/* Interactive Area SVG Chart with Real Data */}
              <div className="w-full pt-4 relative">
                {(() => {
                  const trendPoints = salesTrend?.trend || [];
                  const salesValues = trendPoints.map((pt: any) => pt.sales);
                  const maxSales = Math.max(...salesValues, 1);
                  
                  const width = 500;
                  const height = 120;
                  const points = salesValues.map((value: number, i: number) => {
                    const x = (i / (trendPoints.length - 1 || 1)) * width;
                    const y = height - 20 - ((value / maxSales) * 80);
                    return { x, y };
                  });

                  const createSmoothPath = (pts: { x: number; y: number }[]) => {
                    if (pts.length < 2) return '';
                    let path = `M ${pts[0].x} ${pts[0].y}`;
                    for (let i = 0; i < pts.length - 1; i++) {
                      const curr = pts[i];
                      const next = pts[i + 1];
                      const prev = pts[i - 1] || curr;
                      const afterNext = pts[i + 2] || next;
                      
                      const tension = 0.3;
                      const cp1x = curr.x + (next.x - prev.x) * tension;
                      const cp1y = curr.y + (next.y - prev.y) * tension;
                      const cp2x = next.x - (afterNext.x - curr.x) * tension;
                      const cp2y = next.y - (afterNext.y - curr.y) * tension;
                      
                      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
                    }
                    return path;
                  };

                  const pathD = createSmoothPath(points);
                  const areaPath = points.length >= 2 ? `${pathD} L ${width} ${height} L 0 ${height} Z` : '';

                  return (
                    <svg className="w-full h-32 sm:h-40 overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7c5cff" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#7c5cff" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {points.length >= 2 && (
                        <>
                          <path
                            d={areaPath}
                            fill="url(#chartGradient)"
                            className={animateChart ? 'animate-fade-in' : 'opacity-0'}
                            style={{ animationDelay: '200ms' }}
                          />
                          <path
                            d={pathD}
                            fill="none"
                            stroke="#7c5cff"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={animateChart ? 'animate-draw-line' : 'opacity-0'}
                            style={{ 
                              strokeDasharray: '1000',
                              strokeDashoffset: animateChart ? '0' : '1000',
                              transition: 'stroke-dashoffset 1.5s ease-out'
                            }}
                          />
                        </>
                      )}
                      {points.length > 0 && (
                        <>
                          <circle 
                            cx={points[points.length - 1].x} 
                            cy={points[points.length - 1].y} 
                            r="5" 
                            fill="#7c5cff" 
                            className={animateChart ? 'animate-ping opacity-75' : 'opacity-0'}
                            style={{ animationDelay: '1.5s' }}
                          />
                          <circle 
                            cx={points[points.length - 1].x} 
                            cy={points[points.length - 1].y} 
                            r="5" 
                            fill="#ffffff" 
                            stroke="#7c5cff" 
                            strokeWidth="3"
                            className={animateChart ? 'animate-fade-in' : 'opacity-0'}
                            style={{ animationDelay: '1.5s' }}
                          />
                        </>
                      )}
                    </svg>
                  );
                })()}

                <div className="flex items-center justify-between text-caption text-secondary border-t border-light-border dark:border-dark-border pt-4 mt-2">
                  {(salesTrend?.trend || []).map((pt: any, idx: number) => {
                    return (
                      <span 
                        key={pt.date + '-' + idx}
                        className={pt.isToday ? 'text-accent font-semibold' : ''}
                      >
                        {pt.day} {pt.isToday && <span className="hidden sm:inline">(Today)</span>}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Stock Health (Admin) */}
            {user?.role === 'ADMIN' && (
              <div className="card flex flex-col justify-between">
                <div>
                  <div className="card-header">
                    <div>
                      <span className="card-eyebrow">WORKLOAD & INVENTORY</span>
                      <h2 className="card-title">Stock Health</h2>
                    </div>
                    <ShieldAlert className="w-5 h-5 text-status-warning" />
                  </div>
                  <p className="text-body text-secondary mb-4">
                    Monitor live inventory levels against safety thresholds.
                  </p>
                  <div className="p-4 rounded-custom-12 bg-light-card-hover dark:bg-dark-card-hover border border-light-border dark:border-dark-border mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-secondary font-medium">Healthy Inventory Ratio</span>
                      <span className="text-xs font-bold text-accent">
                        {stockHealth?.healthPercentage || 0}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-light-border dark:bg-dark-border rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: animateCircles ? `${stockHealth?.healthPercentage || 0}%` : '0%' }}
                      />
                    </div>
                  </div>
                  {stockHealth && (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-3 rounded-custom-12 bg-emerald-500/10 border border-emerald-500/20">
                        <p className="text-caption text-secondary mb-1">Healthy</p>
                        <p className="text-lg font-bold text-status-positive">{stockHealth.healthyProducts}</p>
                      </div>
                      <div className="p-3 rounded-custom-12 bg-amber-500/10 border border-amber-500/20">
                        <p className="text-caption text-secondary mb-1">Low Stock</p>
                        <p className="text-lg font-bold text-status-warning">{stockHealth.lowStockProducts}</p>
                      </div>
                    </div>
                  )}
                </div>
                <a
                  href="/products"
                  className="text-accent text-sm font-medium hover:underline inline-flex items-center gap-1 group"
                >
                  Review all products
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            )}

            {/* Sales Summary (Accounts) */}
            {user?.role === 'ACCOUNTS' && (
              <div className="card flex flex-col justify-between">
                <div>
                  <div className="card-header">
                    <div>
                      <span className="card-eyebrow">PORTFOLIO OVERVIEW</span>
                      <h2 className="card-title">Sales Summary</h2>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-status-positive" />
                  </div>
                  <p className="text-body text-secondary mb-4">
                    Overview of transactional statuses in the database.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-light-card-hover dark:bg-dark-card-hover rounded-custom-12 border border-light-border dark:border-dark-border">
                      <span className="text-xs text-secondary font-medium">Confirmed Orders Today</span>
                      <span className="text-xs font-bold text-status-positive">{recentChallans.filter(c => c.status === 'CONFIRMED').length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-light-card-hover dark:bg-dark-card-hover rounded-custom-12 border border-light-border dark:border-dark-border">
                      <span className="text-xs text-secondary font-medium">Pending Draft Challans</span>
                      <span className="text-xs font-bold text-status-warning">{recentChallans.filter(c => c.status === 'DRAFT').length}</span>
                    </div>
                  </div>
                </div>
                <a
                  href="/challans"
                  className="text-accent text-sm font-medium hover:underline inline-flex items-center gap-1 group mt-4"
                >
                  Auditing Challans
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Warehouse Workload Metrics */}
        {user?.role === 'WAREHOUSE' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gap-card">
            <div className="card lg:col-span-2">
              <div className="card-header">
                <div>
                  <span className="card-eyebrow">WAREHOUSE METRICS</span>
                  <h2 className="card-title">Inventory Stock Health</h2>
                </div>
                <ShieldAlert className="w-5 h-5 text-status-warning" />
              </div>
              <p className="text-body text-secondary mb-6">
                Monitor safety thresholds and overall warehouse health.
              </p>
              
              <div className="p-6 rounded-custom-12 bg-light-card-hover dark:bg-dark-card-hover border border-light-border dark:border-dark-border mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-body text-secondary font-medium">Healthy Inventory Ratio</span>
                  <span className="text-lg font-bold text-accent">
                    {stockHealth?.healthPercentage || 0}%
                  </span>
                </div>
                <div className="w-full h-3 bg-light-border dark:bg-dark-border rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: animateCircles ? `${stockHealth?.healthPercentage || 0}%` : '0%' }}
                  />
                </div>
              </div>

              {stockHealth && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-custom-12 bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-caption text-secondary mb-1">Total Active Products</p>
                    <p className="text-2xl font-bold text-status-positive">{stockHealth.totalProducts}</p>
                  </div>
                  <div className="p-4 rounded-custom-12 bg-amber-500/10 border border-amber-500/20">
                    <p className="text-caption text-secondary mb-1">Low Stock Products</p>
                    <p className="text-2xl font-bold text-status-warning">{stockHealth.lowStockProducts}</p>
                  </div>
                  <div className="p-4 rounded-custom-12 bg-blue-500/10 border border-blue-500/20">
                    <p className="text-caption text-secondary mb-1">Healthy Products</p>
                    <p className="text-2xl font-bold text-accent">{stockHealth.healthyProducts}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="card flex flex-col justify-between">
              <div>
                <div className="card-header">
                  <div>
                    <span className="card-eyebrow">OPERATIONS</span>
                    <h2 className="card-title">Inventory Receipts</h2>
                  </div>
                  <Package className="w-5 h-5 text-accent" />
                </div>
                <p className="text-body text-secondary mb-4">
                  Manage inventory restock and receipts log movements.
                </p>
              </div>
              <a
                href="/stock-movements"
                className="btn-primary w-full text-center flex items-center justify-center gap-2"
              >
                <History className="w-4 h-4" />
                Record & Log Stock IN
              </a>
            </div>
          </div>
        )}

        {/* Tables Grid: Custom views based on Role */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gap-card">
          
          {/* =================================================================
              ADMIN DASHBOARD DETAILS
             ================================================================= */}
          {user?.role === 'ADMIN' && (
            <>
              {/* Recent Challans */}
              <div className="card">
                <div className="card-header">
                  <div>
                    <span className="card-eyebrow">RECENT ACTIVITY</span>
                    <h2 className="card-title">Recent Challans</h2>
                  </div>
                  <a href="/challans" className="text-accent text-xs font-medium hover:underline inline-flex items-center gap-1 group">
                    View all <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
                <div className="space-y-2">
                  {recentChallans.length === 0 ? (
                    <div className="text-center py-8 text-secondary text-sm">No recent challans found</div>
                  ) : (
                    recentChallans.map((challan) => {
                      const cTotal = (challan.items || []).reduce((sum, i) => sum + Number(i.total || 0), 0);
                      return (
                        <div key={challan.id} className="flex items-center justify-between p-3 rounded-custom-12 hover:bg-light-card-hover dark:hover:bg-dark-card-hover transition-colors border border-transparent hover:border-light-border dark:hover:border-dark-border">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-custom-12 bg-accent-soft text-accent flex items-center justify-center font-semibold text-xs">
                              {challan.challanNumber.slice(-3)}
                            </div>
                            <div>
                              <p className="text-body font-semibold text-primary">{challan.challanNumber}</p>
                              <p className="text-caption text-secondary">
                                {challan.customer?.name || 'Customer'} • {cTotal > 0 ? `₹${cTotal.toLocaleString()}` : `${challan.totalQuantity} items`}
                              </p>
                            </div>
                          </div>
                          <span className={`status-badge status-${challan.status.toLowerCase()}`}>
                            {challan.status}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Low Stock Alerts */}
              <div className="card">
                <div className="card-header">
                  <div>
                    <span className="card-eyebrow">ACTION REQUIRED</span>
                    <h2 className="card-title">Low Stock Warnings</h2>
                  </div>
                  <a href="/products" className="text-accent text-xs font-medium hover:underline inline-flex items-center gap-1 group">
                    Manage Stock <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
                <div className="space-y-2">
                  {lowStockProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-secondary">
                      <CheckCircle2 className="w-8 h-8 text-status-positive mb-2 opacity-80" />
                      <p className="text-sm font-medium text-primary">All products in healthy stock</p>
                    </div>
                  ) : (
                    lowStockProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 rounded-custom-12 hover:bg-light-card-hover dark:hover:bg-dark-card-hover transition-colors border-l-4 border-l-status-warning border border-transparent hover:border-light-border dark:hover:border-dark-border">
                        <div>
                          <p className="text-body font-semibold text-primary">{product.name}</p>
                          <p className="text-caption text-secondary">SKU: {product.sku} • Location: {product.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-status-warning">{product.currentStock} left</p>
                          <p className="text-[10px] text-muted">Min: {product.minimumStockAlert}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {/* =================================================================
              SALES DASHBOARD DETAILS
             ================================================================= */}
          {user?.role === 'SALES' && (
            <>
              {/* Recent Customers */}
              <div className="card">
                <div className="card-header">
                  <div>
                    <span className="card-eyebrow">CRM PORTAL</span>
                    <h2 className="card-title">Recent Customer Accounts</h2>
                  </div>
                  <a href="/customers" className="text-accent text-xs font-medium hover:underline inline-flex items-center gap-1 group">
                    CRM Clients <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
                <div className="space-y-2">
                  {recentCustomers.length === 0 ? (
                    <div className="text-center py-8 text-secondary text-sm">No customers created yet</div>
                  ) : (
                    recentCustomers.map((customer) => (
                      <div key={customer.id} className="flex items-center justify-between p-3 rounded-custom-12 hover:bg-light-card-hover dark:hover:bg-dark-card-hover transition-colors border border-transparent hover:border-light-border dark:hover:border-dark-border">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-accent-soft text-accent flex items-center justify-center font-bold text-xs">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-body font-semibold text-primary">{customer.name}</p>
                            <p className="text-caption text-secondary">{customer.businessName} • {customer.mobileNumber}</p>
                          </div>
                        </div>
                        <span className={`status-badge status-${customer.status.toLowerCase()}`}>
                          {customer.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Upcoming Follow-ups */}
              <div className="card">
                <div className="card-header">
                  <div>
                    <span className="card-eyebrow">CRITICAL FOLLOW-UPS</span>
                    <h2 className="card-title">Upcoming CRM Follow-ups</h2>
                  </div>
                  <Calendar className="w-5 h-5 text-accent opacity-80" />
                </div>
                <div className="space-y-2">
                  {upcomingFollowUps.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-secondary">
                      <CheckCircle2 className="w-8 h-8 text-status-positive mb-2 opacity-80" />
                      <p className="text-sm font-medium text-primary">No pending follow-ups</p>
                      <p className="text-caption text-muted">All active lead logs are up-to-date</p>
                    </div>
                  ) : (
                    upcomingFollowUps.map((customer) => (
                      <div key={customer.id} className="flex items-center justify-between p-3 rounded-custom-12 hover:bg-light-card-hover dark:hover:bg-dark-card-hover transition-colors border border-transparent hover:border-light-border dark:hover:border-dark-border">
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-body font-semibold text-primary truncate">{customer.name}</p>
                          <p className="text-caption text-secondary truncate mt-0.5" title={customer.notes}>
                            Note: {customer.notes || 'No follow-up notes logged'}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-caption bg-accent-soft text-accent font-semibold">
                            <Clock className="w-3 h-3" />
                            {new Date(customer.followUpDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {/* =================================================================
              WAREHOUSE DASHBOARD DETAILS
             ================================================================= */}
          {user?.role === 'WAREHOUSE' && (
            <>
              {/* Low Stock warnings list */}
              <div className="card">
                <div className="card-header">
                  <div>
                    <span className="card-eyebrow">SAFETY LIMITS</span>
                    <h2 className="card-title">Low Stock Alerts</h2>
                  </div>
                  <a href="/products" className="text-accent text-xs font-medium hover:underline inline-flex items-center gap-1 group">
                    Inventory <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
                <div className="space-y-2">
                  {lowStockProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-secondary">
                      <CheckCircle2 className="w-8 h-8 text-status-positive mb-2 opacity-80" />
                      <p className="text-sm font-medium text-primary">All products healthy</p>
                    </div>
                  ) : (
                    lowStockProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 rounded-custom-12 hover:bg-light-card-hover dark:hover:bg-dark-card-hover transition-colors border-l-4 border-l-status-warning border border-transparent hover:border-light-border dark:hover:border-dark-border">
                        <div>
                          <p className="text-body font-semibold text-primary">{product.name}</p>
                          <p className="text-caption text-secondary">SKU: {product.sku} • Loc: {product.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-status-warning">{product.currentStock} units left</p>
                          <p className="text-[10px] text-muted">Min Alert: {product.minimumStockAlert}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Stock Movements */}
              <div className="card">
                <div className="card-header">
                  <div>
                    <span className="card-eyebrow">TRANSACTIONS LOG</span>
                    <h2 className="card-title">Recent Stock Movements</h2>
                  </div>
                  <a href="/stock-movements" className="text-accent text-xs font-medium hover:underline inline-flex items-center gap-1 group">
                    Audit Log <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
                <div className="space-y-2">
                  {recentMovements.length === 0 ? (
                    <div className="text-center py-8 text-secondary text-sm">No recent transactions logged</div>
                  ) : (
                    recentMovements.map((movement) => {
                      const isIn = movement.movementType === 'IN';
                      return (
                        <div key={movement.id} className="flex items-center justify-between p-3 rounded-custom-12 hover:bg-light-card-hover dark:hover:bg-dark-card-hover transition-colors border border-transparent hover:border-light-border dark:hover:border-dark-border">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-custom-12 bg-accent-soft text-accent flex items-center justify-center">
                              <History className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-body font-semibold text-primary">{movement.product?.name || 'Product'}</p>
                              <p className="text-caption text-secondary truncate max-w-[200px]" title={movement.reason}>
                                Reason: {movement.reason}
                              </p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-bold ${
                            isIn ? 'bg-emerald-500/10 text-status-positive border border-emerald-500/20' : 'bg-rose-500/10 text-status-negative border border-rose-500/20'
                          }`}>
                            {isIn ? `+${movement.quantityChanged}` : `-${movement.quantityChanged}`}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}

          {/* =================================================================
              ACCOUNTS DASHBOARD DETAILS
             ================================================================= */}
          {user?.role === 'ACCOUNTS' && (
            <>
              {/* Recent Confirmed Challans */}
              <div className="card">
                <div className="card-header">
                  <div>
                    <span className="card-eyebrow">ACCOUNTS RECEIVABLE</span>
                    <h2 className="card-title">Recent Confirmed Challans</h2>
                  </div>
                  <a href="/challans" className="text-accent text-xs font-medium hover:underline inline-flex items-center gap-1 group">
                    All Challans <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
                <div className="space-y-2">
                  {recentChallans.filter(c => c.status === 'CONFIRMED').length === 0 ? (
                    <div className="text-center py-8 text-secondary text-sm">No confirmed challans found</div>
                  ) : (
                    recentChallans
                      .filter(c => c.status === 'CONFIRMED')
                      .slice(0, 5)
                      .map((challan) => {
                        const cTotal = (challan.items || []).reduce((sum, i) => sum + Number(i.total || 0), 0);
                        return (
                          <div key={challan.id} className="flex items-center justify-between p-3 rounded-custom-12 hover:bg-light-card-hover dark:hover:bg-dark-card-hover transition-colors border border-transparent hover:border-light-border dark:hover:border-dark-border">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-custom-12 bg-emerald-500/10 text-status-positive flex items-center justify-center font-semibold text-xs border border-emerald-500/20">
                                {challan.challanNumber.slice(-3)}
                              </div>
                              <div>
                                <p className="text-body font-semibold text-primary">{challan.challanNumber}</p>
                                <p className="text-caption text-secondary">{challan.customer?.name || 'Customer'}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-status-positive">₹{cTotal.toLocaleString()}</p>
                              <p className="text-[10px] text-muted">{challan.totalQuantity} items</p>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>

              {/* Pending Transactions */}
              <div className="card">
                <div className="card-header">
                  <div>
                    <span className="card-eyebrow">DRAFTS & INCOMPLETE</span>
                    <h2 className="card-title">Pending Draft Challans</h2>
                  </div>
                  <Clock className="w-5 h-5 text-status-warning" />
                </div>
                <div className="space-y-2">
                  {recentChallans.filter(c => c.status === 'DRAFT').length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-secondary">
                      <CheckCircle2 className="w-8 h-8 text-status-positive mb-2 opacity-80" />
                      <p className="text-sm font-medium text-primary">No pending transactions</p>
                      <p className="text-caption text-muted">All challans have been confirmed or processed</p>
                    </div>
                  ) : (
                    recentChallans
                      .filter(c => c.status === 'DRAFT')
                      .slice(0, 5)
                      .map((challan) => {
                        const cTotal = (challan.items || []).reduce((sum, i) => sum + Number(i.total || 0), 0);
                        return (
                          <div key={challan.id} className="flex items-center justify-between p-3 rounded-custom-12 hover:bg-light-card-hover dark:hover:bg-dark-card-hover transition-colors border border-transparent hover:border-light-border dark:hover:border-dark-border">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-custom-12 bg-amber-500/10 text-status-warning flex items-center justify-center font-semibold text-xs border border-amber-500/20">
                                {challan.challanNumber.slice(-3)}
                              </div>
                              <div>
                                <p className="text-body font-semibold text-primary">{challan.challanNumber}</p>
                                <p className="text-caption text-secondary">{challan.customer?.name || 'Customer'}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-status-warning">₹{cTotal.toLocaleString()}</p>
                              <p className="text-[10px] text-muted">{challan.totalQuantity} items</p>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </>
          )}
          
        </div>
      </div>
    </Layout>
  );
}
