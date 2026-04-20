import { redirect } from "next/navigation";

export default function OrderControlRedirect() {
  redirect("/admin/db-orders");
}