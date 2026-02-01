import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("dg_admin");

  if (!isAdmin) {
    redirect("/admin/login");
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Admin Dashboard</h1>
      <p>You are logged in.</p>
    </div>
  );
}
