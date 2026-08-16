import { demoModeEnabled } from "@/lib/demo-mode";

export function GET() {
  return Response.json({
    status: "ok",
    mode: demoModeEnabled ? "demo" : "authenticated",
    timestamp: new Date().toISOString(),
  });
}
