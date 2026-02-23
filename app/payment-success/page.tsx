"use client"
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useCart } from "@/app/context/CartContext"
import { buildAdminOrderMessage, buildWhatsAppLink } from "@/app/lib/whatsapp"

export default function PaymentSuccessPage() {
  const { clearCart } = useCart()
  const searchParams = useSearchParams()
  const reference = searchParams.get("reference")

  const [order, setOrder] = useState<any>(null)

  // Clear cart after payment
  useEffect(() => {
  clearCart()
  // run only once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])

  // Fetch order from database using reference
  useEffect(() => {
    async function fetchOrder() {
      if (!reference) return

      const res = await fetch(`/api/order-by-reference?reference=${reference}`)
      const data = await res.json()

      if (!data.error) {
        setOrder(data)
      }
    }

    fetchOrder()
  }, [reference])

  const message = order ? buildAdminOrderMessage(order) : ""
  const whatsappLink = order ? buildWhatsAppLink(message) : "#"

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-green-600">
        Payment Successful
      </h1>

      <p className="mt-4 text-lg text-gray-700">
        Your payment has been received successfully.
      </p>

      <p className="mt-6 text-gray-700">
        We are processing your order and will contact you shortly for delivery.
      </p>

      {order && (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-8 px-6 py-3 bg-green-600 text-white font-semibold rounded-md"
        >
          Notify Admin via WhatsApp
        </a>
      )}
    </main>
  )
}