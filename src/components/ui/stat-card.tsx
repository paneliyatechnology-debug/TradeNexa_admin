import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils/cn";
import {
  Activity,
  CheckCircle,
  Clock,
  HelpCircle,
  IndianRupee,
  MessageCircle,
  MessageSquare,
  Package,
  Send,
  ShoppingBag,
  Store,
  Ticket,
  TrendingDown,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  users: Users,
  store: Store,
  "shopping-bag": ShoppingBag,
  "indian-rupee": IndianRupee,
  package: Package,
  clock: Clock,
  "message-square": MessageSquare,
  activity: Activity,
  ticket: Ticket,
  "check-circle": CheckCircle,
  "help-circle": HelpCircle,
  "message-circle": MessageCircle,
  send: Send,
};

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  trend = "neutral",
  icon,
  className,
}: StatCardProps) {
  const Icon = icon ? iconMap[icon] ?? Activity : Activity;

  return (
    <Card className={cn("transition-colors hover:border-primary/30", className)}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0">
            <p className="text-[13px] font-medium text-muted-foreground">{title}</p>
            <p className="text-xl font-semibold tracking-tight font-data">{value}</p>
            {change && (
              <div className="flex items-center gap-1">
                {trend === "up" && (
                  <TrendingUp className="h-3.5 w-3.5 text-success" />
                )}
                {trend === "down" && (
                  <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                )}
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend === "up" && "text-success",
                    trend === "down" && "text-destructive",
                    trend === "neutral" && "text-muted-foreground"
                  )}
                >
                  {change}
                </span>
              </div>
            )}
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-primary">
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
