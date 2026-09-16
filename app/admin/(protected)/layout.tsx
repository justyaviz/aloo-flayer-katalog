import { requireAdmin } from "@/lib/auth";
import AdminHeader from "@/components/AdminHeader";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <div className="admin-shell"><AdminHeader />{children}</div>;
}
