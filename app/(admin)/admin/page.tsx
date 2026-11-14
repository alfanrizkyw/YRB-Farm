import { cookies } from "next/headers";
import AdminApp from "@/components/admin/AdminApp";
import { adminConfigured, sessionCookie, verifySession } from "@/lib/session";
import { getAdminContent } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const jar = await cookies();
  const authed = verifySession(jar.get(sessionCookie.name)?.value);
  const initial = authed ? await getAdminContent() : null;

  return <AdminApp authed={authed} configured={adminConfigured} initial={initial} />;
}
