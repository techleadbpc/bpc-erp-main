import { Skeleton } from "@/components/ui/skeleton";

export default function TableSkeleton({ rows = 12, cols = 8 }) {
  return (
    <div className="w-full bordesr rounded overflow-hidden">
      <div className="grid grid-cols-1">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-4 px-4 py-3 border-b bg-muted">
          {[...Array(cols)].map((_, i) => (
            <Skeleton key={`head-${i}`} className="h-4 w-full" />
          ))}
        </div>
        {[...Array(rows)].map((_, rowIdx) => (
          <div
            key={`row-${rowIdx}`}
            className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-4 px-4 py-3 border-b"
          >
            {[...Array(cols)].map((_, colIdx) => (
              <Skeleton key={`cell-${rowIdx}-${colIdx}`} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}