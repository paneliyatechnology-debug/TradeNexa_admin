import { API_ENDPOINTS } from "@/config/api";
import { backendFetch } from "@/lib/backend-fetch";

export async function GET(request: Request) {
  return backendFetch(API_ENDPOINTS.auth.profile, request);
}
