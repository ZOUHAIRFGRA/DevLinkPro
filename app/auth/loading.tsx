import { FormSkeleton } from "@/components/skeletons/generic-skeleton";

export default function Loading() {
  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <div className="h-6 w-32 bg-white/20 animate-pulse rounded-md" />
        </div>
        <div className="relative z-20 mt-auto">
          <div className="space-y-2">
            <div className="h-6 w-64 bg-white/20 animate-pulse rounded-md" />
            <div className="h-4 w-48 bg-white/20 animate-pulse rounded-md" />
          </div>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <div className="h-6 w-32 mx-auto bg-muted animate-pulse rounded-md mb-2" />
            <div className="h-4 w-64 mx-auto bg-muted animate-pulse rounded-md" />
          </div>
          <FormSkeleton />
        </div>
      </div>
    </div>
  );
}
