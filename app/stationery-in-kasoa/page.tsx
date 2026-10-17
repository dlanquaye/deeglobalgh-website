/* ================= SEO METADATA ================= */
export const metadata = {
  title:
    "Stationery & School Supplies in Kasoa | DeeGlobalGH",
  description:
    "Buy stationery and school supplies in Kasoa including pens, pencils, maths sets, calculators, exercise books, art supplies, teacher supplies, files, markers and more from DeeGlobalGH.",
  alternates: {
    canonical: "https://www.shopdeeglobalgh.com/stationery-in-kasoa",
  },
};

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ProductCard from "@/app/components/ProductCard";
import TrackedWhatsAppLink from "@/app/components/TrackedWhatsAppLink";
import PageJumpNav from "@/app/components/PageJumpNav";

export const dynamic = "force-dynamic";

const stationeryBrands = [
  "Nataraj",
  "BIC",
  "Deli",
  "DOMS",
  "Camlin",
  "Casio",
  "Camel",
  "Monami",
  "Obama",
  "Lucky",
  "Simba",
  "Jinxing",
  "Cox",
  "Super Marshal",
  "Marshal",
];

const popularStationeryGroups = [
  {
    title: "Pens, Pencils & Writing Materials",
    description:
      "School pens, pencils, graded pencils, correction pens and other everyday writing materials. Brands in our changing range include BIC, Nataraj, Deli, DOMS, Obama, Lucky and Simba.",
  },
  {
    title: "Erasers & Sharpeners",
    description:
      "Erasers and sharpeners for school and everyday writing, including options from Nataraj and DOMS, subject to current availability.",
  },
  {
    title: "Mathematical Sets & Geometry Tools",
    description:
      "Maths sets and geometry tools for Basic, JHS and SHS students. Our range may include Camlin, Nataraj, Cox, Super Marshal and Marshal.",
  },
  {
    title: "Calculators",
    description:
      "Deli and Casio calculators for students and everyday school use. Available models may change, so customers can enquire before visiting.",
  },
  {
    title: "Exercise Books & Writing Books",
    description:
      "Note 1 exercise books in 40 leaves and 60 leaves, various sizes of Note 3 books, foolscap books, writing books, red and blue line books and related school notebooks.",
  },
  {
    title: "Markers & Classroom Writing Supplies",
    description:
      "Whiteboard markers and related classroom writing supplies, including Deli and Monami options. Customers also regularly ask us for board markers and dusters.",
  },
  {
    title: "Files, Clear Bags & File Pouches",
    description:
      "Flat files, clear bags, file pouches and other document-storage items for students, teachers and offices.",
  },
  {
    title: "Art & Visual Arts Supplies",
    description:
      "Crayons, colour pencils, poster colours, paint brushes, sketch books, sketch pads, canvas, graded pencils, calligraphy pens, electric erasers, art charcoal powder, acrylic paints, manilla cards and other visual arts tools.",
  },
];

const teacherAndOfficeSupplies = [
  "Attendance registers",
  "SBA materials",
  "Attendance books",
  "Cash books",
  "Facilitator lesson planners",
  "A4 paper",
  "A3 paper",
  "Staplers",
  "Staple pins",
  "Cello tape",
  "Masking tape",
  "Neon tape",
];

const popularSearchItems = [
  "A1 books",
  "Writing books",
  "Red and blue line books",
  "Board markers",
  "Dusters",
  "Official paper",
  "Mathematical sets",
  "Scientific calculators",
  "Exercise books",
  "A4 paper",
];

const nearbyAreas = [
  "Kasoa",
  "Nyanyano",
  "Opeikuma",
  "Opeikuma Mawuli",
  "Ofankor",
  "Buduburam",
  "Millennium City",
  "Amanfrom",
  "Awutu Breku",
  "SCC",
  "Bortianor",
  "Ayigbe Town",
];

