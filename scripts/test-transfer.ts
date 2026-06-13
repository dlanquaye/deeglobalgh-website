import { transferInventory } from "../lib/inventory/transfer";
import { LocationType } from "@prisma/client";

async function main() {
  const result = await transferInventory({
    productId: "cmoxfzthd001ag3ingc2ppqrv",

    fromLocationId: "cmq4b5g1j0001g3jgy501zz76",
    fromLocationType: LocationType.WAREHOUSE,

    toLocationId: "cmq4b407s0000g3jg31elgm80",
    toLocationType: LocationType.BRANCH,

    quantity: 1,

    createdByStaffId: "DG001",
  });

  console.log(result);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });