import { ErrorPage } from "@/components/common/error-page";

export default function UnauthorizedPage() {
  return (
    <ErrorPage
      code="403"
      title="Unauthorized Access"
      description="You don't have permission to access this page. Please contact your administrator if you believe this is an error."
    />
  );
}
