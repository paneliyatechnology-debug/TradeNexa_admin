import type { UserRole } from "@/types/auth";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Award,
  BarChart3,
  Bell,
  CreditCard,
  FileText,
  FolderTree,
  HelpCircle,
  LayoutDashboard,
  LineChart,
  LogOut,
  Mail,
  Megaphone,
  MessageCircle,
  MessageSquareWarning,
  Newspaper,
  PackageCheck,
  Percent,
  RotateCcw,
  ScrollText,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Store,
  Tag,
  Ticket,
  UserCog,
  UserPlus,
  Wallet,
} from "lucide-react";

export interface RoleNavItem {
  label: string;
  slug: string;
  icon: LucideIcon;
  /** All items are placeholders until modules are built */
  comingSoon?: boolean;
}

export const LOGOUT_ITEM = {
  label: "Logout",
  slug: "logout",
  icon: LogOut,
};

const SUPER_ADMIN_NAV: RoleNavItem[] = [
  { label: "Dashboard", slug: "dashboard", icon: LayoutDashboard, comingSoon: true },
  { label: "Buyer Management", slug: "buyer-management", icon: ShoppingBag, comingSoon: true },
  { label: "Seller Management", slug: "seller-management", icon: Store, comingSoon: true },
  { label: "Seller Verification", slug: "seller-verification", icon: ShieldCheck, comingSoon: true },
  { label: "Product Approval", slug: "product-approval", icon: PackageCheck, comingSoon: true },
  { label: "Categories", slug: "category-brand", icon: FolderTree, comingSoon: false },
  { label: "Brands", slug: "brands", icon: Award, comingSoon: false },
  { label: "RFQ & Lead", slug: "rfq-lead", icon: FileText, comingSoon: true },
  { label: "Orders", slug: "orders", icon: ShoppingCart, comingSoon: true },
  { label: "Subscription Plans", slug: "subscription-plans", icon: CreditCard, comingSoon: true },
  { label: "Payments", slug: "payments", icon: Wallet, comingSoon: true },
  { label: "Commission", slug: "commission", icon: Percent, comingSoon: true },
  { label: "Banners", slug: "banners", icon: Megaphone, comingSoon: false },
  { label: "Offers", slug: "offers", icon: Tag, comingSoon: false },
  { label: "CMS", slug: "cms", icon: Newspaper, comingSoon: true },
  { label: "Notifications", slug: "notifications", icon: Bell, comingSoon: true },
  { label: "Reports", slug: "reports", icon: BarChart3, comingSoon: true },
  { label: "Analytics", slug: "analytics", icon: LineChart, comingSoon: true },
  { label: "Settings", slug: "settings", icon: Settings, comingSoon: true },
  { label: "Role & Permission", slug: "role-permission", icon: Shield, comingSoon: true },
  { label: "Create/Edit/Delete Admin", slug: "admin-management", icon: UserCog, comingSoon: true },
  { label: "Audit Logs", slug: "audit-logs", icon: ScrollText, comingSoon: true },
];

const ADMIN_NAV: RoleNavItem[] = [
  { label: "Dashboard", slug: "dashboard", icon: LayoutDashboard, comingSoon: true },
  { label: "Buyer Management", slug: "buyer-management", icon: ShoppingBag, comingSoon: true },
  { label: "Seller Management", slug: "seller-management", icon: Store, comingSoon: true },
  { label: "Seller Verification", slug: "seller-verification", icon: ShieldCheck, comingSoon: true },
  { label: "Product Approval", slug: "product-approval", icon: PackageCheck, comingSoon: true },
  { label: "Category Management", slug: "category-management", icon: FolderTree, comingSoon: false },
  { label: "Brand Management", slug: "brands", icon: Award, comingSoon: false },
  { label: "Offer Management", slug: "offers", icon: Tag, comingSoon: false },
  { label: "RFQ", slug: "rfq", icon: FileText, comingSoon: true },
  { label: "Lead Management", slug: "lead-management", icon: UserPlus, comingSoon: true },
  { label: "Orders", slug: "orders", icon: ShoppingCart, comingSoon: true },
  { label: "Support Tickets", slug: "support-tickets", icon: Ticket, comingSoon: true },
  { label: "Reports (View)", slug: "reports", icon: BarChart3, comingSoon: true },
  { label: "Notifications (Send)", slug: "notifications", icon: Bell, comingSoon: true },
];

const SUPPORT_ADMIN_NAV: RoleNavItem[] = [
  { label: "Dashboard", slug: "dashboard", icon: LayoutDashboard, comingSoon: true },
  { label: "Support Tickets", slug: "support-tickets", icon: Ticket, comingSoon: true },
  { label: "Buyer Complaints", slug: "buyer-complaints", icon: MessageSquareWarning, comingSoon: true },
  { label: "Seller Complaints", slug: "seller-complaints", icon: AlertTriangle, comingSoon: true },
  { label: "Contact Us", slug: "contact-us", icon: Mail, comingSoon: true },
  { label: "Refund Requests (Forward)", slug: "refund-requests", icon: RotateCcw, comingSoon: true },
  { label: "Live Chat Support", slug: "live-chat-support", icon: MessageCircle, comingSoon: true },
  { label: "FAQ Management (Basic)", slug: "faq-management", icon: HelpCircle, comingSoon: true },
];

export const ROLE_NAV_ITEMS: Record<UserRole, RoleNavItem[]> = {
  SUPER_ADMIN: SUPER_ADMIN_NAV,
  ADMIN: ADMIN_NAV,
  SUPPORT_ADMIN: SUPPORT_ADMIN_NAV,
};

export function getNavItemsForRole(role: UserRole): RoleNavItem[] {
  return ROLE_NAV_ITEMS[role];
}

export function getModuleSlugsForRole(role: UserRole): string[] {
  return ROLE_NAV_ITEMS[role]
    .filter((item) => item.slug !== "dashboard")
    .map((item) => item.slug);
}

export function getModuleTitleForRole(
  role: UserRole,
  slug: string
): string | undefined {
  return ROLE_NAV_ITEMS[role].find((item) => item.slug === slug)?.label;
}

export function isPlaceholderModule(role: UserRole, slug: string): boolean {
  const item = ROLE_NAV_ITEMS[role].find((nav) => nav.slug === slug);
  return item?.comingSoon === true;
}
