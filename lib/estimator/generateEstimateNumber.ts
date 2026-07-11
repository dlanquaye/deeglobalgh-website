import { getNextDocumentNumber } from "@/lib/document-sequence/getNextDocumentNumber";

export async function generateEstimateNumber(): Promise<string> {
  return await getNextDocumentNumber("EST");
}