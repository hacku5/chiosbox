export function DashboardSkeleton() {
  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-5xl mx-auto animate-pulse">
        {/* Welcome card skeleton */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-deep-sea-teal/5 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="h-7 bg-deep-sea-teal/5 rounded-lg w-48 mb-3" />
              <div className="h-4 bg-deep-sea-teal/5 rounded-lg w-36" />
            </div>
            <div className="h-10 bg-deep-sea-teal/5 rounded-xl w-40" />
          </div>
        </div>

        {/* Bento grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active packages */}
          <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-deep-sea-teal/5">
            <div className="h-5 bg-deep-sea-teal/5 rounded-lg w-32 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-deep-sea-teal/[0.02]">
                  <div className="w-10 h-10 rounded-lg bg-deep-sea-teal/5" />
                  <div className="flex-1">
                    <div className="h-4 bg-deep-sea-teal/5 rounded-lg w-32 mb-2" />
                    <div className="h-3 bg-deep-sea-teal/5 rounded-lg w-24" />
                  </div>
                  <div className="h-6 bg-deep-sea-teal/5 rounded-full w-16" />
                </div>
              ))}
            </div>
          </div>

          {/* Storage countdown */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-deep-sea-teal/5 flex flex-col items-center justify-center">
            <div className="h-5 bg-deep-sea-teal/5 rounded-lg w-28 mb-4" />
            <div className="w-24 h-24 rounded-full bg-deep-sea-teal/5 mb-3" />
            <div className="h-4 bg-deep-sea-teal/5 rounded-lg w-20" />
          </div>

          {/* Quick stats */}
          <div className="bg-deep-sea-teal/5 rounded-2xl p-6">
            <div className="h-8 bg-deep-sea-teal/10 rounded-lg w-12 mb-2" />
            <div className="h-4 bg-deep-sea-teal/10 rounded-lg w-24 mb-4" />
            <div className="h-8 bg-deep-sea-teal/10 rounded-lg w-12 mb-2" />
            <div className="h-4 bg-deep-sea-teal/10 rounded-lg w-24" />
          </div>

          {/* Quick actions */}
          <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-deep-sea-teal/5">
            <div className="h-5 bg-deep-sea-teal/5 rounded-lg w-28 mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-deep-sea-teal/[0.02]">
                  <div className="w-6 h-6 rounded bg-deep-sea-teal/5" />
                  <div className="h-3 bg-deep-sea-teal/5 rounded-lg w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PackageListSkeleton() {
  return (
    <div className="p-6 lg:p-8 animate-pulse">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="h-7 bg-deep-sea-teal/5 rounded-lg w-32 mb-2" />
            <div className="h-4 bg-deep-sea-teal/5 rounded-lg w-48" />
          </div>
          <div className="h-10 bg-deep-sea-teal/5 rounded-full w-28" />
        </div>
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 bg-deep-sea-teal/5 rounded-full w-20" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-deep-sea-teal/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-deep-sea-teal/5" />
                <div className="flex-1">
                  <div className="h-4 bg-deep-sea-teal/5 rounded-lg w-32 mb-2" />
                  <div className="h-3 bg-deep-sea-teal/5 rounded-lg w-24" />
                </div>
                <div className="h-6 bg-deep-sea-teal/5 rounded-full w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
