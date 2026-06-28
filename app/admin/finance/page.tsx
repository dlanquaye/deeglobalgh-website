import { prisma } from "@/lib/prisma";
export default async function FinancePage() {
  const dailyClosingCount =
  await prisma.dailyClosing.count();

  const latestClosing =
  await prisma.dailyClosing.findFirst({
    orderBy: {
      businessDate: "desc",
    },
  });
  
  const latestVariance =
  latestClosing?.variance ?? 0;

  const expenseCount =
  await prisma.expense.count();
  const expenses = await prisma.expense.findMany();
  const totalExpenses = expenses.reduce(
  (sum, expense) => sum + Number(expense.amount),
  0
);

  const purchaseCount =
  await prisma.purchase.count();
  const purchases =
  await prisma.purchase.findMany();

const totalPurchases = purchases.reduce(
  (sum, purchase) =>
    sum + Number(purchase.amount),
  0
);

  const bankDepositCount =
  await prisma.bankDeposit.count();
  const bankDeposits =
  await prisma.bankDeposit.findMany();

const totalBankDeposits =
  bankDeposits.reduce(
    (sum, deposit) =>
      sum + Number(deposit.amount),
    0
  );


  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Finance Management
      </h1>

  <p>Total Expenses: GHS {totalExpenses}</p>
  <p>Total Purchases: GHS {totalPurchases}</p>
  <p>Total Bank Deposits: GHS {totalBankDeposits}</p>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
  <div className="border rounded-lg p-4">
    <div className="text-sm text-gray-500">
      Expenses
    </div>
    <div className="text-2xl font-bold">
  GHS {totalExpenses}
</div>

<div className="text-sm text-gray-500">
  {expenseCount} Records
</div>

  </div>

  <div className="border rounded-lg p-4">
    <div className="text-sm text-gray-500">
      Purchases
    </div>
    <div className="text-2xl font-bold">
  GHS {totalPurchases}
</div>

<div className="text-sm text-gray-500">
  {purchaseCount} Records
</div>

  </div>

  <div className="border rounded-lg p-4">
    <div className="text-sm text-gray-500">
      Bank Deposits
    </div>
    <div className="text-2xl font-bold">
  GHS {totalBankDeposits}
</div>

<div className="text-sm text-gray-500">
  {bankDepositCount} Records
</div>

  </div>

  <div className="border rounded-lg p-4">
  <div className="text-sm text-gray-500">
    Cash Variance
  </div>

  <div className="text-2xl font-bold">
    GHS {Number(latestVariance)}
  </div>

  <div className="text-sm text-gray-500">
    Latest Closing
  </div>

  <div className="text-sm">
    {latestClosing
      ? new Date(
          latestClosing.businessDate
        ).toLocaleDateString("en-GB")
      : "N/A"}
  </div>
</div>
</div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <a
          href="/admin/finance/expenses"
          className="border rounded-lg p-4 hover:bg-gray-50"
        >
          <h2 className="font-semibold">Expenses</h2>
          <p className="text-sm text-gray-600">
            Record and manage expenses
          </p>
        </a>

        <a
          href="/admin/finance/purchases"
          className="border rounded-lg p-4 hover:bg-gray-50"
        >
          <h2 className="font-semibold">Purchases</h2>
          <p className="text-sm text-gray-600">
            Record supplier purchases
          </p>
        </a>

        <a
          href="/admin/finance/bank-deposits"
          className="border rounded-lg p-4 hover:bg-gray-50"
        >
          <h2 className="font-semibold">Bank Deposits</h2>
          <p className="text-sm text-gray-600">
            Track deposits to bank
          </p>
        </a>

        <a
          href="/admin/finance/daily-closing"
          className="border rounded-lg p-4 hover:bg-gray-50"
        >
          <h2 className="font-semibold">Daily Closing</h2>
          <p className="text-sm text-gray-600">
            End-of-day reconciliation
          </p>
        </a>
      </div>
    </div>
  );
}