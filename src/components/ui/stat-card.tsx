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
    <Card
      className={cn(
        "group hover:shadow-md hover:border-primary/20 transition-all duration-300",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {change && (
              <div className="flex items-center gap-1">
                {trend === "up" && (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                )}
                {trend === "down" && (
                  <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                )}
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend === "up" && "text-emerald-600",
                    trend === "down" && "text-red-600",
                    trend === "neutral" && "text-muted-foreground"
                  )}
                >
                  {change}
                </span>
              </div>
            )}
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
