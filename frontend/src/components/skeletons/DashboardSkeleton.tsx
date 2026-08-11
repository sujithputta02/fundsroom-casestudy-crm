import { KPISkeleton } from './KPISkeleton';
import { CardSkeleton } from './CardSkeleton';
import { Skeleton } from './Skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title Header Skeleton */}
      <div className="space-y-2">
        <Skeleton width="180px" height="32px" borderRadius="8px" />
        <Skeleton width="260px" height="16px" borderRadius="4px" />
      </div>

      {/* Hero Glass KPI Row Skeleton */}
      <KPISkeleton />

      {/* Main Grid: Workload / Activity Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gap-card">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
