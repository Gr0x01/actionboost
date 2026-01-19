import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 404 number */}
        <div className="text-[120px] font-bold leading-none text-cta/20 select-none">
          404
        </div>

        {/* Message */}
        <h1 className="text-2xl font-semibold text-foreground -mt-4 mb-3">
          Page not found
        </h1>
        <p className="text-muted mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-cta text-white font-medium rounded-lg hover:bg-cta-hover transition-colors"
          >
            Go home
          </Link>
          <Link
            href="/start"
            className="inline-flex items-center justify-center px-6 py-3 border border-border text-foreground font-medium rounded-lg hover:bg-surface transition-colors"
          >
            Get your action plan
          </Link>
        </div>
      </div>
    </div>
  );
}
