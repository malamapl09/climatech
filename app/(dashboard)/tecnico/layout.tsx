import { requireRole } from "@/lib/auth/require-role";

export default async function TecnicoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("technician", "admin");
  return <>{children}</>;
}
