import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface AdminCookieData {
  adminId?: string;
  role?: string;
  staffId?: string;
  branchId?: string;
  staffName?: string;
}

interface ControlItem {
  title: string;
  description: string;
  href: string;
}

interface ControlSection {
  title: string;
  description: string;
  items: ControlItem[];
}

const controlSections: ControlSection[] = [
  {
    title: "Sales & Customer Operations",
    description:
      "Daily selling, customer orders, quotations, returns and cashier operations.",
    items: [
      {
        title: "Point of Sale",
        description:
          "Open the cashier POS for in-store sales, held sales, Cash, MoMo and Split payments.",
        href: "/admin/pos",
      },
      {
        title: "Orders",
        description:
          "View and manage customer and website orders.",
        href: "/admin/orders",
      },
      {
        title: "Order Control",
        description:
          "Manage operational order status and fulfilment controls.",
        href: "/admin/order-control",
      },
      {
        title: "Returns & Exchanges",
        description:
          "Create and manage customer returns and exchanges.",
        href: "/admin/returns",
      },
      {
        title: "Start Return / Exchange",
        description:
          "Find the original customer order first, then start its return or exchange.",
        href: "/admin/orders",
      },
      {
        title: "Estimator",
        description:
          "Manage school-list estimates, amendments and quotations.",
        href: "/admin/estimator",
      },
      {
        title: "New Estimate",
        description:
          "Create a new school-list estimate for a customer.",
        href: "/admin/estimator/new",
      },
    ],
  },

  {
    title: "Finance & Daily Reconciliation",
    description:
      "Cash control, banking, expenses, purchases and end-of-day reconciliation.",
    items: [
      {
        title: "Finance Centre",
        description:
          "Open the main finance administration area.",
        href: "/admin/finance",
      },
      {
        title: "Bank Deposits",
        description:
          "Record and review business bank deposits.",
        href: "/admin/finance/bank-deposits",
      },
      {
        title: "Daily Closing",
        description:
          "Perform end-of-day sales and payment reconciliation.",
        href: "/admin/finance/daily-closing",
      },
      {
        title: "Expenses",
        description:
          "Record and review operating expenses.",
        href: "/admin/finance/expenses",
      },
      {
        title: "Purchases",
        description:
          "Record business purchase expenditure.",
        href: "/admin/finance/purchases",
      },
      {
        title: "Daily Sales Report",
        description:
          "Review sales and payment-method performance by day.",
        href: "/admin/reports/daily-sales",
      },
    ],
  },

  {
    title: "Inventory & Stock Control",
    description:
      "Receive, transfer, adjust and audit stock across branches and warehouses.",
    items: [
      {
        title: "Inventory Centre",
        description:
          "Open the main inventory control area.",
        href: "/admin/inventory",
      },
      {
        title: "Receive Stock",
        description:
          "Receive purchased stock into inventory.",
        href: "/admin/inventory/receive",
      },
      {
        title: "Inventory Receipts",
        description:
          "Review stock-receipt records.",
        href: "/admin/inventory/receipts",
      },
      {
        title: "Transfer Stock",
        description:
          "Transfer stock between warehouse and branch locations.",
        href: "/admin/inventory/transfer",
      },
      {
        title: "Transfer History",
        description:
          "Review completed and historical inventory transfers.",
        href: "/admin/inventory/transfers",
      },
      {
        title: "Stock Adjustment",
        description:
          "Create controlled inventory adjustments.",
        href: "/admin/inventory/adjustment",
      },
      {
        title: "Adjustment History",
        description:
          "Review historical stock adjustments.",
        href: "/admin/inventory/adjustments",
      },
      {
        title: "Break Bulk",
        description:
          "Convert carton or pack stock into smaller saleable units.",
        href: "/admin/inventory/break-bulk",
      },
      {
        title: "Break Bulk History",
        description:
          "Review previous break-bulk operations.",
        href: "/admin/inventory/break-bulk/history",
      },
      {
        title: "Stock Movements",
        description:
          "Audit PURCHASE, TRANSFER, SALE, RETURN and ADJUSTMENT movements.",
        href: "/admin/inventory/movements",
      },
      {
        title: "Opening Stock & Price",
        description:
          "Analyse and synchronise approved opening stock and pricing data.",
        href: "/admin/inventory/opening-stock-price",
      },
    ],
  },

  {
    title: "Products & Catalogue",
    description:
      "Manage product records, catalogue data, visibility and bulk synchronisation.",
    items: [
      {
        title: "Products",
        description:
          "Search, review and manage catalogue products.",
        href: "/admin/products",
      },
      {
        title: "Add Product",
        description:
          "Create a new product record manually.",
        href: "/admin/products/new",
      },
      {
        title: "Catalogue Synchronisation",
        description:
          "Analyse and synchronise approved catalogue spreadsheets.",
        href: "/admin/bulk-upload",
      },
    ],
  },

  {
    title: "Imports & Shipments",
    description:
      "Track inbound shipments and imported stock records.",
    items: [
      {
        title: "Import Shipments",
        description:
          "View and manage shipment records.",
        href: "/admin/imports/shipments",
      },
      {
        title: "New Shipment",
        description:
          "Create a new import or shipment record.",
        href: "/admin/imports/shipments/new",
      },
    ],
  },

  {
    title: "Administration & System Tools",
    description:
      "Administrative monitoring and operational database tools.",
    items: [
      {
        title: "Database Orders",
        description:
          "Review order records directly from the administration database view.",
        href: "/admin/db-orders",
      },
    ],
  },
];

