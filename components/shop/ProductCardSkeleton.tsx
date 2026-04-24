export default function ProductCardSkeleton() {
  return (
    <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] shadow-sm overflow-hidden">
      {/* image placeholder */}
      <div className="h-48 skeleton-shimmer" />

      {/* content */}
      <div className="p-3 flex flex-col items-center gap-2">
        {/* name */}
        <div className="h-4 skeleton-shimmer rounded w-3/4" />
        {/* price */}
        <div className="h-5 skeleton-shimmer rounded w-2/5 mt-1" />
        {/* stock warning spacer */}
        <div className="h-3 w-full" />
        {/* button */}
        <div className="h-8 skeleton-shimmer rounded-md w-full" />
      </div>
    </div>
  );
}
