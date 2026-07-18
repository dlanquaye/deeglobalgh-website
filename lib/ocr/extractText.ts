import { getVisionClient } from "@/lib/google/visionClient";

export async function extractText(
  filePath: string
): Promise<string> {
  const client = getVisionClient();

  const [result] = await client.textDetection(filePath);

  const text = result.fullTextAnnotation?.text;

  return text ?? "";
}