import { Skeleton } from './Skeleton';

export function KPISkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gap-card mb-8">
      {[1, 2, 3, 4].map((idx) => (
        <div
          key={idx}
          className="relative overflow-hidden rounded-[20px] p-padding-card card-bg border border-light-border dark:border-dark-border"
        >
          <div className="flex items-start justify-between mb-4">
            <Skeleton width="110px" height="14px" borderRadius="6px" />
            <Skeleton width="36px" height="36px" borderRadius="50%" />
          </div>
          <Skeleton width="140px" height="38px" borderRadius="8px" className="mb-3" />
          <Skeleton width="90px" height="12px" borderRadius="4px" />
        </div>
      ))}
    </div>
  );
}
