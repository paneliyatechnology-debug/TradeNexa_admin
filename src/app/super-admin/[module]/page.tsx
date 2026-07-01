import { PlaceholderPage } from "@/components/common/placeholder-page";
import {
  getModuleSlugsForRole,
  getModuleTitleForRole,
  isPlaceholderModule,
} from "@/config/navigation";
import { ROUTES } from "@/config/routes";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ module: string }>;
}

export async function generateStaticParams() {
  return getModuleSlugsForRole("SUPER_ADMIN").map((module) => ({ module }));
}

export default async function SuperAdminModulePage({ params }: PageProps) {
  const { module } = await params;

  if (module === "dashboard") {
    redirect(ROUTES.superAdmin.dashboard);
  }

  if (!isPlaceholderModule("SUPER_ADMIN", module)) {
    notFound();
  }

  const title = getModuleTitleForRole("SUPER_ADMIN", module);

  if (!title) {
    notFound();
  }

  return (
    <PlaceholderPage title={title} basePath={ROUTES.superAdmin.base} />
  );
}
