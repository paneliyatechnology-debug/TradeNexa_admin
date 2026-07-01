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
  return getModuleSlugsForRole("SUPPORT_ADMIN").map((module) => ({ module }));
}

export default async function SupportModulePage({ params }: PageProps) {
  const { module } = await params;

  if (module === "dashboard") {
    redirect(ROUTES.support.dashboard);
  }

  if (!isPlaceholderModule("SUPPORT_ADMIN", module)) {
    notFound();
  }

  const title = getModuleTitleForRole("SUPPORT_ADMIN", module);

  if (!title) {
    notFound();
  }

  return (
    <PlaceholderPage title={title} basePath={ROUTES.support.base} />
  );
}
