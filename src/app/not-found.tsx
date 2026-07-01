import { ErrorPage } from "@/components/common/error-page";

export default function NotFound() {
  return (
    <ErrorPage
      code="404"
      title="Page Not Found"
      description="The page you're looking for doesn't exist or has been moved."
    />
  );
}
