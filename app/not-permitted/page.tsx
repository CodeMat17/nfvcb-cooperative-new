import Link from "next/link";

export default function NotPermittedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-4xl font-bold text-red-600">Access Denied</h1>
        <p className="text-muted-foreground max-w-sm text-base">
          You do not have permission to view this page. Only administrators are
          allowed here.
        </p>
      </div>
      <Link
        href="/"
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-6 py-2 text-sm font-medium transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}
