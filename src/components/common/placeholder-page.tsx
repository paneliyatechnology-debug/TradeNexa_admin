import { EmptyState } from "@/components/ui/empty-state";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  basePath: string;
}

export function PlaceholderPage({ title, basePath }: PlaceholderPageProps) {
  const isDashboard = title === "Dashboard";

  return (
    <div className="space-y-4 md:space-y-5">
      <div>
        <Breadcrumb
          items={
            isDashboard
              ? [{ label: "Dashboard" }]
              : [
                  { label: "Dashboard", href: `${basePath}/dashboard` },
                  { label: title },
                ]
          }
        />
        <h1 className="mt-2 text-xl font-semibold tracking-tight md:text-2xl">
          {title}
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          This module is not available yet. Check back after the next release.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <EmptyState
          icon={<Construction className="h-6 w-6" />}
          title="Coming soon"
          description={`We are still building ${title}. You will see a notice here when it is ready.`}
        />
      </div>
    </div>
  );
}
