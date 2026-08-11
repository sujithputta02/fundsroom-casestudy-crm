import { Skeleton } from './Skeleton';

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
}

export function TableSkeleton({ columns = 5, rows = 6 }: TableSkeletonProps) {
  return (
    <div className="card overflow-hidden p-0">
      <div className="p-4 border-b border-light-border dark:border-dark-border flex items-center justify-between">
        <Skeleton width="180px" height="24px" borderRadius="6px" />
        <Skeleton width="100px" height="32px" borderRadius="8px" />
      </div>
      <div className="overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr className="border-b border-light-border dark:border-dark-border bg-light-card/40 dark:bg-dark-card/40">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-4 py-3.5">
                  <Skeleton width={i === 0 ? "120px" : "80px"} height="14px" borderRadius="4px" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rIdx) => (
              <tr key={rIdx} className="border-b border-light-border-subtle dark:border-dark-border-subtle">
                {Array.from({ length: columns }).map((_, cIdx) => (
                  <td key={cIdx} className="px-4 py-4">
                    {cIdx === 0 ? (
                      <div className="flex items-center gap-3">
                        <Skeleton width="32px" height="32px" borderRadius="50%" />
                        <div className="space-y-1.5">
                          <Skeleton width="140px" height="14px" borderRadius="4px" />
                          <Skeleton width="90px" height="12px" borderRadius="4px" />
                        </div>
                      </div>
                    ) : cIdx === columns - 1 ? (
                      <Skeleton width="70px" height="24px" borderRadius="999px" />
                    ) : (
                      <Skeleton width={cIdx % 2 === 0 ? "100px" : "60px"} height="14px" borderRadius="4px" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
