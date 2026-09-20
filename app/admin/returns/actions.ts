"use server";

import {
  ReturnCondition,
  ReturnStatus,
  ReturnType,
} from "@prisma/client";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/app/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export async function createReturnRequest(
  formData: FormData
) {
  const session =
    await requireAdmin();

  if (!session.staffId) {
    throw new Error(
      "An active linked staff account is required."
    );
  }

  if (!session.branchId) {
    throw new Error(
      "Your staff account is not assigned to a branch."
    );
  }

  const staff =
    await prisma.staff.findUnique({
      where: {
        id: session.staffId,
      },
      select: {
        id: true,
        role: true,
        isActive: true,
        branchId: true,
      },
    });

  if (
    !staff ||
    !staff.isActive
  ) {
    throw new Error(
      "An active staff account is required."
    );
  }

  const isSuperAdmin =
    session.role ===
      "SUPER_ADMIN" ||
    staff.role ===
      "SUPER_ADMIN";

  const canInitiateReturn =
    isSuperAdmin ||
    staff.role ===
      "MANAGER" ||
    staff.role ===
      "CASHIER" ||
    staff.role ===
      "SALES";

  if (!canInitiateReturn) {
    throw new Error(
      "You do not have permission to initiate returns."
    );
  }

  if (
    !isSuperAdmin &&
    staff.branchId !==
      session.branchId
  ) {
    throw new Error(
      "You do not have permission to initiate returns for this branch."
    );
  }

  const data =
    Object.fromEntries(
      formData.entries()
    );

  const orderId =
    typeof data.orderId ===
      "string"
      ? data.orderId.trim()
      : "";

  const returnType =
    typeof data.returnType ===
      "string"
      ? data.returnType
      : "";

  const customerReason =
    typeof data.customerReason ===
      "string"
      ? data.customerReason.trim()
      : "";

  if (!orderId) {
    throw new Error(
      "Order ID is required."
    );
  }

  if (
    returnType !==
      ReturnType.REFUND &&
    returnType !==
      ReturnType.EXCHANGE
  ) {
    throw new Error(
      "Invalid return type."
    );
  }

  if (!customerReason) {
    throw new Error(
      "Customer reason is required."
    );
  }

  /*
   * Load the Order and its legitimate items
   * together so submitted item IDs can be
   * verified against the selected Order.
   */
  const order =
    await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      select: {
        id: true,
        locationId: true,
        paymentStatus: true,

        orderItems: {
          select: {
            id: true,
            productId: true,
            quantity: true,
          },
        },
      },
    });

  if (!order) {
    throw new Error(
      "Order not found."
    );
  }

  /*
   * A normal staff member may only initiate
   * a return for an Order belonging to their
   * authenticated branch.
   */
  if (
    !isSuperAdmin &&
    order.locationId !==
      session.branchId
  ) {
    throw new Error(
      "You do not have permission to return items from this order."
    );
  }

  /*
   * Returns should relate to a completed
   * payment lifecycle, not an unpaid or
   * failed Order.
   */
  if (
    order.paymentStatus !==
    "PAID"
  ) {
    throw new Error(
      "Only paid orders can be returned."
    );
  }

  const selectedKeys =
    Object.keys(data).filter(
      (key) =>
        key.startsWith(
          "selected-"
        )
    );

  if (
    selectedKeys.length ===
    0
  ) {
    throw new Error(
      "Please select at least one item to return."
    );
  }

  const validConditions =
    new Set(
      Object.values(
        ReturnCondition
      )
    );

  const returnItems: Array<{
    orderItemId: string;
    productId: string;
    quantity: number;
    condition: ReturnCondition;
  }> = [];

  const seenOrderItemIds =
    new Set<string>();

  for (
    const key of
    selectedKeys
  ) {
    const orderItemId =
      key
        .replace(
          "selected-",
          ""
        )
        .trim();

    if (!orderItemId) {
      throw new Error(
        "Invalid order item."
      );
    }

    if (
      seenOrderItemIds.has(
        orderItemId
      )
    ) {
      throw new Error(
        "The same order item cannot be returned twice in one request."
      );
    }

    seenOrderItemIds.add(
      orderItemId
    );

    const orderItem =
      order.orderItems.find(
        (item) =>
          item.id ===
          orderItemId
      );

    if (!orderItem) {
      throw new Error(
        "One or more selected items do not belong to this order."
      );
    }

    const quantity =
      Number(
        data[
          `quantity-${orderItemId}`
        ]
      );

    if (
      !Number.isInteger(
        quantity
      ) ||
      quantity <= 0
    ) {
      throw new Error(
        "Return quantity must be a positive whole number."
      );
    }

    if (
      quantity >
      orderItem.quantity
    ) {
      throw new Error(
        "Return quantity cannot exceed the quantity purchased."
      );
    }

    const rawCondition =
      data[
        `condition-${orderItemId}`
      ];

    if (
      typeof rawCondition !==
        "string" ||
      !validConditions.has(
        rawCondition as ReturnCondition
      )
    ) {
      throw new Error(
        "A valid return condition is required for every selected item."
      );
    }

    returnItems.push({
      orderItemId:
        orderItem.id,

      productId:
        orderItem.productId,

      quantity,

      condition:
        rawCondition as ReturnCondition,
    });
  }

  if (
    returnItems.length ===
    0
  ) {
    throw new Error(
      "Please select at least one valid item to return."
    );
  }

  const year =
    new Date()
      .getFullYear();

  /*
   * Create the request and all ReturnItems
   * atomically. If any item fails, no partial
   * ReturnRequest is left behind.
   */
  await prisma.$transaction(
    async (tx) => {
      const lastReturn =
        await tx.returnRequest.findFirst({
          where: {
            returnNumber: {
              startsWith:
                `RET-${year}-`,
            },
          },

          orderBy: {
            createdAt:
              "desc",
          },

          select: {
            returnNumber:
              true,
          },
        });

      let nextNumber =
        1;

      if (lastReturn) {
        const lastSequence =
          Number(
            lastReturn.returnNumber
              .split("-")
              .pop()
          );

        if (
          !Number.isNaN(
            lastSequence
          )
        ) {
          nextNumber =
            lastSequence + 1;
        }
      }

      const returnNumber =
        `RET-${year}-${String(
          nextNumber
        ).padStart(
          6,
          "0"
        )}`;

      const returnRequest =
        await tx.returnRequest.create({
          data: {
            returnNumber,

            orderId:
              order.id,

            branchId:
              session.branchId!,

            requestedByStaffId:
              staff.id,

            type:
              returnType,

            status:
              ReturnStatus.PENDING,

            customerReason,
          },
        });

      await tx.returnItem.createMany({
        data:
          returnItems.map(
            (item) => ({
              returnRequestId:
                returnRequest.id,

              orderItemId:
                item.orderItemId,

              productId:
                item.productId,

              quantity:
                item.quantity,

              condition:
                item.condition,
            })
          ),
      });
    }
  );

  redirect(
    "/admin/returns"
  );
}
