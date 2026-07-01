import type { User } from "@/types/auth";

export const MOCK_USERS: Array<User & { password: string }> = [
  {
    id: "1",
    email: "superadmin@test.com",
    password: "123456",
    name: "Super Admin",
    role: "SUPER_ADMIN",
    avatar: undefined,
  },
  {
    id: "2",
    email: "admin@test.com",
    password: "123456",
    name: "Admin User",
    role: "ADMIN",
    avatar: undefined,
  },
  {
    id: "3",
    email: "support@test.com",
    password: "123456",
    name: "Support Admin",
    role: "SUPPORT_ADMIN",
    avatar: undefined,
  },
];
