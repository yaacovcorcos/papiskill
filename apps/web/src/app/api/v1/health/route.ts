import { jsonResponse } from "@/lib/server/http";

export function GET() {
  return jsonResponse({
    ok: true,
    service: "papiskill",
  });
}
