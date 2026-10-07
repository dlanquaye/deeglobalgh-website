"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import TrackedProductLink from "@/app/components/TrackedProductLink";

export type SubjectBrowserProduct = {
  id: string;
  name: string;
  slug: string;
  retailPrice: number;
  imageSrc: string;
  stockQty: number;
  levelSlugs: string[];
  brand: string | null;
};

type Props = {
  products: SubjectBrowserProduct[];
  subjectName: string;
  itemListId: string;
};

type LevelOption = {
  slug: string;
  label: string;
};

type SeriesOption = {
  brand: string;
  label: string;
};

const LEVEL_OPTIONS: LevelOption[] = [
  { slug: "creche", label: "Creche" },
  { slug: "nursery-1", label: "Nursery 1" },
  { slug: "nursery-2", label: "Nursery 2" },
  { slug: "kg-1", label: "KG 1" },
  { slug: "kg-2", label: "KG 2" },
  { slug: "pre-school", label: "Pre-School – Combined" },
  { slug: "basic-1", label: "Basic 1" },
  { slug: "basic-2", label: "Basic 2" },
  { slug: "basic-3", label: "Basic 3" },
  { slug: "basic-4", label: "Basic 4" },
  { slug: "basic-5", label: "Basic 5" },
  { slug: "basic-6", label: "Basic 6" },
  { slug: "jhs", label: "JHS – Combined" },
  { slug: "jhs-1", label: "JHS 1" },
  { slug: "jhs-2", label: "JHS 2" },
  { slug: "jhs-3", label: "JHS 3" },
  { slug: "shs", label: "SHS – Combined" },
  { slug: "shs-1", label: "SHS 1" },
  { slug: "shs-2", label: "SHS 2" },
  { slug: "shs-3", label: "SHS 3" },
];

const SERIES_OPTIONS: SeriesOption[] = [
  { brand: "Best Brain", label: "Best Brain Series" },
  { brand: "Golden", label: "Golden Series" },
  { brand: "Excellence", label: "Excellence Series" },
  { brand: "Wise Ant", label: "Wise Ant Series" },
  { brand: "Don", label: "Don Series" },
  { brand: "Essential", label: "Essential Series" },
];

