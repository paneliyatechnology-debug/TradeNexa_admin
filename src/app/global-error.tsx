"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50 p-6">
        <div className="text-center max-w-md">
          <p className="text-8xl font-bold text-indigo-400">500</p>
          <h1 className="mt-4 text-2xl font-bold">Server Error</h1>
          <p className="mt-2 text-zinc-400">
            A critical error occurred. Please refresh the page.
          </p>
          <button
            onClick={reset}
            className="mt-8 inline-flex h-10 items-center justify-center rounded-xl bg-indigo-500 px-6 text-sm font-medium text-white hover:bg-indigo-600 transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
