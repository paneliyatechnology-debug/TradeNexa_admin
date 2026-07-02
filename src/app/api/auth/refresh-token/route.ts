import { API_ENDPOINTS } from "@/config/api";
import { backendPostPublic } from "@/lib/backend-fetch";

export async function POST(request: Request) {
  return backendPostPublic(API_ENDPOINTS.auth.refresh, request);
}
