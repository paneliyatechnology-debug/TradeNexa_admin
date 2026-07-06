import type { UserRole } from "@/types/auth";

export const PREVIEW_ROLE_CHANGE_EVENT = "tradehub-preview-role-change";

const PREVIEW_ROLE_KEY = "tradehub_preview_role";

const VALID_ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN", "SUPPORT_ADMIN"];

function isUserRole(value: string): value is UserRole {
  return VALID_ROLES.includes(value as UserRole);
}

export function getPreviewRole(): UserRole | null {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem(PREVIEW_ROLE_KEY);
  if (!raw || !isUserRole(raw)) return null;

  return raw;
}

export function setPreviewRole(role: UserRole | null) {
  if (typeof window === "undefined") return;

  if (role) {
    sessionStorage.setItem(PREVIEW_ROLE_KEY, role);
  } else {
    sessionStorage.removeItem(PREVIEW_ROLE_KEY);
  }

  window.dispatchEvent(new Event(PREVIEW_ROLE_CHANGE_EVENT));
}

export function clearPreviewRole() {
  setPreviewRole(null);
}

export function subscribePreviewRole(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleChange = () => onStoreChange();

  window.addEventListener(PREVIEW_ROLE_CHANGE_EVENT, handleChange);
  window.addEventListener("storage", handleChange);

  return () => {
    window.removeEventListener(PREVIEW_ROLE_CHANGE_EVENT, handleChange);
    window.removeEventListener("storage", handleChange);
  };
}

export const ROLE_SWITCHER_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_ROLE_SWITCHER !== "false";