export default function SubjectProductBrowser({
  products,
  subjectName,
  itemListId,
}: Props) {
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedSeries, setSelectedSeries] = useState("all");

  const availableLevels = useMemo(
    () =>
      LEVEL_OPTIONS.filter((option) =>
        products.some((product) => product.levelSlugs.includes(option.slug))
      ),
    [products]
  );

  const availableSeries = useMemo(
    () =>
      SERIES_OPTIONS.filter((option) =>
        products.some((product) => product.brand === option.brand)
      ),
    [products]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesLevel =
        selectedLevel === "all" ||
        product.levelSlugs.includes(selectedLevel);

      const matchesSeries =
        selectedSeries === "all" ||
        product.brand === selectedSeries;

      return matchesLevel && matchesSeries;
    });
  }, [products, selectedLevel, selectedSeries]);

  const selectedLevelLabel =
    LEVEL_OPTIONS.find((option) => option.slug === selectedLevel)?.label ??
    subjectName;

  const selectedSeriesLabel =
    SERIES_OPTIONS.find((option) => option.brand === selectedSeries)?.label ??
    subjectName;

  const resetFilters = () => {
    setSelectedLevel("all");
    setSelectedSeries("all");
  };

  return (
    <>
      <div className="mb-6 rounded-2xl border bg-white p-5">
        <div>
          <h2 className="text-xl font-bold">
            Find {subjectName} Books Faster
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            Narrow the books by class, series, or combine both filters to find
            what you need faster.
          </p>
        </div>

        {availableLevels.length > 0 && (
          <div className="mt-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">
              By Class
            </h3>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedLevel("all")}
                aria-pressed={selectedLevel === "all"}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                  selectedLevel === "all"
                    ? "border-blue-900 bg-blue-900 text-white"
                    : "bg-white text-blue-900 hover:bg-gray-50"
                }`}
              >
                All Classes
              </button>

              {availableLevels.map((option) => {
                const count = products.filter((product) =>
                  product.levelSlugs.includes(option.slug)
                ).length;

                const selected = selectedLevel === option.slug;

                return (
                  <button
                    key={option.slug}
                    type="button"
                    onClick={() => setSelectedLevel(option.slug)}
                    aria-pressed={selected}
                    className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                      selected
                        ? "border-blue-900 bg-blue-900 text-white"
                        : "bg-white text-blue-900 hover:bg-gray-50"
                    }`}
                  >
                    {option.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {availableSeries.length > 0 && (
          <div className="mt-5 border-t pt-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">
              By Series
            </h3>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedSeries("all")}
                aria-pressed={selectedSeries === "all"}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                  selectedSeries === "all"
                    ? "border-blue-900 bg-blue-900 text-white"
                    : "bg-white text-blue-900 hover:bg-gray-50"
                }`}
              >
                All Series
              </button>

              {availableSeries.map((option) => {
                const count = products.filter(
                  (product) => product.brand === option.brand
                ).length;

                const selected = selectedSeries === option.brand;

                return (
                  <button
                    key={option.brand}
                    type="button"
                    onClick={() => setSelectedSeries(option.brand)}
                    aria-pressed={selected}
                    className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                      selected
                        ? "border-blue-900 bg-blue-900 text-white"
                        : "bg-white text-blue-900 hover:bg-gray-50"
                    }`}
                  >
                    {option.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {(selectedLevel !== "all" || selectedSeries !== "all") && (
          <div className="mt-5 border-t pt-4">
            <button
              type="button"
              onClick={resetFilters}
              className="text-sm font-semibold text-blue-900 underline underline-offset-4"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-gray-600">
          Showing {filteredProducts.length}{" "}
          {filteredProducts.length === 1 ? "product" : "products"}
          {selectedLevel === "all" && selectedSeries === "all"
            ? ` in ${subjectName}.`
            : ""}
          {selectedLevel !== "all" && selectedSeries === "all"
            ? ` for ${selectedLevelLabel}.`
            : ""}
          {selectedLevel === "all" && selectedSeries !== "all"
            ? ` from ${selectedSeriesLabel}.`
            : ""}
          {selectedLevel !== "all" && selectedSeries !== "all"
            ? ` for ${selectedLevelLabel} from ${selectedSeriesLabel}.`
            : ""}
        </p>

        {(selectedLevel !== "all" || selectedSeries !== "all") && (
          <p className="text-xs font-medium text-gray-500">
            Filters applied
          </p>
        )}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border bg-white p-6">
          <p className="font-semibold">
            No {subjectName} books match this combination.
          </p>

          <p className="mt-2 text-sm text-gray-600">
            Try another class or series, clear the filters, or contact
            DeeGlobalGH if you need a particular title.
          </p>

          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 rounded-xl border px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-gray-50"
          >
            Show All {subjectName} Books
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const outOfStock = product.stockQty <= 0;
            const productHref = `/product/${product.slug}`;

            return (
              <article
                key={product.id}
                className="rounded-2xl border bg-white p-4 transition hover:bg-gray-50"
              >
                <TrackedProductLink
                  href={productHref}
                  itemId={product.id}
                  itemName={product.name}
                  price={product.retailPrice}
                  itemBrand={product.brand || undefined}
                  itemListId={itemListId}
                  itemListName={subjectName}
                  className="block"
                >
                  <div className="flex h-52 items-center justify-center rounded-xl bg-gray-50 p-3">
                    <Image
                      src={product.imageSrc || "/products/placeholder.webp"}
                      alt={product.name}
                      width={500}
                      height={500}
                      className="h-48 w-auto object-contain"
                    />
                  </div>

                  <h3 className="mt-3 font-semibold text-[color:var(--text-main)]">
                    {product.name}
                  </h3>
                </TrackedProductLink>

                <p className="mt-1 text-lg font-bold text-[color:var(--brand-blue)]">
                  GHS {product.retailPrice.toFixed(2)}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {outOfStock ? "Currently out of stock" : "Available to order"}
                </p>

                <TrackedProductLink
                  href={productHref}
                  itemId={product.id}
                  itemName={product.name}
                  price={product.retailPrice}
                  itemBrand={product.brand || undefined}
                  itemListId={itemListId}
                  itemListName={subjectName}
                  className="btn-outline mt-4 inline-flex w-full items-center justify-center px-4 py-3 text-[color:var(--brand-blue)] hover:bg-gray-50"
                >
                  View Product
                </TrackedProductLink>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}