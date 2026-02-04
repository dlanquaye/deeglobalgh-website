"use client";

import { useState } from "react";
import Image from "next/image";

/* =========================
   Types
========================= */
type Service = {
  id: string;
  slug: string;
  title: string;
  titleZh: string;
  summary: string;
  who: string;
  includes: string[];
  allowWechat: boolean;
  allowWhatsapp: boolean;
};

/* =========================
   Constants
========================= */
const WHATSAPP_NUMBER = "233246011773"; // Ghana
const TIKTOK_URL = "https://www.tiktok.com/@ChineseWithDeeAndKids";

/* =========================
   Services Data
========================= */
// Each service has a stable SEO slug for future individual service pages
const services: Service[] = [
  {
    id: "interpretation",
    slug: "chinese-english-interpretation-translation-ghana",
    title: "Chinese–English Interpretation/Translation & Business Liaison",
    titleZh: "中英口译/翻译与商务协调服务",
    summary:
      "This service provides professional Chinese–English interpretation and translation, combined with business liaison support.",
    who:
      "This service is for businesses, individuals, traders, schools, and organisations working with Chinese partners or clients.",
    includes: [
      "Consecutive and on-site interpretation",
      "Document translation (Chinese ↔ English)",
      "Business meeting and negotiation support",
      "Communication coordination between parties",
    ],
    allowWechat: true,
    allowWhatsapp: true,
  },
  {
    id: "chinese-training",
    slug: "chinese-language-training-kids-adults-ghana",
    title: "Chinese Language Training (Kids & Adults)",
    titleZh: "中文培训（少儿与成人）",
    summary:
      "This service offers structured Chinese language training for children and adults.",
    who:
      "This service is for beginners, students, parents, and adults who want to learn Chinese for school, work, or personal development.",
    includes: [
      "Age-appropriate lessons for children",
      "Beginner and intermediate adult classes",
      "Speaking and listening practice",
      "Guided learning with clear progress goals",
    ],
    allowWechat: false,
    allowWhatsapp: true,
  },
  {
    id: "business-chinese",
    slug: "business-chinese-language-training-ghana",
    title: "Business Chinese Language Training",
    titleZh: "商务中文培训",
    summary:
      "This service focuses on practical Chinese used in business environments.",
    who:
      "This service is for professionals, business owners, managers, and staff working with Chinese partners or markets.",
    includes: [
      "Business-focused vocabulary and expressions",
      "Meeting and negotiation language practice",
      "Cultural communication guidance",
      "Industry-relevant examples",
    ],
    allowWechat: false,
    allowWhatsapp: true,
  },
  {
    id: "english-training",
    slug: "english-training-for-chinese-speakers-ghana",
    title: "English Language Training for Chinese Speakers",
    titleZh: "英语培训（中文使用者）",
    summary:
      "This service helps Chinese speakers learn English clearly and confidently.",
    who:
      "This service is for Chinese speakers living, studying, or working in English-speaking environments.",
    includes: [
      "Speaking and listening improvement",
      "Everyday and workplace English",
      "Clear explanations with language support",
      "Step-by-step learning progression",
    ],
    allowWechat: true,
    allowWhatsapp: true,
  },
];

/* =========================
   Analytics Tracking
========================= */
function trackClick(
  channel: "whatsapp" | "tiktok",
  serviceTitle: string,
  serviceSlug: string
) {
  if (typeof window === "undefined") return;

  // GA4 tracking (if available)
  if ((window as any).gtag) {
    (window as any).gtag("event", "select_service_contact", {
      service_name: serviceTitle,
      service_slug: serviceSlug,
      contact_channel: channel,
    });
  }
}