export default async function StationeryKasoaPage({
  searchParams,
}: {
  searchParams: {
    search?: string;
    level?: string;
    category?: string;
  };
}) {
  /* -------------------------------------------
     PARAMS
  ------------------------------------------- */
  const rawSearch = searchParams?.search || "";
  const rawLevel = searchParams?.level || "";
  const rawCategory = searchParams?.category;

  /* -------------------------------------------
     NORMALIZE
  ------------------------------------------- */
  const search = rawSearch.toLowerCase().trim();
  const level = rawLevel.toLowerCase().trim();
  const category = rawCategory?.toLowerCase().trim();

  const keywords = search.split(" ").filter(Boolean);

  /* -------------------------------------------
     QUERY BUILD
  ------------------------------------------- */
  const where: any = {
    isActive: true,
    websiteVisible: true,
    AND: [],
  };

  /* CATEGORY (default = stationery discovery) */
  where.AND.push(
    category
      ? { categorySlug: category }
      : {
          OR: [
            { categorySlug: "stationery" },
            {
              categorySlug: "school-essentials",
              subCategorySlug: {
                in: [
                  "a4-paper",
                  "crayons",
                  "exercise-books",
                  "pencils",
                  "pens",
                  "rulers",
                ],
              },
            },
          ],
        }
  );

  /* SEARCH */
  if (keywords.length > 0) {
    where.AND.push(
      ...keywords.map((word) => ({
        OR: [
          { name: { contains: word } },
          { brand: { contains: word } },
          { tags: { has: word } },
        ],
      }))
    );
  }

  /* LEVEL */
  if (level) {
    where.AND.push({
      levelSlugs: {
        has: level,
      },
    });
  }

  /* -------------------------------------------
     FETCH
  ------------------------------------------- */
  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  /* -------------------------------------------
     UI
  ------------------------------------------- */
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* ================= SEO HEADER ================= */}
      <h1 className="text-3xl font-bold text-blue-900 mb-4">
        Stationery &amp; School Supplies in Kasoa
      </h1>

      <p className="text-gray-600 max-w-3xl mb-4">
        Looking for stationery or school supplies in Kasoa? DeeGlobalGH serves
        parents, students, teachers, schools, offices and selected bulk buyers
        from our shop at Kasoa New Market.
      </p>

      <p className="text-gray-600 max-w-3xl mb-6">
        Our changing range includes pens, pencils, exercise books, mathematical
        sets, calculators, markers, art materials, teacher supplies, files,
        paper and other practical school and office items. Availability varies
        by product, brand and model.
      </p>

      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          href="/textbooks-in-kasoa"
          className="border px-4 py-2 rounded-xl hover:bg-gray-100"
        >
          Shop Textbooks in Kasoa
        </Link>

        <Link
          href="/exam-materials-in-kasoa"
          className="border px-4 py-2 rounded-xl hover:bg-gray-100"
        >
          Exam Materials &amp; Past Questions
        </Link>

        <Link
          href="/school-list-items-kasoa"
          className="border px-4 py-2 rounded-xl hover:bg-gray-100"
        >
          School List Shopping
        </Link>

        <Link
          href="/locations/kasoa-new-market"
          className="border px-4 py-2 rounded-xl hover:bg-gray-100"
        >
          Visit Our Kasoa New Market Shop
        </Link>
      </div>

      {/* CTA */}
      <div className="flex gap-3 mb-10 flex-wrap">
        <Link
          href="/shop?category=stationery"
          className="bg-blue-900 text-white px-6 py-3 rounded-xl font-bold"
        >
          Shop Available Stationery
        </Link>

        <TrackedWhatsAppLink
          href="https://wa.me/233270030000?text=Hello%20DeeGlobalGH%2C%20I%20would%20like%20to%20enquire%20about%20stationery%20and%20school%20supplies.%20Please%20assist%20me."
          linkLocation="stationery_in_kasoa"
          className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold"
        >
          Ask About Stationery on WhatsApp
        </TrackedWhatsAppLink>
      </div>

      {/* ================= DISCOVERY ================= */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-blue-900 mb-3">
          Popular Stationery &amp; School Supplies
        </h2>

        <p className="text-gray-600 max-w-3xl mb-6">
          Customers shop with us for everyday classroom supplies, school-list
          items and specialist stationery. The examples below represent part
          of our wider range and do not mean every item is available at all
          times.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {popularStationeryGroups.map((group) => (
            <div key={group.title} className="border rounded-xl p-5">
              <h3 className="font-bold text-lg mb-2">{group.title}</h3>
              <p className="text-gray-600 text-sm leading-6">
                {group.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= BRANDS ================= */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-blue-900 mb-3">
          Stationery Brands Available in Our Range
        </h2>

        <p className="text-gray-600 max-w-3xl mb-5">
          Depending on current stock, customers may find stationery from
          recognised brands and product ranges such as:
        </p>

        <div className="flex flex-wrap gap-2">
          {stationeryBrands.map((brand) => (
            <span
              key={brand}
              className="border rounded-full px-4 py-2 text-sm bg-gray-50"
            >
              {brand}
            </span>
          ))}
        </div>
      </section>

      {/* ================= CUSTOMER LANGUAGE ================= */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-blue-900 mb-3">
          Common School Supplies Customers Ask for
        </h2>

        <p className="text-gray-600 max-w-3xl mb-5">
          Not everyone searches using a brand or formal product name. Customers
          also ask for familiar school items such as:
        </p>

        <div className="flex flex-wrap gap-2">
          {popularSearchItems.map((item) => (
            <span
              key={item}
              className="border rounded-full px-4 py-2 text-sm"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* ================= ART SUPPLIES ================= */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-blue-900 mb-3">
          Art &amp; Visual Arts Supplies in Kasoa
        </h2>

        <p className="text-gray-600 max-w-3xl mb-4">
          Our art-supply range may include Camel crayons, Nataraj crayons,
          Nataraj colour pencils, poster colours, paint brushes, sketch books,
          sketch pads, canvas, graded pencils, calligraphy pens, electric
          erasers, art charcoal powder, acrylic paints, manilla cards and other
          visual arts tools.
        </p>

        <p className="text-gray-600 max-w-3xl">
          Art materials change frequently, so customers looking for a
          particular colour, size or type can contact us before visiting.
        </p>
      </section>

      {/* ================= TEACHERS / OFFICE ================= */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-blue-900 mb-3">
          Teacher, School &amp; Office Supplies
        </h2>

        <p className="text-gray-600 max-w-3xl mb-5">
          DeeGlobalGH also supplies practical materials used by teachers,
          facilitators, schools and offices.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-4xl">
          {teacherAndOfficeSupplies.map((item) => (
            <div key={item} className="border rounded-lg px-4 py-3 text-sm">
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* ================= WHOLESALE ================= */}
      <section className="mb-12 border rounded-xl p-6 bg-gray-50">
        <h2 className="text-xl font-bold text-blue-900 mb-3">
          Bulk &amp; Wholesale Stationery Enquiries
        </h2>

        <p className="text-gray-600 max-w-3xl mb-4">
          Selected stationery and school-supply items may be available in
          quantity for schools, teachers, offices, resellers and other bulk
          buyers. Wholesale or bulk availability depends on the particular
          product and current stock.
        </p>

        <TrackedWhatsAppLink
          href="https://wa.me/233270030000?text=Hello%20DeeGlobalGH%2C%20I%20would%20like%20to%20enquire%20about%20bulk%20or%20wholesale%20stationery.%20Please%20assist%20me."
          linkLocation="stationery_bulk_enquiry"
          className="inline-block bg-yellow-500 text-black px-5 py-3 rounded-xl font-bold"
        >
          Ask About Bulk Stationery
        </TrackedWhatsAppLink>
      </section>

      {/* ================= SEARCH ================= */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">
          Search Available Stationery
        </h2>

        <form method="GET" className="mb-6 flex gap-3">
          <input
            type="text"
            name="search"
            defaultValue={rawSearch}
            placeholder="Search pens, pencils, calculators, markers..."
            className="flex-1 border rounded-xl px-4 py-3"
          />
          <button className="bg-blue-900 text-white px-6 py-3 rounded-xl font-bold">
            Search
          </button>
        </form>

        {/* ================= LEVEL FILTER ================= */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            "pre-school",
            "basic-1",
            "basic-2",
            "basic-3",
            "basic-4",
            "basic-5",
            "basic-6",
            "jhs",
            "shs",
          ].map((lvl) => {
            const params = new URLSearchParams();

            if (rawSearch) params.set("search", rawSearch);
            if (category) params.set("category", category);

            params.set("level", lvl);

            return (
              <Link
                key={lvl}
                href={`/stationery-in-kasoa?${params.toString()}`}
                className="border px-3 py-1 rounded-full text-sm hover:bg-gray-100"
              >
                {lvl.toUpperCase()}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ================= PRODUCTS ================= */}
      <h2 className="text-xl font-bold mb-6">
        Available Stationery With Product Images
      </h2>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg font-semibold text-gray-700">
            No matching stationery found.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            The item may still be available in our wider shop range. Try
            another keyword or ask us on WhatsApp.
          </p>

          <Link
            href="/shop?category=stationery"
            className="inline-block mt-4 bg-blue-900 text-white px-6 py-3 rounded-xl font-bold"
          >
            View Available Stationery
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((p: any) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {/* ================= LOCAL SEO ================= */}
      <section className="mt-12 max-w-4xl">
        <h2 className="text-2xl font-bold text-blue-900 mb-3">
          Buy Stationery Near Kasoa New Market
        </h2>

        <p className="text-gray-600 mb-4">
          DeeGlobalGH is located inside Kasoa New Market. Customers can shop
          for school stationery, classroom supplies, art materials and
          selected office supplies, then choose collection or available
          delivery options.
        </p>

        <p className="text-gray-600 mb-5">
          We also serve customers from Kasoa and surrounding areas including{" "}
          {nearbyAreas.slice(1).join(", ")}. Delivery availability depends on
          destination, order size and current arrangements.
        </p>

        <Link
          href="/locations/kasoa-new-market"
          className="inline-block border px-5 py-3 rounded-xl font-semibold hover:bg-gray-100"
        >
          Kasoa New Market Location &amp; Directions
        </Link>
      </section>

      <PageJumpNav />
    </div>
  );
}