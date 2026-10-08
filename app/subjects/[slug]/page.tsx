import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TrackedLink from "@/app/components/TrackedLink";
import TrackedWhatsAppLink from "@/app/components/TrackedWhatsAppLink";
import PageJumpNav from "@/app/components/PageJumpNav";
import { prisma } from "@/lib/prisma";
import { matchProductSubject } from "@/lib/subject-matching";
import {
  getPublicSubject,
  getStandaloneSubjects,
} from "@/lib/subjects";
import SubjectProductBrowser from "./SubjectProductBrowser";

const SITE_URL = "https://www.shopdeeglobalgh.com";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

type SubjectProduct = {
  id: string;
  name: string;
  slug: string;
  retailPrice: number;
  imageSrc: string;
  stockQty: number;
  categorySlug: string;
  subCategorySlug: string | null;
  levelSlugs: string[];
  tags: string[];
  brand: string | null;
};

function getStandaloneSubject(slug: string) {
  const subject = getPublicSubject(slug);

  if (!subject || !subject.standalonePage) {
    return null;
  }

  return subject;
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const subject = getStandaloneSubject(slug);

  if (!subject) {
    return {
      title: "Subject Not Found | DeeGlobalGH",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonicalUrl = `${SITE_URL}/subjects/${subject.slug}`;

  return {
    title: subject.title,
    description: subject.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: subject.title,
      description: subject.description,
      url: canonicalUrl,
    },
    twitter: {
      card: "summary",
      title: subject.title,
      description: subject.description,
    },
  };
}

export function generateStaticParams() {
  return getStandaloneSubjects().map((subject) => ({
    slug: subject.slug,
  }));
}

export default async function SubjectPage({ params }: Props) {
  const { slug } = await params;
  const subject = getStandaloneSubject(slug);

  if (!subject) {
    notFound();
  }

  let products: SubjectProduct[] = [];

  try {
    const textbookCandidates = await prisma.product.findMany({
      where: {
        categorySlug: "textbooks",
        isActive: true,
        websiteVisible: true,
      },
      orderBy: [
        {
          name: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
      select: {
        id: true,
        name: true,
        slug: true,
        retailPrice: true,
        imageSrc: true,
        stockQty: true,
        categorySlug: true,
        subCategorySlug: true,
        levelSlugs: true,
        tags: true,
        brand: true,
      },
    });
    products = textbookCandidates.filter((product) => {
      const match = matchProductSubject(product);

      if (!match) {
        return false;
      }

      return (
        match.subject.slug === subject.slug ||
        subject.relatedSubjects?.includes(match.subject.slug) === true
      );
    });
  } catch (error) {
    console.error(`Database error (${subject.name} subject page):`, error);
    products = [];
  }

  const itemListId = `subject_${subject.slug.replace(/-/g, "_")}`;

  const whatsappMessage =
    `Hello DeeGlobalGH, I would like to enquire about ${subject.name} textbooks and learning materials. ` +
    "Please assist me with the available books and school levels.";

  const otherSubjects = getStandaloneSubjects().filter(
    (otherSubject) => otherSubject.slug !== subject.slug
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 p-6 text-white shadow-lg">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/80">
            School Subject
          </p>

          <h1 className="text-3xl font-bold">{subject.heading}</h1>

          <p className="mt-3 max-w-3xl text-white/90">{subject.intro}</p>

          <p className="mt-3 max-w-3xl text-sm text-white/80">
            Availability may vary as our online catalogue is updated. If you
            need a particular title, class, level or complete school list, send
            us your requirements and we will help you check the available
            selection.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <TrackedLink
              href="/category/textbooks"
              linkLocation="subject_page_hero"
              contentType="textbook_collection"
              contentName={subject.name}
              className="rounded-xl bg-white px-5 py-2 font-semibold text-blue-900"
            >
              Browse All Textbooks
            </TrackedLink>

            <TrackedLink
              href="/subjects"
              linkLocation="subject_page_hero"
              contentType="textbook_subject_hub"
              contentName={subject.name}
              className="rounded-xl border border-white/60 px-5 py-2 font-semibold text-white"
            >
              Browse All Subjects
            </TrackedLink>

            <TrackedWhatsAppLink
              href={`https://wa.me/233270030000?text=${encodeURIComponent(
                whatsappMessage
              )}`}
              linkLocation="subject_page_hero"
              productName={subject.name}
              className="rounded-xl bg-yellow-400 px-5 py-2 font-semibold text-black"
            >
              Ask on WhatsApp
            </TrackedWhatsAppLink>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">
              {subject.name} Textbooks and Learning Materials
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              {products.length} product{products.length === 1 ? "" : "s"}{" "}
              currently represented in this subject.
            </p>
          </div>

          <TrackedLink
            href="/shop"
            linkLocation="subject_product_collection"
            contentType="shop"
            contentName={subject.name}
            className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-gray-50"
          >
            Shop All Products
          </TrackedLink>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border bg-white p-6">
            <p className="font-semibold">
              No {subject.name} products are currently displayed online.
            </p>

            <p className="mt-2 text-sm text-gray-600">
              Please contact DeeGlobalGH if you need a particular title, class
              or school list you would like us to check.
            </p>
          </div>
        ) : (
          <SubjectProductBrowser
            products={products}
            subjectName={subject.name}
            itemListId={itemListId}
          />
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="rounded-2xl border bg-white p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">
                Browse Other School Subjects
              </h2>

              <p className="mt-2 max-w-3xl text-sm text-gray-600">
                Explore textbooks and learning materials from other subject
                areas represented in the DeeGlobalGH catalogue.
              </p>
            </div>

            <TrackedLink
              href="/subjects"
              linkLocation="subject_cross_navigation"
              contentType="textbook_subject_hub"
              contentName={subject.name}
              className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-gray-50"
            >
              View All Subjects
            </TrackedLink>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {otherSubjects.map((otherSubject) => (
              <TrackedLink
                key={otherSubject.slug}
                href={`/subjects/${otherSubject.slug}`}
                linkLocation="subject_cross_navigation"
                contentType="textbook_subject"
                contentName={otherSubject.name}
                className="rounded-xl border bg-gray-50 px-4 py-3 font-semibold text-[color:var(--brand-blue)] transition hover:bg-gray-100"
              >
                {otherSubject.name}
              </TrackedLink>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-bold">
            Need Help Finding a {subject.name} Book?
          </h2>

          <p className="mt-2 max-w-3xl text-gray-600">
            Send DeeGlobalGH the book title, class or level, or your complete
            school list. We can help you check the relevant textbooks and other
            school supplies available from our Kasoa shop.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <TrackedLink
              href="/school-list-items-kasoa"
              linkLocation="subject_page_footer"
              contentType="school_list"
              contentName={subject.name}
              className="rounded-xl bg-blue-900 px-5 py-3 font-semibold text-white hover:bg-blue-800"
            >
              School List Shopping
            </TrackedLink>

            <TrackedWhatsAppLink
              href={`https://wa.me/233270030000?text=${encodeURIComponent(
                whatsappMessage
              )}`}
              linkLocation="subject_page_footer"
              productName={subject.name}
              className="inline-flex rounded-xl bg-yellow-400 px-5 py-3 font-semibold text-black hover:bg-yellow-300"
            >
              Send Your Enquiry
            </TrackedWhatsAppLink>
          </div>
        </div>
      </section>

      <PageJumpNav />
    </main>
  );
}