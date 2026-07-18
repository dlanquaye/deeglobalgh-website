import { prisma } from "@/lib/prisma";
import { EstimateSource } from "@prisma/client";
import { generateEstimateNumber } from "@/lib/estimator";

export async function createEstimateRequest(
  customerName: string,
  phone: string,
  source: EstimateSource,
  schoolName?: string,
  className?: string,
  academicYear?: string,
  notes?: string
) {
  const estimate = await prisma.estimateRequest.create({
    data: {
      estimateNumber: await generateEstimateNumber(),

      customerName,
      phone,

      schoolName,
      className,
      academicYear,
      notes,

      source: source ?? "WEBSITE",
    },
  });

  return estimate;
}