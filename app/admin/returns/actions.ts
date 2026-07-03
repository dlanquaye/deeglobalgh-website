"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/app/lib/adminAuth";
import { redirect } from "next/navigation";

import {
  ReturnStatus,
  ReturnType,
  ReturnCondition,
} from "@prisma/client";

export async function createReturnRequest(formData: FormData) {
  const session = await requireAdmin();

const {
  adminId,
  staffId,
  branchId,
  staffName,
} = session;



  const data = Object.fromEntries(formData.entries());
  const orderId = data.orderId as string;
const returnType = data.returnType as string;
const customerReason = (data.customerReason as string)?.trim() ?? "";

if (!orderId) {
  throw new Error("Order ID is required.");
}

if (
  returnType !== ReturnType.REFUND &&
  returnType !== ReturnType.EXCHANGE
) {
  throw new Error("Invalid return type.");
}

if (!customerReason) {
  throw new Error("Customer reason is required.");
}

const order = await prisma.order.findUnique({
  where: {
    id: orderId,
  },
});

const selectedItems = Object.keys(data).filter((key) =>
  key.startsWith("selected-")
);

if (!order) {
  throw new Error("Order not found.");
}

if (selectedItems.length === 0) {
  throw new Error("Please select at least one item to return.");
}

const year = new Date().getFullYear();

const lastReturn = await prisma.returnRequest.findFirst({
  where: {
    returnNumber: {
      startsWith: `RET-${year}-`,
    },
  },
  orderBy: {
    createdAt: "desc",
  },
});

let nextNumber = 1;

if (lastReturn) {
  const lastSequence = Number(
    lastReturn.returnNumber.split("-").pop()
  );

  if (!Number.isNaN(lastSequence)) {
    nextNumber = lastSequence + 1;
  }
}

const returnNumber = `RET-${year}-${String(nextNumber).padStart(6, "0")}`;

const returnRequest = await prisma.returnRequest.create({
  data: {
    returnNumber,
    orderId: order.id,
    branchId: branchId!,
    requestedByStaffId: staffId!,
    type: returnType,
    status: ReturnStatus.PENDING,
    customerReason,
  },
});

console.log("✅ Return Request Created:", returnRequest.id);

for (const key of selectedItems) {
  const orderItemId = key.replace("selected-", "");

  const quantity = Number(data[`quantity-${orderItemId}`]);
  


  const condition = data[
  `condition-${orderItemId}`
] as ReturnCondition;

  if (quantity <= 0) continue;

  const orderItem = await prisma.orderItem.findUnique({
  where: {
    id: orderItemId,
  },
});

if (!orderItem) {
  throw new Error("Order item not found.");
}

  await prisma.returnItem.create({
    data: {
  returnRequestId: returnRequest.id,
  orderItemId,
  productId: orderItem.productId,
  quantity,
  condition,
},
  });
}

console.log("✅ Return Items Created");

redirect("/admin/returns");


;}