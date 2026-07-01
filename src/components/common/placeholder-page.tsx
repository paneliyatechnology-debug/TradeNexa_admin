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
    <div className="space-y-6">
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
        <h1 className="mt-2 text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1">
          This module will be available in a future update.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <EmptyState
          icon={<Construction className="h-8 w-8 text-muted-foreground" />}
          title="Coming Soon"
          description={`The ${title} module is under development. Check back later for full functionality.`}
        />
      </div>
    </div>
  );
}
