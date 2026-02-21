import { requireRole } from "@/lib/auth/require-role";

export default async function SupervisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("supervisor", "admin");
  return <>{children}</>;
}
