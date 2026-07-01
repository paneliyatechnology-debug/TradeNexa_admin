import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { SUPER_ADMIN_DASHBOARD } from "@/constants/dashboard-data";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Zap,
} from "lucide-react";

export function SuperAdminDashboard() {
  const data = SUPER_ADMIN_DASHBOARD;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Super Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Platform overview and system management
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-xl p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {activity.user}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {activity.time}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.systemStatus.map((system) => (
              <div
                key={system.name}
                className="flex items-center justify-between rounded-xl border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  {system.status === "operational" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                  <span className="text-sm font-medium">{system.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      system.status === "operational" ? "success" : "warning"
                    }
                  >
                    {system.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {system.uptime}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {data.quickActions.map((action) => (
              <button
                key={action.label}
                className="flex items-center justify-between rounded-xl border border-border p-4 text-left hover:bg-muted/50 hover:border-primary/20 transition-all group"
              >
                <span className="text-sm font-medium">{action.label}</span>
                <div className="flex items-center gap-2">
                  {action.count !== null && (
                    <Badge variant="info">{action.count}</Badge>
                  )}
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start gap-3 rounded-xl p-3 hover:bg-muted/50 transition-colors"
              >
                <div
                  className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                    notification.read ? "bg-muted-foreground/30" : "bg-primary"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{notification.title}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" />
                    {notification.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
