interface SkeletonProps {
  width?: string;
  height?: string;
  radius?: string;
  className?: string;
}

export default function Skeleton({ width, height, radius = 'var(--radius-md)', className = '' }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: width || '100%',
        height: height || '20px',
        borderRadius: radius,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <Skeleton height="140px" radius="var(--radius-lg) var(--radius-lg) 0 0" />
      <div style={{ padding: 'var(--space-4)' }}>
        <Skeleton width="60%" height="20px" />
        <Skeleton width="100%" height="14px" className="mt-3" />
        <Skeleton width="80%" height="14px" className="mt-2" />
        <Skeleton width="100%" height="8px" className="mt-4" radius="var(--radius-full)" />
      </div>
    </div>
  );
}
