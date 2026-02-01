export const runtime = "nodejs";

const HUBTEL_BASE_URL = "https://sms.hubtel.com/v1/messages/send";

export async function sendOrderSMS({
  phone,
  message,
}: {
  phone: string;
  message: string;
}) {
  const clientId = process.env.HUBTEL_CLIENT_ID!;
  const clientSecret = process.env.HUBTEL_CLIENT_SECRET!;
  const senderId = process.env.HUBTEL_SENDER_ID!;

  if (!clientId || !clientSecret || !senderId) {
    throw new Error("Missing Hubtel environment variables");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(HUBTEL_BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      From: senderId,
      To: phone,
      Content: message,
    }),
  });

  const text = await res.text();

  console.log("📩 HUBTEL STATUS:", res.status);
  console.log("📩 HUBTEL BODY:", text);

  if (!res.ok) {
    throw new Error(`Hubtel SMS failed: ${text}`);
  }

  return text;
}
