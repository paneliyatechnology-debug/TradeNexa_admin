import { API_ENDPOINTS } from "@/config/api";
import { backendPost } from "@/lib/backend-fetch";

export async function POST(request: Request) {
  return backendPost(API_ENDPOINTS.auth.logout, request);
}
