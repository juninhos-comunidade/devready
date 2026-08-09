import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { demoModeEnabled } from "@/lib/demo-mode";
import { warmUpDatabase } from "@/lib/db-warmup";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // disparado sem "await" de propósito — não queremos atrasar a resposta
  // dessa página esperando o banco acordar, só avisar ele que vai precisar
  // em breve (ver lib/db-warmup.ts)
  warmUpDatabase();

  if (demoModeEnabled) {
    return children;
  }

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  return children;
}
