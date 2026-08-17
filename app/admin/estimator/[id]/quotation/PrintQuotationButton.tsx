"use client";

export default function PrintQuotationButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded bg-blue-900 px-5 py-2 font-semibold text-white hover:bg-blue-800"
    >
      Print / Save as PDF
    </button>
  );
}
