import { receivePurchase } from "@/lib/inventory/receivePurchase";

async function main() {
  const result = await receivePurchase({
    productId: "cmoxfzthd001ag3ingc2ppqrv",
    warehouseId: "cmq4b5g1j0001g3jgy501zz76",
    quantity: 5,
    createdByStaffId: "SYSTEM",
  });

  console.log(result);
}

main()
  .catch(console.error)
  .finally(() => process.exit());