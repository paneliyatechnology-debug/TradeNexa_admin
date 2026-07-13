"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        className="flex min-h-screen items-center justify-center p-6"
        style={{ background: "#0B1F2A", color: "#F4F6F8", fontFamily: "system-ui, sans-serif" }}
      >
        <div className="text-center max-w-md">
          <p style={{ fontSize: "3.5rem", fontWeight: 600, color: "#0E7C6B", margin: 0 }}>
            500
          </p>
          <h1 style={{ marginTop: "0.75rem", fontSize: "1.25rem", fontWeight: 600 }}>
            Something went wrong
          </h1>
          <p style={{ marginTop: "0.5rem", fontSize: "0.8125rem", color: "#8A9AA6" }}>
            A critical error occurred. Refresh the page to try again.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              display: "inline-flex",
              height: "2.25rem",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "0.5rem",
              background: "#0E7C6B",
              padding: "0 1.25rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#ffffff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
