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
  return getModuleSlugsForRole("ADMIN").map((module) => ({ module }));
}

export default async function AdminModulePage({ params }: PageProps) {
  const { module } = await params;

  if (module === "dashboard") {
    redirect(ROUTES.admin.dashboard);
  }

  if (!isPlaceholderModule("ADMIN", module)) {
    notFound();
  }

  const title = getModuleTitleForRole("ADMIN", module);

  if (!title) {
    notFound();
  }

  return (
    <PlaceholderPage title={title} basePath={ROUTES.admin.base} />
  );
}
