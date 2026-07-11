import { prisma } from "@/lib/prisma";
import { EstimateSource } from "@prisma/client";
import { generateEstimateNumber } from "@/lib/estimator";

export async function createEstimateRequest(
  customerName: string,
  phone: string,
  source: EstimateSource
)

{
  const estimate = await prisma.estimateRequest.create({
  data: {
    estimateNumber: await generateEstimateNumber(),
    customerName,
    phone,
    source: source ?? "WEBSITE",
  },
});

return estimate;
}