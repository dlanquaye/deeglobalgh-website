import PaymentSuccessClient from "./PaymentSuccessClient";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const params = await searchParams;
  const reference = params?.reference ?? null;

  return <PaymentSuccessClient reference={reference} />;
}