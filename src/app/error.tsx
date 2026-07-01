"use client";

import { ErrorPage } from "@/components/common/error-page";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="relative">
      <ErrorPage
        code="500"
        title="Something went wrong"
        description="An unexpected error occurred. Please try again or contact support."
        showHome
        showBack
      />
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <button
          onClick={reset}
          className="text-sm text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