function readAdminCookie(
  rawValue: string
): AdminCookieData | null {
  try {
    return JSON.parse(
      decodeURIComponent(
        rawValue
      )
    ) as AdminCookieData;
  } catch {
    return null;
  }
}

export default async function AdminPage() {
  const cookieStore =
    await cookies();

  const adminCookie =
    cookieStore.get(
      "dg_admin"
    );

  if (!adminCookie) {
    redirect(
      "/admin/login"
    );
  }

  const admin =
    readAdminCookie(
      adminCookie.value
    );

  const staffName =
    admin?.staffName?.trim() ||
    "Administrator";

  const role =
    admin?.role?.trim() ||
    "ADMIN";

  return (
    <main className="min-h-screen bg-slate-50">

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ==========================================
            HEADER
        ========================================== */}
        <section className="overflow-hidden rounded-2xl bg-slate-950 px-6 py-8 text-white shadow-sm sm:px-8">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">
                DeeglobalGH
              </div>

              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Super Admin Control Board
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
                Central access to the DeeglobalGH
                operational suite. Use this page
                instead of remembering individual
                administration URLs.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-4">

              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Logged in as
              </div>

              <div className="mt-1 font-semibold">
                {staffName}
              </div>

              <div className="mt-1 text-sm text-blue-300">
                {role}
              </div>

            </div>

          </div>

        </section>

        {/* ==========================================
            QUICK ACCESS
        ========================================== */}
        <section className="mt-6">

          <div className="mb-3">
            <h2 className="text-lg font-bold text-slate-900">
              Quick Access
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Most frequently used operational areas.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <Link
              href="/admin/pos"
              className="rounded-xl bg-blue-700 p-5 text-white shadow-sm transition hover:bg-blue-800"
            >
              <div className="text-lg font-bold">
                POS
              </div>

              <div className="mt-1 text-sm text-blue-100">
                Start cashier operations
              </div>
            </Link>

            <Link
              href="/admin/orders"
              className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              <div className="text-lg font-bold text-slate-900">
                Orders
              </div>

              <div className="mt-1 text-sm text-slate-600">
                Customer and website orders
              </div>
            </Link>

            <Link
              href="/admin/returns"
              className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              <div className="text-lg font-bold text-slate-900">
                Returns & Exchanges
              </div>

              <div className="mt-1 text-sm text-slate-600">
                Customer returns and exchanges
              </div>
            </Link>

            <Link
              href="/admin/estimator"
              className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              <div className="text-lg font-bold text-slate-900">
                Estimator
              </div>

              <div className="mt-1 text-sm text-slate-600">
                School lists and quotations
              </div>
            </Link>

            <Link
              href="/admin/inventory"
              className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              <div className="text-lg font-bold text-slate-900">
                Inventory
              </div>

              <div className="mt-1 text-sm text-slate-600">
                Stock and warehouse control
              </div>
            </Link>

            <Link
              href="/admin/finance"
              className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              <div className="text-lg font-bold text-slate-900">
                Finance
              </div>

              <div className="mt-1 text-sm text-slate-600">
                Banking and reconciliation
              </div>
            </Link>

            <Link
              href="/admin/finance/bank-deposits"
              className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              <div className="text-lg font-bold text-slate-900">
                Bank Deposits
              </div>

              <div className="mt-1 text-sm text-slate-600">
                Record and review deposits
              </div>
            </Link>

            <Link
              href="/admin/finance/daily-closing"
              className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              <div className="text-lg font-bold text-slate-900">
                Daily Closing
              </div>

              <div className="mt-1 text-sm text-slate-600">
                End-of-day reconciliation
              </div>
            </Link>

          </div>

        </section>

        {/* ==========================================
            CONTROL BOARD SECTIONS
        ========================================== */}
        <div className="mt-8 space-y-8">

          {controlSections.map(
            (section) => (

              <section
                key={
                  section.title
                }
              >

                <div className="mb-4">

                  <h2 className="text-xl font-bold text-slate-900">
                    {
                      section.title
                    }
                  </h2>

                  <p className="mt-1 text-sm text-slate-600">
                    {
                      section.description
                    }
                  </p>

                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                  {section.items.map(
                    (item) => (

                      <Link
                        key={`${item.title}-${item.href}`}
                        href={
                          item.href
                        }
                        className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                      >

                        <div className="flex items-start justify-between gap-4">

                          <div>

                            <h3 className="font-bold text-slate-900 group-hover:text-blue-800">
                              {
                                item.title
                              }
                            </h3>

                            <p className="mt-2 text-sm leading-5 text-slate-600">
                              {
                                item.description
                              }
                            </p>

                          </div>

                          <div className="text-xl font-bold text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-700">
                            &gt;
                          </div>

                        </div>

                      </Link>

                    )
                  )}

                </div>

              </section>

            )
          )}

        </div>

        {/* ==========================================
            FOOTER NOTE
        ========================================== */}
        <section className="mt-10 rounded-xl border border-blue-100 bg-blue-50 p-5">

          <h2 className="font-bold text-blue-950">
            Control Board
          </h2>

          <p className="mt-1 text-sm leading-6 text-blue-900">
            This dashboard is the central starting
            point for DeeglobalGH administration.
            Additional authorised modules can be
            added here as the suite expands.
          </p>

        </section>

      </div>

    </main>
  );
}