import { AuthShell } from "@/components/auth-shell";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthShell>{children}</AuthShell>;
}
