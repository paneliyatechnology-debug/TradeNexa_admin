import { backendFetch } from "@/lib/backend-fetch";

export async function GET(request: Request) {
  return backendFetch("/products", request);
}
