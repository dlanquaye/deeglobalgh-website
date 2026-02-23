import PaymentSuccessClient from "./PaymentSuccessClient";

export default function Page({
  searchParams,
}: {
  searchParams: { reference?: string };
}) {
  return (
    <PaymentSuccessClient reference={searchParams?.reference ?? null} />
  );
}