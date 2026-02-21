import { requireRole } from "@/lib/auth/require-role";

export default async function OperacionesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("operations", "admin");
  return <>{children}</>;
}
