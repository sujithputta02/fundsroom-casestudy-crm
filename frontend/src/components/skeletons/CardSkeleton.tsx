import { Skeleton } from './Skeleton';

export function CardSkeleton() {
  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton width="150px" height="20px" borderRadius="6px" />
        <Skeleton width="60px" height="14px" borderRadius="4px" />
      </div>
      <div className="space-y-3 pt-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-light-border-subtle dark:border-dark-border-subtle last:border-0">
            <div className="flex items-center gap-3">
              <Skeleton width="36px" height="36px" borderRadius="8px" />
              <div>
                <Skeleton width="120px" height="14px" borderRadius="4px" className="mb-1" />
                <Skeleton width="80px" height="12px" borderRadius="4px" />
              </div>
            </div>
            <Skeleton width="64px" height="20px" borderRadius="999px" />
          </div>
        ))}
      </div>
    </div>
  );
}
