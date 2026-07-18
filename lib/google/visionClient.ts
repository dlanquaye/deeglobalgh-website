import { ImageAnnotatorClient } from "@google-cloud/vision";

let visionClient: ImageAnnotatorClient | null = null;

export function getVisionClient(): ImageAnnotatorClient {
  if (visionClient) {
    return visionClient;
  }

  const keyFilename = process.env.GOOGLE_VISION_CREDENTIALS_PATH;

  if (!keyFilename) {
    throw new Error(
      "GOOGLE_VISION_CREDENTIALS_PATH is not defined in .env.local."
    );
  }

  visionClient = new ImageAnnotatorClient({
    keyFilename,
  });

  return visionClient;
}