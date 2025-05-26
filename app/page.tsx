import { Suspense } from "react"
import { Dashboard } from "@/components/dashboard"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard />
      </Suspense>
    </main>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex h-screen">
      <div className="w-64 border-r p-4">
        <Skeleton className="h-8 w-full mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
      <div className="flex-1 p-6">
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-[500px] w-full rounded-lg" />
      </div>
    </div>
  )
}
