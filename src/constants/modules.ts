import type { UserRole } from "@/types/auth";
import {
  getModuleSlugsForRole,
  getModuleTitleForRole,
} from "@/config/navigation";

export function getRoleModuleTitles(role: UserRole): Record<string, string> {
  return getModuleSlugsForRole(role).reduce<Record<string, string>>(
    (acc, slug) => {
      const title = getModuleTitleForRole(role, slug);
      if (title) acc[slug] = title;
      return acc;
    },
    {}
  );
}

export { getModuleSlugsForRole, getModuleTitleForRole };
