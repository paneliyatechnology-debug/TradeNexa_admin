import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { SUPPORT_DASHBOARD } from "@/constants/dashboard-data";
import { Headphones, MessageSquare, Ticket } from "lucide-react";

export function SupportAdminDashboard() {
  const data = SUPPORT_DASHBOARD;

  const statusVariant = {
    open: "danger",
    pending: "warning",
    resolved: "success",
  } as const;

  const priorityVariant = {
    high: "danger",
    medium: "warning",
    low: "info",
  } as const;

  return (
    <div className="space-y-4 md:space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Support Dashboard</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Manage customer support tickets and inquiries.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-4 md:gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Latest Tickets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.latestTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-md border border-border p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-mono text-muted-foreground">
                      {ticket.id}
                    </p>
                    <p className="text-sm font-medium mt-0.5">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {ticket.customer}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant={statusVariant[ticket.status]}>
                      {ticket.status}
                    </Badge>
                    <Badge variant={priorityVariant[ticket.priority]}>
                      {ticket.priority}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{ticket.time}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Headphones className="h-4 w-4" />
              Support Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.supportActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-md p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-success/10">
                  <Headphones className="h-4 w-4 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.agent} — {activity.detail}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {activity.time}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Customer Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {data.customerMessages.map((message) => (
              <div
                key={message.id}
                className="rounded-md border border-border p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{message.name}</p>
                  {message.unread && (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {message.message}
                </p>
                <p className="text-xs text-muted-foreground mt-2">{message.time}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
