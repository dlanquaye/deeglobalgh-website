export type PublicSeries = {
  slug: string;
  brand: string;
  name: string;
  title: string;
  description: string;
  heading: string;
  intro: string;
};

export const PUBLIC_SERIES: PublicSeries[] = [
  {
    slug: "best-brain",
    brand: "Best Brain",
    name: "Best Brain Series",
    title: "Best Brain Series Textbooks in Ghana | DeeGlobalGH",
    description:
      "Shop Best Brain Series textbooks and learning materials for Ghanaian schools. Browse available Best Brain books from DeeGlobalGH in Kasoa for collection or delivery.",
    heading: "Best Brain Series Textbooks",
    intro:
      "Browse available Best Brain Series textbooks and learning materials for Ghanaian students. DeeGlobalGH supplies school books from Kasoa, with collection and delivery options available.",
  },
  {
    slug: "golden",
    brand: "Golden",
    name: "Golden Series",
    title: "Golden Series Textbooks in Ghana | DeeGlobalGH",
    description:
      "Shop Golden Series textbooks and learning materials for Ghanaian schools. Browse available Golden books from DeeGlobalGH in Kasoa for collection or delivery.",
    heading: "Golden Series Textbooks",
    intro:
      "Browse available Golden Series textbooks and learning materials for Ghanaian students. DeeGlobalGH supplies school books from Kasoa, with collection and delivery options available.",
  },
  {
    slug: "excellence",
    brand: "Excellence",
    name: "Excellence Series",
    title: "Excellence Series Textbooks in Ghana | DeeGlobalGH",
    description:
      "Shop Excellence Series textbooks and learning materials for Ghanaian schools. Browse available Excellence books from DeeGlobalGH in Kasoa for collection or delivery.",
    heading: "Excellence Series Textbooks",
    intro:
      "Browse available Excellence Series textbooks and learning materials for Ghanaian students. DeeGlobalGH supplies school books from Kasoa, with collection and delivery options available.",
  },
  {
    slug: "wise-ant",
    brand: "Wise Ant",
    name: "Wise Ant Series",
    title: "Wise Ant Series Textbooks in Ghana | DeeGlobalGH",
    description:
      "Shop Wise Ant Series textbooks and learning materials for Ghanaian schools. Browse available Wise Ant books from DeeGlobalGH in Kasoa for collection or delivery.",
    heading: "Wise Ant Series Textbooks",
    intro:
      "Browse available Wise Ant Series textbooks and learning materials for Ghanaian students. DeeGlobalGH supplies school books from Kasoa, with collection and delivery options available.",
  },
  {
    slug: "don",
    brand: "Don",
    name: "Don Series",
    title: "Don Series Textbooks in Ghana | DeeGlobalGH",
    description:
      "Shop Don Series textbooks and learning materials for Ghanaian schools. Browse available Don books from DeeGlobalGH in Kasoa for collection or delivery.",
    heading: "Don Series Textbooks",
    intro:
      "Browse available Don Series textbooks and learning materials for Ghanaian students. DeeGlobalGH supplies school books from Kasoa, with collection and delivery options available.",
  },
  {
    slug: "essential",
    brand: "Essential",
    name: "Essential Series",
    title: "Essential Series Textbooks in Ghana | DeeGlobalGH",
    description:
      "Shop Essential Series textbooks and learning materials for Ghanaian schools. Browse available Essential books from DeeGlobalGH in Kasoa for collection or delivery.",
    heading: "Essential Series Textbooks",
    intro:
      "Browse available Essential Series textbooks and learning materials for Ghanaian students. DeeGlobalGH supplies school books from Kasoa, with collection and delivery options available.",
  },
];

export function getPublicSeries(slug: string): PublicSeries | undefined {
  return PUBLIC_SERIES.find((series) => series.slug === slug);
}
