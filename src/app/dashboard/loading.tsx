export default function DashboardLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-foreground/5 rounded-md w-48" />
        <div className="h-4 bg-foreground/5 rounded-md w-64" />
        <div className="space-y-4 mt-8">
          <div className="h-32 bg-foreground/5 rounded-md" />
          <div className="h-32 bg-foreground/5 rounded-md" />
        </div>
      </div>
    </div>
  )
}
