export function PropertySkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-video bg-muted rounded-lg mb-3" />
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-3 bg-muted rounded w-2/3" />
      </div>
      <div className="flex gap-2 mt-3">
        <div className="h-3 bg-muted rounded w-1/4" />
        <div className="h-3 bg-muted rounded w-1/4" />
      </div>
    </div>
  )
}
