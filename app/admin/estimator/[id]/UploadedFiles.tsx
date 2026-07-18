"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Attachment {
  id: string;
  estimateRequestId: string;

  fileName: string;
  filePath: string;
  fileType: string;

  fileSize: number | null;

  ocrText: string | null;

  ocrStatus: string;

  booksFound: number | null;

  matchedBooks: number | null;

  createdAt: Date;
  updatedAt: Date;
}

interface Props {
  attachments: Attachment[];
}

export default function UploadedFiles({
  attachments,
}: Props) {

    const router = useRouter();

const [processingId, setProcessingId] =
  useState<string | null>(null);

async function processSchoolList(
  attachmentId: string
) {
  try {
    setProcessingId(attachmentId);

    const res = await fetch(
      "/api/estimator/process-school-list",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attachmentId,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    router.refresh();

  } catch {
    alert("Unable to process school list.");
  } finally {
    setProcessingId(null);
  }
}

  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 rounded-xl border bg-white p-6">

      <h2 className="mb-4 text-xl font-bold">
        Uploaded School Lists
      </h2>

      <div className="space-y-4">

        {attachments.map((attachment) => (

          <div
            key={attachment.id}
            className="flex items-center justify-between rounded-lg border p-4"
          >

            <div>

              <div className="font-semibold">
                {attachment.fileName}
              </div>

              <div className="mt-1 text-sm text-gray-500">
                {attachment.fileType}
              </div>

              <div className="text-sm text-gray-500">
                Uploaded:{" "}
                {new Date(
                  attachment.createdAt
                ).toLocaleString()}
              </div>

              <div className="text-sm mt-2">
  OCR Status:{" "}
  <span
    className={
      attachment.ocrStatus === "COMPLETED"
        ? "font-semibold text-green-600"
        : attachment.ocrStatus === "PROCESSING"
        ? "font-semibold text-blue-600"
        : attachment.ocrStatus === "FAILED"
        ? "font-semibold text-red-600"
        : "font-semibold text-yellow-600"
    }
  >
    {attachment.ocrStatus}
  </span>
</div>

<div className="text-sm text-gray-500">
  Books Found: {attachment.booksFound ?? "-"}
</div>

<div className="text-sm text-gray-500">
  Matched Books: {attachment.matchedBooks ?? "-"}
</div>

              {attachment.fileSize && (
                <div className="text-sm text-gray-500">
                  {(attachment.fileSize / 1024).toFixed(1)} KB
                </div>
              )}

            </div>

            <div className="flex gap-2">

              <button
  type="button"
  onClick={() =>
    processSchoolList(attachment.id)
  }
  disabled={
    processingId === attachment.id
  }
  className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
>
  {processingId === attachment.id
    ? "Processing..."
    : "Process School List"}
</button>

              <button
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Delete
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}