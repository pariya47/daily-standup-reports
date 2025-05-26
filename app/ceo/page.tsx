import { Suspense } from "react"
import { CEODashboard } from "@/components/ceo-dashboard"
import { Skeleton } from "@/components/ui/skeleton"

export default function CEOPage() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<DashboardSkeleton />}>
        <CEODashboard />
      </Suspense>
    </main>
  )
}

function DashboardSkeleton() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Skeleton className="h-10 w-64 mb-6" />
      <Skeleton className="h-12 w-full mb-6" />
      <Skeleton className="h-40 w-full mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Skeleton className="h-[400px] md:col-span-2" />
        <Skeleton className="h-[400px]" />
      </div>
      <Skeleton className="h-80 w-full" />
    </div>
  )
}
