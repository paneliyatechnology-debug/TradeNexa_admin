export const SUPER_ADMIN_DASHBOARD = {
  stats: [
    { title: "Total Users", value: "24,583", change: "+12.5%", trend: "up" as const, icon: "users" },
    { title: "Total Sellers", value: "8,429", change: "+8.2%", trend: "up" as const, icon: "store" },
    { title: "Total Buyers", value: "16,154", change: "+15.3%", trend: "up" as const, icon: "shopping-bag" },
    { title: "Revenue", value: "₹4.2Cr", change: "+22.1%", trend: "up" as const, icon: "indian-rupee" },
    { title: "Active Products", value: "1,24,892", change: "+5.7%", trend: "up" as const, icon: "package" },
    { title: "Pending Approvals", value: "342", change: "-3.2%", trend: "down" as const, icon: "clock" },
  ],
  recentActivity: [
    { id: "1", action: "New seller registration", user: "TechCorp Industries", time: "2 min ago", type: "seller" },
    { id: "2", action: "Product approved", user: "Steel Pipes - Grade A", time: "15 min ago", type: "product" },
    { id: "3", action: "User account verified", user: "Rajesh Kumar", time: "32 min ago", type: "user" },
    { id: "4", action: "Payment received", user: "₹2,45,000 from BuildMart", time: "1 hr ago", type: "payment" },
    { id: "5", action: "Category updated", user: "Industrial Machinery", time: "2 hrs ago", type: "category" },
  ],
  systemStatus: [
    { name: "API Server", status: "operational" as const, uptime: "99.99%" },
    { name: "Database", status: "operational" as const, uptime: "99.95%" },
    { name: "Payment Gateway", status: "operational" as const, uptime: "99.90%" },
    { name: "Email Service", status: "degraded" as const, uptime: "98.50%" },
    { name: "CDN", status: "operational" as const, uptime: "99.99%" },
  ],
  quickActions: [
    { label: "Approve Sellers", count: 28 },
    { label: "Review Products", count: 156 },
    { label: "Manage Users", count: 12 },
    { label: "View Reports", count: null },
  ],
  notifications: [
    { id: "1", title: "System backup completed", time: "30 min ago", read: false },
    { id: "2", title: "New admin login detected", time: "1 hr ago", read: false },
    { id: "3", title: "Weekly report ready", time: "3 hrs ago", read: true },
    { id: "4", title: "Server maintenance scheduled", time: "5 hrs ago", read: true },
  ],
};

export const ADMIN_DASHBOARD = {
  stats: [
    { title: "Buyers", value: "16,154", change: "+15.3%", trend: "up" as const, icon: "shopping-bag" },
    { title: "Sellers", value: "8,429", change: "+8.2%", trend: "up" as const, icon: "store" },
    { title: "Products", value: "1,24,892", change: "+5.7%", trend: "up" as const, icon: "package" },
    { title: "Pending Listings", value: "234", change: "-2.1%", trend: "down" as const, icon: "clock" },
    { title: "Inquiries", value: "1,892", change: "+18.4%", trend: "up" as const, icon: "message-square" },
    { title: "Today's Activity", value: "847", change: "+6.8%", trend: "up" as const, icon: "activity" },
  ],
  recentActivities: [
    { id: "1", action: "New buyer inquiry", detail: "Looking for bulk steel pipes", time: "5 min ago" },
    { id: "2", action: "Listing submitted", detail: "CNC Machine Parts by AutoTech", time: "18 min ago" },
    { id: "3", action: "Seller verified", detail: "GreenEnergy Solutions", time: "45 min ago" },
    { id: "4", action: "Product flagged", detail: "Duplicate listing detected", time: "1 hr ago" },
    { id: "5", action: "RFQ received", detail: "500 units industrial valves", time: "2 hrs ago" },
  ],
  pendingTasks: [
    { id: "1", task: "Review seller documents", priority: "high" as const, due: "Today" },
    { id: "2", task: "Approve product listings", priority: "medium" as const, due: "Today" },
    { id: "3", task: "Respond to buyer inquiry", priority: "high" as const, due: "2 hrs" },
    { id: "4", task: "Update category mapping", priority: "low" as const, due: "Tomorrow" },
  ],
  statistics: [
    { label: "Conversion Rate", value: "3.8%", progress: 38 },
    { label: "Seller Onboarding", value: "72%", progress: 72 },
    { label: "Product Approval", value: "89%", progress: 89 },
    { label: "Response Time", value: "94%", progress: 94 },
  ],
};

export const SUPPORT_DASHBOARD = {
  stats: [
    { title: "Open Tickets", value: "47", change: "+5", trend: "up" as const, icon: "ticket" },
    { title: "Pending Tickets", value: "23", change: "-3", trend: "down" as const, icon: "clock" },
    { title: "Resolved Tickets", value: "156", change: "+12", trend: "up" as const, icon: "check-circle" },
    { title: "Customer Queries", value: "89", change: "+8", trend: "up" as const, icon: "help-circle" },
    { title: "Active Chats", value: "12", change: "Live", trend: "neutral" as const, icon: "message-circle" },
    { title: "Today's Responses", value: "64", change: "+18%", trend: "up" as const, icon: "send" },
  ],
  latestTickets: [
    { id: "TKT-2847", subject: "Payment not reflected", customer: "BuildMart Pvt Ltd", status: "open" as const, priority: "high" as const, time: "10 min ago" },
    { id: "TKT-2846", subject: "Unable to upload product images", customer: "SteelWorks Inc", status: "pending" as const, priority: "medium" as const, time: "25 min ago" },
    { id: "TKT-2845", subject: "Account verification delay", customer: "Rajesh Kumar", status: "open" as const, priority: "high" as const, time: "1 hr ago" },
    { id: "TKT-2844", subject: "RFQ response not received", customer: "AutoParts Co", status: "resolved" as const, priority: "low" as const, time: "2 hrs ago" },
  ],
  supportActivity: [
    { id: "1", action: "Ticket resolved", agent: "You", detail: "TKT-2840 - Login issue", time: "15 min ago" },
    { id: "2", action: "Chat started", agent: "Priya S.", detail: "Buyer inquiry assistance", time: "30 min ago" },
    { id: "3", action: "Ticket escalated", agent: "System", detail: "TKT-2838 - Payment dispute", time: "1 hr ago" },
    { id: "4", action: "Response sent", agent: "You", detail: "TKT-2835 - Product listing help", time: "2 hrs ago" },
  ],
  customerMessages: [
    { id: "1", name: "Amit Sharma", message: "When will my seller account be approved?", time: "5 min ago", unread: true },
    { id: "2", name: "Priya Patel", message: "Need help with bulk order pricing", time: "20 min ago", unread: true },
    { id: "3", name: "Vikram Singh", message: "Thank you for resolving my issue!", time: "1 hr ago", unread: false },
    { id: "4", name: "Neha Gupta", message: "How to update company profile?", time: "3 hrs ago", unread: false },
  ],
};