/* =========================
   Page Component
========================= */
export default function ServicesPage() {
  const [activeService, setActiveService] = useState<Service>(services[0]);

  const whatsappMessage = encodeURIComponent(
    `Hello, I would like to enquire about your service: ${activeService.title}.`
  );

  const whatsAppUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      {/* Page Header */}
      <div className="mb-12 text-center">
        <h1 className="mb-3 text-3xl font-semibold">Our Services</h1>
        <p className="text-gray-600">
          Select a service to view detailed information below.
        </p>
      </div>

      {/* Service Selector */}
      <div className="mb-20 space-y-5">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => setActiveService(service)}
            className={`w-full rounded-2xl border p-6 transition ${
              activeService.id === service.id
                ? "border-black bg-gray-50"
                : "border-gray-200 hover:border-gray-400"
            }`}
          >
            <h3 className="text-center font-medium">{service.title}</h3>
            <p className="mt-1 text-center text-sm text-gray-500">
              {service.titleZh}
            </p>
          </button>
        ))}
      </div>

      {/* Service Details */}
      <div className="mx-auto max-w-3xl">
        <div className="space-y-12 rounded-2xl border bg-white px-10 py-12">
          {/* Title */}
          <div className="space-y-3 text-center">
            <h2 className="text-2xl font-bold">
              {activeService.title} in Ghana
            </h2>
            <p className="text-sm text-gray-500">{activeService.titleZh}</p>
          </div>

          {/* Summary */}
          <p className="text-center leading-relaxed">
            {activeService.summary}
          </p>

          <p className="mt-4 text-center text-sm text-gray-500">
            This service is offered in Ghana and supports individuals, families,
            and organisations seeking reliable Chinese–English communication,
            language training, and cross-cultural support.
          </p>

          {/* Who */}
          <div className="space-y-4 text-center">
            <h3 className="text-lg font-bold">
              Who this service is designed for
            </h3>
            <p>{activeService.who}</p>
          </div>

          {/* Includes */}
          <div className="space-y-4 text-center">
            <h3 className="text-lg font-bold">
              What this service includes
            </h3>
            <p className="mx-auto max-w-2xl">
              {activeService.includes.join(", ")}.
            </p>
          </div>

          {/* Contact Section */}
          <div className="border-t pt-10">
            <div className="flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-10">

              {/* WeChat */}
              {activeService.allowWechat && (
                <div className="text-center">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Chat on WeChat
                  </p>
                  <Image
                    src="/wechat-qr.png"
                    alt="Scan to add on WeChat"
                    width={96}
                    height={96}
                  />
                  <p className="mt-2 text-sm font-medium">
                    WeChat ID: <strong>dlanquaye</strong>
                  </p>
                </div>
              )}

              {/* Separator */}
              {activeService.allowWechat && activeService.allowWhatsapp && (
                <div className="hidden h-20 w-px bg-gray-200 sm:block" />
              )}

              {/* WhatsApp */}
              {activeService.allowWhatsapp && (
                <div className="text-center">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Chat on WhatsApp
                  </p>
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() =>
                      trackClick(
                        "whatsapp",
                        activeService.title,
                        activeService.slug
                      )
                    }
                    className="inline-flex h-12 items-center justify-center gap-3 rounded-xl bg-green-600 px-6 text-sm font-bold text-white hover:opacity-90"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 32 32"
                      fill="currentColor"
                      className="h-6 w-6"
                    >
                      <path d="M16 2C8.268 2 2 8.268 2 16c0 2.82.736 5.467 2.023 7.773L2 30l6.406-1.97A13.94 13.94 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2z" />
                    </svg>
                    WhatsApp
                  </a>
                  <p className="mt-2 text-xs font-medium text-gray-600">
                    Chat Us On WhatsApp
                  </p>
                </div>
              )}

              {/* Separator */}
              <div className="hidden h-20 w-px bg-gray-200 sm:block" />

              {/* TikTok */}
              <div className="text-center">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Follow on TikTok
                </p>
                <a
                  href={TIKTOK_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() =>
                    trackClick(
                      "tiktok",
                      activeService.title,
                      activeService.slug
                    )
                  }
                  className="inline-flex h-12 items-center justify-center gap-3 rounded-xl bg-black px-6 text-sm font-bold text-white hover:opacity-90"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-6 w-6"
                  >
                    <path d="M21 8.5a6.5 6.5 0 0 1-5-2.2V15a6 6 0 1 1-6-6c.3 0 .7 0 1 .1v3.2a2.8 2.8 0 1 0 2 2.7V2h3a6.5 6.5 0 0 0 5 4.2z" />
                  </svg>
                  TikTok
                </a>
                <p className="mt-2 text-sm font-medium">
                  @ChineseWithDeeAndKids
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
