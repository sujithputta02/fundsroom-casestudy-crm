interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
}

export function Skeleton({
  className = '',
  width,
  height,
  borderRadius = '12px',
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width: width !== undefined ? width : undefined,
    height: height !== undefined ? height : undefined,
    borderRadius,
  };

  return (
    <div
      className={`skeleton-base ${className}`}
      style={style}
    >
      <div className="skeleton-shimmer" />
    </div>
  );
}
