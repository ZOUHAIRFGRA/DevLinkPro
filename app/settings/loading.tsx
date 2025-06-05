import { FormSkeleton } from "@/components/skeletons/generic-skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-8 w-32 mb-2 bg-muted animate-pulse rounded-md" />
        <div className="h-4 w-64 bg-muted animate-pulse rounded-md" />
      </div>
      
      <div className="space-y-6">
        {/* Settings sections */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-6">
            <div className="h-5 w-40 mb-4 bg-muted animate-pulse rounded-md" />
            <FormSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}
