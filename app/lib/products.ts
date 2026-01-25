export type ProductImage = {
  src: string;
  alt: string;
  title?: string;
  caption?: string;
  description?: string;
};

export type ProductSEO = {
  // Yoast-style SEO fields
  focusKeyphrase?: string;
  metaTitle?: string;
  metaDescription?: string;

  // Social sharing
  socialTitle?: string;
  socialDescription?: string;

  // Website content
  shortSummary?: string;
  fullDescription?: string;

  // Extra ecommerce info
  tags?: string[];
  brand?: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: ProductImage;
  categorySlug: string;
  levelSlugs: string[];

  // ✅ Inventory (optional for safe rollout)
  stockQty?: number; // how many items you have
  lowStockThreshold?: number; // show warning when stock is low

  seo?: ProductSEO;
};


export const products: Product[] = [
  
  {
    id: "DG0001",
    name: "Wise Ant Chemistry – SHS 1–3 Combined Edition",
    slug: "wise-ant-chemistry-shs-1-3-combined-edition",
    price: 215,    stockQty: 20,
    lowStockThreshold: 3,

    image: {
      src: "/products/wise-ant-chemistry-shs-1-3-combined-edition.webp",
      alt: "Wise Ant Chemistry textbook cover for SHS 1 to SHS 3 combined edition",
      title: "Wise Ant Chemistry – SHS 1–3 Combined Edition",
      caption: "Wise Ant Chemistry Textbook for SHS 1–3 (Combined Edition).",
      description:
        "Cover image of Wise Ant Chemistry textbook for Senior High School (SHS 1–3) combined edition.",
    },
    categorySlug: "shs-combined-edition-textbooks",
    levelSlugs: ["shs-1", "shs-2", "shs-3"],
    seo: {
  focusKeyphrase: "Wise Ant Chemistry SHS 1–3 Combined Edition",
  metaTitle: "Wise Ant Chemistry – SHS 1–3 Combined Edition | DeeglobalGh",
  metaDescription:
    "Buy Wise Ant Chemistry – SHS 1–3 Combined Edition textbook in Ghana. Ideal for SHS students and WASSCE preparation. Order now from DeeglobalGh for delivery.",
  socialTitle: "Wise Ant Chemistry – SHS 1–3 Combined Edition",
  socialDescription:
    "A trusted SHS Chemistry Combined Edition textbook for classroom learning and WASSCE preparation. Available with delivery from DeeglobalGh.",
  shortSummary:
    "Wise Ant Chemistry Combined Edition textbook for SHS 1–3 learners and WASSCE preparation.",
  fullDescription:
    "Wise Ant Chemistry – SHS 1–3 Combined Edition is a recommended Chemistry textbook for Senior High School learners. It supports classroom lessons, revision, and WASSCE preparation. It is suitable for SHS 1, SHS 2, and SHS 3 students using a combined edition Chemistry textbook.",
  brand: "Wise Ant",
  tags: [
    "SHS Chemistry Textbook",
    "Wise Ant Chemistry",
    "SHS 1 Chemistry",
    "SHS 2 Chemistry",
    "SHS 3 Chemistry",
    "WASSCE Chemistry",
    "Combined Edition Textbook",
    "Chemistry Textbook Ghana"
  ],
},

  },
  {
    id: "DG0002",
    name: "Wise Ant Biology – SHS 1–3 Combined Edition",
    slug: "wise-ant-biology-shs-1-3-combined-edition",
    price: 215,    stockQty: 20,
    lowStockThreshold: 3,

    image: {
      src: "/products/wise-ant-biology-shs-1-3-combined-edition.webp",
      alt: "Wise Ant Biology textbook cover for SHS 1 to SHS 3 combined edition",
      title: "Wise Ant Biology – SHS 1–3 Combined Edition",
      caption: "Wise Ant Biology Textbook for SHS 1–3 (Combined Edition).",
      description:
        "Cover image of Wise Ant Biology textbook for Senior High School (SHS 1–3) combined edition.",
    },
    categorySlug: "shs-combined-edition-textbooks",
    levelSlugs: ["shs-1", "shs-2", "shs-3"],
    seo: {
  focusKeyphrase: "Wise Ant Biology SHS 1–3 Combined Edition",
  metaTitle: "Wise Ant Biology – SHS 1–3 Combined Edition | DeeglobalGh",
  metaDescription:
    "Buy Wise Ant Biology – SHS 1–3 Combined Edition textbook in Ghana. Perfect for SHS learning and WASSCE Biology preparation. Order from DeeglobalGh for delivery.",
  socialTitle: "Wise Ant Biology – SHS 1–3 Combined Edition",
  socialDescription:
    "A trusted Biology Combined Edition textbook for SHS students and WASSCE preparation. Order from DeeglobalGh with delivery.",
  shortSummary:
    "Wise Ant Biology Combined Edition textbook for SHS 1–3 learning and WASSCE Biology preparation.",
  fullDescription:
    "Wise Ant Biology – SHS 1–3 Combined Edition is a Biology textbook designed for Senior High School learners. It supports understanding of key Biology topics, classroom work, and exam-focused revision. This combined edition is suitable for SHS 1, SHS 2, and SHS 3 students preparing for WASSCE.",
  brand: "Wise Ant",
  tags: [
    "SHS Biology Textbook",
    "Wise Ant Biology",
    "SHS 1 Biology",
    "SHS 2 Biology",
    "SHS 3 Biology",
    "WASSCE Biology",
    "Combined Edition Textbook",
    "Biology Textbook Ghana"
  ],
},

  },
    {
    id: "DG0003",
    name: "Wise Ant Additional Mathematics – SHS Year 1",
    slug: "wise-ant-additional-mathematics-shs-year-1",
    price: 215,    stockQty: 20,
    lowStockThreshold: 3,

    image: {
      src: "/products/wise-ant-additional-mathematics-shs-year-1.webp",
      alt: "Wise Ant Additional Mathematics textbook cover for SHS 1",
      title: "Wise Ant Additional Mathematics – SHS Year 1",
      caption: "Wise Ant Additional Mathematics Textbook for SHS 1.",
      description:
        "Cover image of Wise Ant Additional Mathematics textbook for Senior High School Year 1 (SHS 1).",
    },
    categorySlug: "textbooks",
    levelSlugs: ["shs-1"],
    seo: {
      focusKeyphrase: "Wise Ant Additional Mathematics SHS 1",
      metaTitle: "Wise Ant Additional Mathematics – SHS Year 1 | DeeglobalGh",
      metaDescription:
        "Buy Wise Ant Additional Mathematics for SHS Year 1 in Ghana. Perfect for SHS 1 learning and exam preparation. Order from DeeglobalGh for delivery.",
      socialTitle: "Wise Ant Additional Mathematics – SHS Year 1",
      socialDescription:
        "Get Wise Ant Additional Mathematics for SHS 1 from DeeglobalGh. Ideal for practice and SHS exam preparation. Delivery available.",
      shortSummary:
        "Wise Ant Additional Mathematics textbook for SHS Year 1 students and exam preparation.",
      fullDescription:
        "Wise Ant Additional Mathematics – SHS Year 1 is designed for SHS 1 learners. It supports classroom learning, practice, and exam preparation with clear explanations and structured topics for Additional Mathematics.",
      brand: "Wise Ant",
      tags: [
        "SHS Additional Mathematics Textbook",
        "Wise Ant Additional Mathematics",
        "SHS 1 Mathematics",
        "Additional Maths Ghana",
        "WASSCE Mathematics",
      ],
    },
  },

  {
    id: "DG0004",
    name: "Wise Ant English for SHS",
    slug: "wise-ant-english-for-shs",
    price: 215,    stockQty: 20,
    lowStockThreshold: 3,

    image: {
      src: "/products/wise-ant-english-shs-1-3-combined-edition.webp",
      alt: "Wise Ant English textbook cover for SHS 1 to SHS 3 combined edition",
      title: "Wise Ant English for SHS",
      caption: "Wise Ant English Textbook for SHS 1–3 (Combined Edition).",
      description:
        "Cover image of Wise Ant English Language textbook for Senior High School (SHS 1–3) combined edition.",
    },
    categorySlug: "shs-combined-edition-textbooks",
    levelSlugs: ["shs-1", "shs-2", "shs-3"],
    seo: {
  focusKeyphrase: "Wise Ant English for SHS",
  metaTitle: "Wise Ant English for SHS | Combined Edition Textbook | DeeglobalGh",
  metaDescription:
    "Buy Wise Ant English for SHS in Ghana. Great for grammar, comprehension, and WASSCE English preparation. Order from DeeglobalGh for delivery.",
  socialTitle: "Wise Ant English for SHS (Combined Edition)",
  socialDescription:
    "A strong English Language textbook for SHS students, grammar and comprehension practice, and WASSCE preparation. Available with delivery.",
  shortSummary:
    "Wise Ant English for SHS Combined Edition textbook for grammar, comprehension, and WASSCE preparation.",
  fullDescription:
    "Wise Ant English for SHS is a Combined Edition English Language textbook for Senior High School learners. It supports grammar, comprehension, summary writing, and essay writing skills. It is suitable for SHS 1, SHS 2, and SHS 3 students preparing for school exams and WASSCE.",
  brand: "Wise Ant",
  tags: [
    "SHS English Textbook",
    "Wise Ant English",
    "WASSCE English",
    "English Language Textbook Ghana",
    "Combined Edition Textbook",
    "SHS 1 English",
    "SHS 2 English",
    "SHS 3 English"
  ],
},

  },
  {
    id: "DG0005",
    name: "Wise Ant Mathematics for SHS",
    slug: "wise-ant-mathematics-for-shs",
    price: 215,    stockQty: 20,
    lowStockThreshold: 3,

    image: {
      src: "/products/wise-ant-mathematics-shs-1-3-combined-edition.webp",
      alt: "Wise Ant Mathematics textbook cover for SHS 1 to SHS 3 combined edition",
      title: "Wise Ant Mathematics for SHS",
      caption: "Wise Ant Mathematics Textbook for SHS 1–3 (Combined Edition).",
      description:
        "Cover image of Wise Ant Mathematics textbook for Senior High School (SHS 1–3) combined edition.",
    },
    categorySlug: "shs-combined-edition-textbooks",
    levelSlugs: ["shs-1", "shs-2", "shs-3"],
    seo: {
  focusKeyphrase: "Wise Ant Mathematics for SHS",
  metaTitle: "Wise Ant Mathematics for SHS | SHS 1–3 Combined Edition | DeeglobalGh",
  metaDescription:
    "Buy Wise Ant Mathematics for SHS in Ghana. A Combined Edition textbook for SHS 1–3 Maths learning and WASSCE preparation. Order from DeeglobalGh for delivery.",
  socialTitle: "Wise Ant Mathematics for SHS (Combined Edition)",
  socialDescription:
    "Wise Ant Mathematics for SHS supports SHS 1–3 learning and WASSCE preparation. Order now from DeeglobalGh for delivery.",
  shortSummary:
    "Wise Ant Mathematics for SHS Combined Edition textbook for SHS 1–3 learning and WASSCE preparation.",
  fullDescription:
    "Wise Ant Mathematics for SHS is a Combined Edition Mathematics textbook for Senior High School learners. It supports SHS 1, SHS 2, and SHS 3 students with clear explanations, worked examples, and practice questions. It is suitable for classroom learning, revision, and WASSCE preparation.",
  brand: "Wise Ant",
  tags: [
    "SHS Mathematics Textbook",
    "Wise Ant Mathematics",
    "WASSCE Mathematics",
    "Mathematics Textbook Ghana",
    "Combined Edition Textbook",
    "SHS 1 Mathematics",
    "SHS 2 Mathematics",
    "SHS 3 Mathematics"
  ],
},

  },
  {
    id: "DG0006",
    name: "Wise Ant General Science for SHS",
    slug: "wise-ant-general-science-for-shs",
    price: 215,    stockQty: 20,
    lowStockThreshold: 3,

    image: {
      src: "/products/wise-ant-general-science-shs-1-3-combined-edition.webp",
      alt: "Wise Ant General Science textbook cover for SHS 1 to SHS 3 combined edition",
      title: "Wise Ant General Science for SHS",
      caption: "Wise Ant General Science Textbook for SHS 1–3 (Combined Edition).",
      description:
        "Cover image of Wise Ant General Science textbook for Senior High School (SHS 1–3) combined edition.",
    },
    categorySlug: "shs-combined-edition-textbooks",
    levelSlugs: ["shs-1", "shs-2", "shs-3"],
    seo: {
  focusKeyphrase: "Wise Ant General Science for SHS",
  metaTitle: "Wise Ant General Science for SHS | SHS 1–3 Combined Edition | DeeglobalGh",
  metaDescription:
    "Buy Wise Ant General Science for SHS in Ghana. A Combined Edition textbook for SHS 1–3 learning and WASSCE science preparation. Order from DeeglobalGh for delivery.",
  socialTitle: "Wise Ant General Science for SHS (Combined Edition)",
  socialDescription:
    "A trusted General Science Combined Edition textbook for SHS 1–3 learning and WASSCE preparation. Available with delivery from DeeglobalGh.",
  shortSummary:
    "Wise Ant General Science Combined Edition textbook for SHS 1–3 learning and WASSCE preparation.",
  fullDescription:
    "Wise Ant General Science for SHS is a Combined Edition General Science textbook for Senior High School learners. It supports SHS 1, SHS 2, and SHS 3 classroom learning, revision, and exam preparation with structured topics and practice.",
  brand: "Wise Ant",
  tags: [
    "SHS General Science Textbook",
    "Wise Ant General Science",
    "WASSCE General Science",
    "General Science Textbook Ghana",
    "Combined Edition Textbook",
    "SHS 1 General Science",
    "SHS 2 General Science",
    "SHS 3 General Science"
  ],
},

  },
  {
    id: "DG0007",
    name: "Wise Ant Physics for SHS",
    slug: "wise-ant-physics-for-shs",
    price: 215,    stockQty: 20,
    lowStockThreshold: 3,

    image: {
      src: "/products/wise-ant-physics-shs-1-3-combined-edition.webp",
      alt: "Wise Ant Physics textbook cover for SHS 1 to SHS 3 combined edition",
      title: "Wise Ant Physics for SHS",
      caption: "Wise Ant Physics Textbook for SHS 1–3 (Combined Edition).",
      description:
        "Cover image of Wise Ant Physics textbook for Senior High School (SHS 1–3) combined edition.",
    },
    categorySlug: "shs-combined-edition-textbooks",
    levelSlugs: ["shs-1", "shs-2", "shs-3"],
    seo: {
  focusKeyphrase: "Wise Ant Physics for SHS",
  metaTitle: "Wise Ant Physics for SHS | SHS 1–3 Combined Edition | DeeglobalGh",
  metaDescription:
    "Buy Wise Ant Physics for SHS in Ghana. A Combined Edition textbook for SHS 1–3 Physics learning and WASSCE preparation. Order from DeeglobalGh for delivery.",
  socialTitle: "Wise Ant Physics for SHS (Combined Edition)",
  socialDescription:
    "A trusted Physics Combined Edition textbook for SHS 1–3 learning and WASSCE preparation. Available with delivery from DeeglobalGh.",
  shortSummary:
    "Wise Ant Physics Combined Edition textbook for SHS 1–3 learning and WASSCE preparation.",
  fullDescription:
    "Wise Ant Physics for SHS is a Combined Edition Physics textbook for Senior High School learners. It supports SHS 1, SHS 2, and SHS 3 classroom learning, revision, and exam preparation with clear explanations and practice questions.",
  brand: "Wise Ant",
  tags: [
    "SHS Physics Textbook",
    "Wise Ant Physics",
    "WASSCE Physics",
    "Physics Textbook Ghana",
    "Combined Edition Textbook",
    "SHS 1 Physics",
    "SHS 2 Physics",
    "SHS 3 Physics"
  ],
},

  },
  {
    id: "DG0008",
    name: "Wise Ant Social for SHS",
    slug: "wise-ant-social-for-shs",
    price: 205,    stockQty: 20,
    lowStockThreshold: 3,

    image: {
      src: "/products/wise-ant-social-studies-shs-1-3-combined-edition.webp",
      alt: "Wise Ant Social Studies textbook cover for SHS 1 to SHS 3 combined edition",
      title: "Wise Ant Social for SHS",
      caption: "Wise Ant Social Studies Textbook for SHS 1–3 (Combined Edition).",
      description:
        "Cover image of Wise Ant Social Studies textbook for Senior High School (SHS 1–3) combined edition.",
    },
    categorySlug: "shs-combined-edition-textbooks",
    levelSlugs: ["shs-1", "shs-2", "shs-3"],
    seo: {
  focusKeyphrase: "Wise Ant Social Studies for SHS",
  metaTitle: "Wise Ant Social Studies for SHS | SHS 1–3 Combined Edition | DeeglobalGh",
  metaDescription:
    "Buy Wise Ant Social Studies for SHS in Ghana. A Combined Edition textbook for SHS 1–3 Social Studies learning and WASSCE preparation. Order from DeeglobalGh for delivery.",
  socialTitle: "Wise Ant Social Studies for SHS (Combined Edition)",
  socialDescription:
    "A trusted Social Studies Combined Edition textbook for SHS 1–3 learning and WASSCE preparation. Available with delivery from DeeglobalGh.",
  shortSummary:
    "Wise Ant Social Studies Combined Edition textbook for SHS 1–3 learning and WASSCE preparation.",
  fullDescription:
    "Wise Ant Social Studies for SHS is a Combined Edition Social Studies textbook for Senior High School learners. It supports SHS 1, SHS 2, and SHS 3 classroom learning, revision, and exam preparation with clear explanations, examples, and practice questions.",
  brand: "Wise Ant",
  tags: [
    "SHS Social Studies Textbook",
    "Wise Ant Social Studies",
    "WASSCE Social Studies",
    "Social Studies Textbook Ghana",
    "Combined Edition Textbook",
    "SHS 1 Social Studies",
    "SHS 2 Social Studies",
    "SHS 3 Social Studies"
  ],
},

  },
  {
    id: "DG0010",
    name: "Excellence Mathematics Textbook Basic 1",
    slug: "excellence-mathematics-textbook-basic-1",
    price: 70,    stockQty: 20,
    lowStockThreshold: 3,

    image: {
      src: "/products/excellence-mathematics-textbook-basic-1.webp",
      alt: "Excellence Mathematics Textbook Basic 1 cover",
      title: "Excellence Mathematics Textbook Basic 1",
      caption: "Excellence Mathematics Textbook for Basic 1.",
      description: "Cover image of Excellence Mathematics Textbook for Basic 1 pupils.",
    },
    categorySlug: "textbooks",
    levelSlugs: ["basic-1"],
    seo: {
  focusKeyphrase: "Excellence Mathematics Textbook Basic 1",
  metaTitle: "Excellence Mathematics Textbook Basic 1 | DeeglobalGh",
  metaDescription:
    "Buy Excellence Mathematics Textbook for Basic 1 in Ghana. A trusted maths textbook for Basic 1 pupils. Order from DeeglobalGh for delivery in Kasoa and across Ghana.",
  socialTitle: "Excellence Mathematics Textbook Basic 1 | DeeglobalGh",
  socialDescription:
    "Get Excellence Mathematics Textbook for Basic 1 from DeeglobalGh. Ideal for classroom learning and home practice. Delivery available.",
  shortSummary:
    "Excellence Mathematics Textbook for Basic 1 pupils for strong numeracy and learning support.",
  fullDescription:
    "Excellence Mathematics Textbook Basic 1 is designed to support Basic 1 pupils with strong foundations in numeracy. It helps learners practise key maths skills through clear lessons and structured exercises. Suitable for classroom learning, homework, and extra practice at home.",
  brand: "Excellence",
  tags: [
    "Excellence Mathematics",
    "Basic 1 Mathematics Textbook",
    "Basic 1 Textbooks",
    "Mathematics Textbook Ghana",
    "Lower Primary Mathematics",
    "Textbooks in Kasoa"
  ],
},

  },
  {
    id: "DG0011",
    name: "Excellence Mathematics Textbook Basic 2",
    slug: "excellence-mathematics-textbook-basic-2",
    price: 70,    stockQty: 20,
    lowStockThreshold: 3,

    image: {
      src: "/products/excellence-mathematics-textbook-basic-2.webp",
      alt: "Excellence Mathematics Textbook Basic 2 cover",
      title: "Excellence Mathematics Textbook Basic 2",
      caption: "Excellence Mathematics Textbook for Basic 2.",
      description: "Cover image of Excellence Mathematics Textbook for Basic 2 pupils.",
    },
    categorySlug: "textbooks",
    levelSlugs: ["basic-2"],
    seo: {
  focusKeyphrase: "Excellence Mathematics Textbook Basic 2",
  metaTitle: "Excellence Mathematics Textbook Basic 2 | DeeglobalGh",
  metaDescription:
    "Buy Excellence Mathematics Textbook for Basic 2 in Ghana. A trusted maths textbook for Basic 2 pupils. Order from DeeglobalGh for delivery in Kasoa and across Ghana.",
  socialTitle: "Excellence Mathematics Textbook Basic 2 | DeeglobalGh",
  socialDescription:
    "Get Excellence Mathematics Textbook for Basic 2 from DeeglobalGh. Perfect for maths learning, homework, and revision. Delivery available.",
  shortSummary:
    "Excellence Mathematics Textbook for Basic 2 pupils for strong maths skills and practice.",
  fullDescription:
    "Excellence Mathematics Textbook Basic 2 supports Basic 2 pupils with clear maths lessons and practice activities. It helps learners build confidence through structured exercises for classroom work and home practice. Ideal for schools, parents, and exam preparation.",
  brand: "Excellence",
  tags: [
    "Excellence Mathematics",
    "Basic 2 Mathematics Textbook",
    "Basic 2 Textbooks",
    "Mathematics Textbook Ghana",
    "Lower Primary Mathematics",
    "Textbooks in Kasoa"
  ],
},

  },
  {
    id: "DG0012",
    name: "Excellence Mathematics Textbook Basic 3",
    slug: "excellence-mathematics-textbook-basic-3",
    price: 70,    stockQty: 20,
    lowStockThreshold: 3,

    image: {
      src: "/products/excellence-mathematics-textbook-basic-3.webp",
      alt: "Excellence Mathematics Textbook Basic 3 cover",
      title: "Excellence Mathematics Textbook Basic 3",
      caption: "Excellence Mathematics Textbook for Basic 3.",
      description: "Cover image of Excellence Mathematics Textbook for Basic 3 pupils.",
    },
    categorySlug: "textbooks",
    levelSlugs: ["basic-3"],
    seo: {
  focusKeyphrase: "Excellence Mathematics Textbook Basic 3",
  metaTitle: "Excellence Mathematics Textbook Basic 3 | DeeglobalGh",
  metaDescription:
    "Buy Excellence Mathematics Textbook for Basic 3 in Ghana. A trusted maths textbook for Basic 3 pupils. Order from DeeglobalGh for delivery in Kasoa and across Ghana.",
  socialTitle: "Excellence Mathematics Textbook Basic 3 | DeeglobalGh",
  socialDescription:
    "Get Excellence Mathematics Textbook for Basic 3 from DeeglobalGh. Great for classroom learning and home revision. Delivery available.",
  shortSummary:
    "Excellence Mathematics Textbook for Basic 3 pupils for learning, homework, and maths revision.",
  fullDescription:
    "Excellence Mathematics Textbook Basic 3 helps Basic 3 pupils improve numeracy and problem-solving skills. It contains well-structured lessons and practice activities for classroom teaching and extra learning at home. Suitable for school work, homework, and revision.",
  brand: "Excellence",
  tags: [
    "Excellence Mathematics",
    "Basic 3 Mathematics Textbook",
    "Basic 3 Textbooks",
    "Mathematics Textbook Ghana",
    "Upper Primary Mathematics",
    "Textbooks in Kasoa"
  ],
},

  },
  {
    id: "DG0013",
    name: "Excellence Mathematics Textbook Basic 4",
    slug: "excellence-mathematics-textbook-basic-4",
    price: 70,    stockQty: 20,
    lowStockThreshold: 3,

    image: {
      src: "/products/excellence-mathematics-textbook-basic-4.webp",
      alt: "Excellence Mathematics Textbook Basic 4 cover",
      title: "Excellence Mathematics Textbook Basic 4",
      caption: "Excellence Mathematics Textbook for Basic 4.",
      description: "Cover image of Excellence Mathematics Textbook for Basic 4 pupils.",
    },
    categorySlug: "textbooks",
    levelSlugs: ["basic-4"],
    seo: {
  focusKeyphrase: "Excellence Mathematics Textbook Basic 4",
  metaTitle: "Excellence Mathematics Textbook Basic 4 | DeeglobalGh",
  metaDescription:
    "Buy Excellence Mathematics Textbook for Basic 4 in Ghana. A trusted maths textbook for Basic 4 pupils. Order from DeeglobalGh for delivery in Kasoa and across Ghana.",
  socialTitle: "Excellence Mathematics Textbook Basic 4 | DeeglobalGh",
  socialDescription:
    "Get Excellence Mathematics Textbook for Basic 4 from DeeglobalGh. Ideal for school learning and home revision. Delivery available.",
  shortSummary:
    "Excellence Mathematics Textbook for Basic 4 pupils for learning, exercises, and revision.",
  fullDescription:
    "Excellence Mathematics Textbook Basic 4 supports Basic 4 pupils with clear maths lessons and well-structured exercises. It helps learners practise key topics and prepare for class tests and exams. Suitable for classroom teaching, homework, and home learning.",
  brand: "Excellence",
  tags: [
    "Excellence Mathematics",
    "Basic 4 Mathematics Textbook",
    "Basic 4 Textbooks",
    "Mathematics Textbook Ghana",
    "Upper Primary Mathematics",
    "Textbooks in Kasoa"
  ],
},

  },
  {
    id: "DG0014",
    name: "Excellence Mathematics Textbook Basic 5",
    slug: "excellence-mathematics-textbook-basic-5",
    price: 70,    stockQty: 20,
    lowStockThreshold: 3,

    image: {
      src: "/products/excellence-mathematics-textbook-basic-5.webp",
      alt: "Excellence Mathematics Textbook Basic 5 cover",
      title: "Excellence Mathematics Textbook Basic 5",
      caption: "Excellence Mathematics Textbook for Basic 5.",
      description: "Cover image of Excellence Mathematics Textbook for Basic 5 pupils.",
    },
    categorySlug: "textbooks",
    levelSlugs: ["basic-5"],
    seo: {
  focusKeyphrase: "Excellence Mathematics Textbook Basic 5",
  metaTitle: "Excellence Mathematics Textbook Basic 5 | DeeglobalGh",
  metaDescription:
    "Buy Excellence Mathematics Textbook for Basic 5 in Ghana. A trusted maths textbook for Basic 5 pupils. Order from DeeglobalGh for delivery in Kasoa and across Ghana.",
  socialTitle: "Excellence Mathematics Textbook Basic 5 | DeeglobalGh",
  socialDescription:
    "Get Excellence Mathematics Textbook for Basic 5 from DeeglobalGh. Great for class learning and exam revision. Delivery available.",
  shortSummary:
    "Excellence Mathematics Textbook for Basic 5 pupils for strong maths understanding and revision.",
  fullDescription:
    "Excellence Mathematics Textbook Basic 5 helps pupils master key maths concepts with clear lessons and practice questions. It supports classroom learning, homework, and revision for exams. Suitable for schools and parents supporting learning at home.",
  brand: "Excellence",
  tags: [
    "Excellence Mathematics",
    "Basic 5 Mathematics Textbook",
    "Basic 5 Textbooks",
    "Mathematics Textbook Ghana",
    "Upper Primary Mathematics",
    "Textbooks in Kasoa"
  ],
},

  },
  {
    id: "DG0015",
    name: "Excellence Mathematics Textbook Basic 6",
    slug: "excellence-mathematics-textbook-basic-6",
    price: 70,    stockQty: 20,
    lowStockThreshold: 3,

    image: {
      src: "/products/excellence-mathematics-textbook-basic-6.webp",
      alt: "Excellence Mathematics Textbook Basic 6 cover",
      title: "Excellence Mathematics Textbook Basic 6",
      caption: "Excellence Mathematics Textbook for Basic 6.",
      description: "Cover image of Excellence Mathematics Textbook for Basic 6 pupils.",
    },
    categorySlug: "textbooks",
    levelSlugs: ["basic-6"],
    seo: {
  focusKeyphrase: "Excellence Mathematics Textbook Basic 6",
  metaTitle: "Excellence Mathematics Textbook Basic 6 | DeeglobalGh",
  metaDescription:
    "Buy Excellence Mathematics Textbook for Basic 6 in Ghana. A trusted maths textbook for Basic 6 pupils and exam preparation. Order from DeeglobalGh for delivery in Kasoa and across Ghana.",
  socialTitle: "Excellence Mathematics Textbook Basic 6 | DeeglobalGh",
  socialDescription:
    "Get Excellence Mathematics Textbook for Basic 6 from DeeglobalGh. Ideal for BECE preparation support and revision. Delivery available.",
  shortSummary:
    "Excellence Mathematics Textbook for Basic 6 pupils for learning and exam revision.",
  fullDescription:
    "Excellence Mathematics Textbook Basic 6 supports pupils with structured maths lessons and practice exercises. It helps learners prepare well for school assessments and final year revision. Suitable for classroom learning, homework support, and strong revision at home.",
  brand: "Excellence",
  tags: [
    "Excellence Mathematics",
    "Basic 6 Mathematics Textbook",
    "Basic 6 Textbooks",
    "Mathematics Textbook Ghana",
    "Upper Primary Mathematics",
    "Textbooks in Kasoa"
  ],
},

  },
  {
    id: "DG0016",
    name: "Excellence Mathematics Textbook For JHS",
    slug: "excellence-mathematics-textbook-for-jhs",
    price: 160,    stockQty: 20,
    lowStockThreshold: 3,

    image: {
      src: "/products/excellence-mathematics-textbook-jhs-1-3.webp",
      alt: "Excellence Mathematics textbook cover for JHS 1 to JHS 3 combined edition",
      title: "Excellence Mathematics Textbook For JHS",
      caption: "Excellence Mathematics Textbook for JHS 1–3.",
      description:
        "Cover image of Excellence Mathematics textbook for Junior High School (JHS 1–3).",
    },
    categorySlug: "jhs-combined-edition-textbooks",
    levelSlugs: ["jhs-1", "jhs-2", "jhs-3"],
    seo: {
  focusKeyphrase: "Excellence Mathematics Textbook for JHS",
  metaTitle: "Excellence Mathematics Textbook for JHS 1–3 | DeeglobalGh",
  metaDescription:
    "Buy Excellence Mathematics Textbook for JHS 1–3 in Ghana. A combined edition textbook for JHS Mathematics learning and BECE preparation. Order from DeeglobalGh for delivery.",
  socialTitle: "Excellence Mathematics Textbook for JHS 1–3 | DeeglobalGh",
  socialDescription:
    "Get Excellence Mathematics combined edition textbook for JHS 1–3 from DeeglobalGh. Perfect for BECE maths revision. Delivery available.",
  shortSummary:
    "Excellence Mathematics combined edition textbook for JHS 1–3 learning and BECE preparation.",
  fullDescription:
    "Excellence Mathematics Textbook for JHS is a combined edition textbook suitable for JHS 1, JHS 2, and JHS 3 learners. It supports maths learning through clear explanations and practice questions. It is ideal for classroom teaching, homework, and BECE preparation.",
  brand: "Excellence",
  tags: [
    "Excellence Mathematics",
    "JHS Mathematics Textbook",
    "JHS 1 Mathematics",
    "JHS 2 Mathematics",
    "JHS 3 Mathematics",
    "BECE Mathematics",
    "Combined Edition Textbook",
    "Textbooks in Kasoa"
  ]
},

  },
  {
    "id": "DG0017",
    "slug": "golden-creative-arts-textbook-for-kg-1",
    "name": "Golden Creative Arts Textbook for KG 1",
    "price": 65,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "pre-school"
    ],
    "image": {
      "src": "/products/golden-creative-arts-texbook-kg-1.webp",
      "alt": "Golden Creative Arts Textbook for KG 1 - Textbooks | DeeGlobalGH",
      "title": "Golden Creative Arts Textbook for KG 1",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden Creative Arts Textbook for KG 1 in Ghana",
      "metaTitle": "Golden Creative Arts Textbook for KG 1 | DeeglobalGh",
      "metaDescription": "Buy Golden Creative Arts Textbook for KG 1 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden Creative Arts Textbook for KG 1 | DeeglobalGh",
      "socialDescription": "Order Golden Creative Arts Textbook for KG 1 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden creative arts textbook for kg 1 golden textbooks pre-school",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "pre-school"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0018",
    "slug": "golden-creative-arts-textbook-for-kg-2",
    "name": "Golden Creative Arts Textbook for KG 2",
    "price": 65,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "pre-school"
    ],
    "image": {
      "src": "/products/golden-creative-arts-texbook-kg-2.webp",
      "alt": "Golden Creative Arts Textbook for KG 2 - Textbooks | DeeGlobalGH",
      "title": "Golden Creative Arts Textbook for KG 2",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden Creative Arts Textbook for KG 2 in Ghana",
      "metaTitle": "Golden Creative Arts Textbook for KG 2 | DeeglobalGh",
      "metaDescription": "Buy Golden Creative Arts Textbook for KG 2 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden Creative Arts Textbook for KG 2 | DeeglobalGh",
      "socialDescription": "Order Golden Creative Arts Textbook for KG 2 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden creative arts textbook for kg 2 golden textbooks pre-school",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "pre-school"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0019",
    "slug": "golden-english-textbook-for-basic-1",
    "name": "Golden English Textbook for Basic 1",
    "price": 75,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "basic-1"
    ],
    "image": {
      "src": "/products/golden-english-texbook-basic-1.webp",
      "alt": "Golden English Textbook for Basic 1 - Basic 1 | DeeGlobalGH",
      "title": "Golden English Textbook for Basic 1",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden English Textbook for Basic 1 in Ghana",
      "metaTitle": "Golden English Textbook for Basic 1 | DeeglobalGh",
      "metaDescription": "Buy Golden English Textbook for Basic 1 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden English Textbook for Basic 1 | DeeglobalGh",
      "socialDescription": "Order Golden English Textbook for Basic 1 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden english textbook for basic 1 golden textbooks basic 1",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "basic-1"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0020",
    "slug": "golden-english-textbook-for-basic-2",
    "name": "Golden English Textbook for Basic 2",
    "price": 75,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "basic-2"
    ],
    "image": {
      "src": "/products/golden-english-texbook-basic-2.webp",
      "alt": "Golden English Textbook for Basic 2 - Basic 2 | DeeGlobalGH",
      "title": "Golden English Textbook for Basic 2",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden English Textbook for Basic 2 in Ghana",
      "metaTitle": "Golden English Textbook for Basic 2 | DeeglobalGh",
      "metaDescription": "Buy Golden English Textbook for Basic 2 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden English Textbook for Basic 2 | DeeglobalGh",
      "socialDescription": "Order Golden English Textbook for Basic 2 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden english textbook for basic 2 golden textbooks basic 2",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "basic-2"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0021",
    "slug": "golden-english-textbook-for-basic-3",
    "name": "Golden English Textbook for Basic 3",
    "price": 75,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "basic-3"
    ],
    "image": {
      "src": "/products/golden-english-texbook-basic-3.webp",
      "alt": "Golden English Textbook for Basic 3 - Basic 3 | DeeGlobalGH",
      "title": "Golden English Textbook for Basic 3",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden English Textbook for Basic 3 in Ghana",
      "metaTitle": "Golden English Textbook for Basic 3 | DeeglobalGh",
      "metaDescription": "Buy Golden English Textbook for Basic 3 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden English Textbook for Basic 3 | DeeglobalGh",
      "socialDescription": "Order Golden English Textbook for Basic 3 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden english textbook for basic 3 golden textbooks basic 3",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "basic-3"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0022",
    "slug": "golden-english-textbook-for-basic-4",
    "name": "Golden English Textbook for Basic 4",
    "price": 75,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "basic-4"
    ],
    "image": {
      "src": "/products/golden-english-texbook-basic-4.webp",
      "alt": "Golden English Textbook for Basic 4 - Basic 4 | DeeGlobalGH",
      "title": "Golden English Textbook for Basic 4",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden English Textbook for Basic 4 in Ghana",
      "metaTitle": "Golden English Textbook for Basic 4 | DeeglobalGh",
      "metaDescription": "Buy Golden English Textbook for Basic 4 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden English Textbook for Basic 4 | DeeglobalGh",
      "socialDescription": "Order Golden English Textbook for Basic 4 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden english textbook for basic 4 golden textbooks basic 4",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "basic-4"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0023",
    "slug": "golden-english-textbook-for-basic-5",
    "name": "Golden English Textbook for Basic 5",
    "price": 75,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "basic-5"
    ],
    "image": {
      "src": "/products/golden-english-texbook-basic-5.webp",
      "alt": "Golden English Textbook for Basic 5 - Basic 5 | DeeGlobalGH",
      "title": "Golden English Textbook for Basic 5",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden English Textbook for Basic 5 in Ghana",
      "metaTitle": "Golden English Textbook for Basic 5 | DeeglobalGh",
      "metaDescription": "Buy Golden English Textbook for Basic 5 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden English Textbook for Basic 5 | DeeglobalGh",
      "socialDescription": "Order Golden English Textbook for Basic 5 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden english textbook for basic 5 golden textbooks basic 5",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "basic-5"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0024",
    "slug": "golden-english-textbook-for-basic-6",
    "name": "Golden English Textbook for Basic 6",
    "price": 75,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "basic-6"
    ],
    "image": {
      "src": "/products/golden-english-texbook-basic-6.webp",
      "alt": "Golden English Textbook for Basic 6 - Basic 6 | DeeGlobalGH",
      "title": "Golden English Textbook for Basic 6",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden English Textbook for Basic 6 in Ghana",
      "metaTitle": "Golden English Textbook for Basic 6 | DeeglobalGh",
      "metaDescription": "Buy Golden English Textbook for Basic 6 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden English Textbook for Basic 6 | DeeglobalGh",
      "socialDescription": "Order Golden English Textbook for Basic 6 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden english textbook for basic 6 golden textbooks basic 6",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "basic-6"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0025",
    "slug": "golden-english-textbook-for-jhs",
    "name": "Golden English Textbook for JHS",
    "price": 160,
    "categorySlug": "jhs-combined-edition-textbooks",
    "levelSlugs": [
      "jhs-1",
      "jhs-2",
      "jhs-3"
    ],
    "image": {
      "src": "/products/golden-english-texbook-jhs-1-3.webp",
      "alt": "Golden English Textbook for JHS - JHS 1 | DeeGlobalGH",
      "title": "Golden English Textbook for JHS",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden English Textbook for JHS in Ghana",
      "metaTitle": "Golden English Textbook for JHS | DeeglobalGh",
      "metaDescription": "Buy Golden English Textbook for JHS in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden English Textbook for JHS | DeeglobalGh",
      "socialDescription": "Order Golden English Textbook for JHS online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden english textbook for jhs golden jhs combined edition textbooks jhs 1 jhs 2 jhs 3",
      "fullDescription": "",
      "tags": [
        "jhs-combined-edition-textbooks",
        "golden",
        "jhs-1",
        "jhs-2",
        "jhs-3"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0026",
    "slug": "golden-english-textbook-for-kg-1",
    "name": "Golden English Textbook for KG 1",
    "price": 65,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "pre-school"
    ],
    "image": {
      "src": "/products/golden-english-texbook-kg-1.webp",
      "alt": "Golden English Textbook for KG 1 - Pre-School | DeeGlobalGH",
      "title": "Golden English Textbook for KG 1",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden English Textbook for KG 1 in Ghana",
      "metaTitle": "Golden English Textbook for KG 1 | DeeglobalGh",
      "metaDescription": "Buy Golden English Textbook for KG 1 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden English Textbook for KG 1 | DeeglobalGh",
      "socialDescription": "Order Golden English Textbook for KG 1 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden english textbook for kg 1 golden textbooks pre-school",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "pre-school"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0027",
    "slug": "golden-english-textbook-for-kg-2",
    "name": "Golden English Textbook for KG 2",
    "price": 65,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "pre-school"
    ],
    "image": {
      "src": "/products/golden-english-texbook-kg-2.jpg",
      "alt": "Golden English Textbook for KG 2 - Pre-School | DeeGlobalGH",
      "title": "Golden English Textbook for KG 2",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden English Textbook for KG 2 in Ghana",
      "metaTitle": "Golden English Textbook for KG 2 | DeeglobalGh",
      "metaDescription": "Buy Golden English Textbook for KG 2 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden English Textbook for KG 2 | DeeglobalGh",
      "socialDescription": "Order Golden English Textbook for KG 2 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden english textbook for kg 2 golden textbooks pre-school",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "pre-school"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0028",
    "slug": "golden-english-textbook-for-nursery-1",
    "name": "Golden English Textbook for Nursery 1",
    "price": 50,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "pre-school"
    ],
    "image": {
      "src": "/products/golden-english-texbook-nursery-1.webp",
      "alt": "Golden English Textbook for Nursery 1 - Pre-School | DeeGlobalGH",
      "title": "Golden English Textbook for Nursery 1",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden English Textbook for Nursery 1 in Ghana",
      "metaTitle": "Golden English Textbook for Nursery 1 | DeeglobalGh",
      "metaDescription": "Buy Golden English Textbook for Nursery 1 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden English Textbook for Nursery 1 | DeeglobalGh",
      "socialDescription": "Order Golden English Textbook for Nursery 1 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden english textbook for nursery 1 golden textbooks pre-school",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "pre-school"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0029",
    "slug": "golden-english-textbook-for-nursery-2",
    "name": "Golden English Textbook for Nursery 2",
    "price": 50,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "pre-school"
    ],
    "image": {
      "src": "/products/golden-english-texbook-nursery-2.webp",
      "alt": "Golden English Textbook for Nursery 2 - Pre-School | DeeGlobalGH",
      "title": "Golden English Textbook for Nursery 2",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden English Textbook for Nursery 2 in Ghana",
      "metaTitle": "Golden English Textbook for Nursery 2 | DeeglobalGh",
      "metaDescription": "Buy Golden English Textbook for Nursery 2 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden English Textbook for Nursery 2 | DeeglobalGh",
      "socialDescription": "Order Golden English Textbook for Nursery 2 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden english textbook for nursery 2 golden textbooks pre-school",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "pre-school"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0030",
    "slug": "golden-hiatory-textbook-for-basic-1",
    "name": "Golden Hiatory  Textbook for Basic 1",
    "price": 65,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "basic-1"
    ],
    "image": {
      "src": "/products/golden-history-texbook-basic-1.webp",
      "alt": "Golden Hiatory  Textbook for Basic 1 - Basic 1 | DeeGlobalGH",
      "title": "Golden Hiatory  Textbook for Basic 1",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden Hiatory  Textbook for Basic 1 in Ghana",
      "metaTitle": "Golden Hiatory  Textbook for Basic 1 | DeeglobalGh",
      "metaDescription": "Buy Golden Hiatory  Textbook for Basic 1 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden Hiatory  Textbook for Basic 1 | DeeglobalGh",
      "socialDescription": "Order Golden Hiatory  Textbook for Basic 1 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden hiatory textbook for basic 1 golden textbooks basic 1",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "basic-1"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0031",
    "slug": "golden-hiatory-textbook-for-basic-2",
    "name": "Golden Hiatory  Textbook for Basic 2",
    "price": 65,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "basic-2"
    ],
    "image": {
      "src": "/products/golden-history-texbook-basic-2.webp",
      "alt": "Golden Hiatory  Textbook for Basic 2 - Basic 2 | DeeGlobalGH",
      "title": "Golden Hiatory  Textbook for Basic 2",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden Hiatory  Textbook for Basic 2 in Ghana",
      "metaTitle": "Golden Hiatory  Textbook for Basic 2 | DeeglobalGh",
      "metaDescription": "Buy Golden Hiatory  Textbook for Basic 2 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden Hiatory  Textbook for Basic 2 | DeeglobalGh",
      "socialDescription": "Order Golden Hiatory  Textbook for Basic 2 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden hiatory textbook for basic 2 golden textbooks basic 2",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "basic-2"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0032",
    "slug": "golden-hiatory-textbook-for-basic-3",
    "name": "Golden Hiatory  Textbook for Basic 3",
    "price": 65,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "basic-3"
    ],
    "image": {
      "src": "/products/golden-history-texbook-basic-3.webp",
      "alt": "Golden Hiatory  Textbook for Basic 3 - Basic 3 | DeeGlobalGH",
      "title": "Golden Hiatory  Textbook for Basic 3",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden Hiatory  Textbook for Basic 3 in Ghana",
      "metaTitle": "Golden Hiatory  Textbook for Basic 3 | DeeglobalGh",
      "metaDescription": "Buy Golden Hiatory  Textbook for Basic 3 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden Hiatory  Textbook for Basic 3 | DeeglobalGh",
      "socialDescription": "Order Golden Hiatory  Textbook for Basic 3 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden hiatory textbook for basic 3 golden textbooks basic 3",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "basic-3"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0033",
    "slug": "golden-hiatory-textbook-for-basic-4",
    "name": "Golden Hiatory  Textbook for Basic 4",
    "price": 65,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "basic-4"
    ],
    "image": {
      "src": "/products/golden-history-texbook-basic-4.webp",
      "alt": "Golden Hiatory  Textbook for Basic 4 - Basic 4 | DeeGlobalGH",
      "title": "Golden Hiatory  Textbook for Basic 4",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden Hiatory  Textbook for Basic 4 in Ghana",
      "metaTitle": "Golden Hiatory  Textbook for Basic 4 | DeeglobalGh",
      "metaDescription": "Buy Golden Hiatory  Textbook for Basic 4 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden Hiatory  Textbook for Basic 4 | DeeglobalGh",
      "socialDescription": "Order Golden Hiatory  Textbook for Basic 4 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden hiatory textbook for basic 4 golden textbooks basic 4",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "basic-4"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0034",
    "slug": "golden-hiatory-textbook-for-basic-5",
    "name": "Golden Hiatory  Textbook for Basic 5",
    "price": 65,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "basic-5"
    ],
    "image": {
      "src": "/products/golden-history-texbook-basic-5.webp",
      "alt": "Golden Hiatory  Textbook for Basic 5 - Basic 5 | DeeGlobalGH",
      "title": "Golden Hiatory  Textbook for Basic 5",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden Hiatory  Textbook for Basic 5 in Ghana",
      "metaTitle": "Golden Hiatory  Textbook for Basic 5 | DeeglobalGh",
      "metaDescription": "Buy Golden Hiatory  Textbook for Basic 5 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden Hiatory  Textbook for Basic 5 | DeeglobalGh",
      "socialDescription": "Order Golden Hiatory  Textbook for Basic 5 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden hiatory textbook for basic 5 golden textbooks basic 5",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "basic-5"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0035",
    "slug": "golden-hiatory-textbook-for-basic-6",
    "name": "Golden Hiatory  Textbook for Basic 6",
    "price": 65,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "basic-6"
    ],
    "image": {
      "src": "/products/golden-history-texbook-basic-6.webp",
      "alt": "Golden Hiatory  Textbook for Basic 6 - Basic 6 | DeeGlobalGH",
      "title": "Golden Hiatory  Textbook for Basic 6",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden Hiatory  Textbook for Basic 6 in Ghana",
      "metaTitle": "Golden Hiatory  Textbook for Basic 6 | DeeglobalGh",
      "metaDescription": "Buy Golden Hiatory  Textbook for Basic 6 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden Hiatory  Textbook for Basic 6 | DeeglobalGh",
      "socialDescription": "Order Golden Hiatory  Textbook for Basic 6 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden hiatory textbook for basic 6 golden textbooks basic 6",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "basic-6"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0036",
    "slug": "golden-mathematics-textbook-for-basic-1",
    "name": "Golden Mathematics  Textbook for Basic 1",
    "price": 70,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "basic-1"
    ],
    "image": {
      "src": "/products/golden-mathematics-texbook-basic-1.webp",
      "alt": "Golden Mathematics  Textbook for Basic 1 - Basic 1 | DeeGlobalGH",
      "title": "Golden Mathematics  Textbook for Basic 1",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden Mathematics  Textbook for Basic 1 in Ghana",
      "metaTitle": "Golden Mathematics  Textbook for Basic 1 | DeeglobalGh",
      "metaDescription": "Buy Golden Mathematics  Textbook for Basic 1 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden Mathematics  Textbook for Basic 1 | DeeglobalGh",
      "socialDescription": "Order Golden Mathematics  Textbook for Basic 1 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden mathematics textbook for basic 1 golden textbooks basic 1",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "basic-1"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0037",
    "slug": "golden-mathematics-textbook-for-basic-2",
    "name": "Golden Mathematics  Textbook for Basic 2",
    "price": 70,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "basic-2"
    ],
    "image": {
      "src": "/products/golden-mathematics-texbook-basic-2.webp",
      "alt": "Golden Mathematics  Textbook for Basic 2 - Basic 2 | DeeGlobalGH",
      "title": "Golden Mathematics  Textbook for Basic 2",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden Mathematics  Textbook for Basic 2 in Ghana",
      "metaTitle": "Golden Mathematics  Textbook for Basic 2 | DeeglobalGh",
      "metaDescription": "Buy Golden Mathematics  Textbook for Basic 2 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden Mathematics  Textbook for Basic 2 | DeeglobalGh",
      "socialDescription": "Order Golden Mathematics  Textbook for Basic 2 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden mathematics textbook for basic 2 golden textbooks basic 2",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "basic-2"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0038",
    "slug": "golden-mathematics-textbook-for-basic-3",
    "name": "Golden Mathematics  Textbook for Basic 3",
    "price": 70,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "basic-3"
    ],
    "image": {
      "src": "/products/golden-mathematics-texbook-basic-3.webp",
      "alt": "Golden Mathematics  Textbook for Basic 3 - Basic 3 | DeeGlobalGH",
      "title": "Golden Mathematics  Textbook for Basic 3",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden Mathematics  Textbook for Basic 3 in Ghana",
      "metaTitle": "Golden Mathematics  Textbook for Basic 3 | DeeglobalGh",
      "metaDescription": "Buy Golden Mathematics  Textbook for Basic 3 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden Mathematics  Textbook for Basic 3 | DeeglobalGh",
      "socialDescription": "Order Golden Mathematics  Textbook for Basic 3 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden mathematics textbook for basic 3 golden textbooks basic 3",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "basic-3"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0039",
    "slug": "golden-mathematics-textbook-for-basic-4",
    "name": "Golden Mathematics  Textbook for Basic 4",
    "price": 70,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "basic-4"
    ],
    "image": {
      "src": "/products/golden-mathematics-texbook-basic-4.jpg",
      "alt": "Golden Mathematics  Textbook for Basic 4 - Basic 4 | DeeGlobalGH",
      "title": "Golden Mathematics  Textbook for Basic 4",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden Mathematics  Textbook for Basic 4 in Ghana",
      "metaTitle": "Golden Mathematics  Textbook for Basic 4 | DeeglobalGh",
      "metaDescription": "Buy Golden Mathematics  Textbook for Basic 4 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden Mathematics  Textbook for Basic 4 | DeeglobalGh",
      "socialDescription": "Order Golden Mathematics  Textbook for Basic 4 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden mathematics textbook for basic 4 golden textbooks basic 4",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "basic-4"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0040",
    "slug": "golden-mathematics-textbook-for-basic-5",
    "name": "Golden Mathematics  Textbook for Basic 5",
    "price": 70,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "basic-5"
    ],
    "image": {
      "src": "/products/golden-mathematics-texbook-basic-5.webp",
      "alt": "Golden Mathematics  Textbook for Basic 5 - Basic 5 | DeeGlobalGH",
      "title": "Golden Mathematics  Textbook for Basic 5",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden Mathematics  Textbook for Basic 5 in Ghana",
      "metaTitle": "Golden Mathematics  Textbook for Basic 5 | DeeglobalGh",
      "metaDescription": "Buy Golden Mathematics  Textbook for Basic 5 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden Mathematics  Textbook for Basic 5 | DeeglobalGh",
      "socialDescription": "Order Golden Mathematics  Textbook for Basic 5 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden mathematics textbook for basic 5 golden textbooks basic 5",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "basic-5"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0041",
    "slug": "golden-mathematics-textbook-for-basic-6",
    "name": "Golden Mathematics  Textbook for Basic 6",
    "price": 70,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "basic-6"
    ],
    "image": {
      "src": "/products/golden-mathematics-texbook-basic-6.webp",
      "alt": "Golden Mathematics  Textbook for Basic 6 - Basic 6 | DeeGlobalGH",
      "title": "Golden Mathematics  Textbook for Basic 6",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden Mathematics  Textbook for Basic 6 in Ghana",
      "metaTitle": "Golden Mathematics  Textbook for Basic 6 | DeeglobalGh",
      "metaDescription": "Buy Golden Mathematics  Textbook for Basic 6 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden Mathematics  Textbook for Basic 6 | DeeglobalGh",
      "socialDescription": "Order Golden Mathematics  Textbook for Basic 6 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden mathematics textbook for basic 6 golden textbooks basic 6",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "basic-6"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0042",
    "slug": "golden-mathematics-textbook-for-jhs",
    "name": "Golden Mathematics  Textbook for JHS",
    "price": 160,
    "categorySlug": "jhs-combined-edition-textbooks",
    "levelSlugs": [
      "jhs-1",
      "jhs-2",
      "jhs-3"
    ],
    "image": {
      "src": "/products/golden-mathematics-texbook-jhs.webp",
      "alt": "Golden Mathematics  Textbook for JHS - JHS 1 | DeeGlobalGH",
      "title": "Golden Mathematics  Textbook for JHS",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden Mathematics  Textbook for JHS in Ghana",
      "metaTitle": "Golden Mathematics  Textbook for JHS | DeeglobalGh",
      "metaDescription": "Buy Golden Mathematics  Textbook for JHS in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden Mathematics  Textbook for JHS | DeeglobalGh",
      "socialDescription": "Order Golden Mathematics  Textbook for JHS online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden mathematics textbook for jhs golden jhs combined edition textbooks jhs 1 jhs 2 jhs 3",
      "fullDescription": "",
      "tags": [
        "jhs-combined-edition-textbooks",
        "golden",
        "jhs-1",
        "jhs-2",
        "jhs-3"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0043",
    "slug": "golden-mathematics-textbook-for-kg-1",
    "name": "Golden Mathematics Textbook for KG 1",
    "price": 65,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "pre-school"
    ],
    "image": {
      "src": "/products/golden-mathematics-texbook-kg-1.webp",
      "alt": "Golden Mathematics Textbook for KG 1 - Pre-School | DeeGlobalGH",
      "title": "Golden Mathematics Textbook for KG 1",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden Mathematics Textbook for KG 1 in Ghana",
      "metaTitle": "Golden Mathematics Textbook for KG 1 | DeeglobalGh",
      "metaDescription": "Buy Golden Mathematics Textbook for KG 1 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden Mathematics Textbook for KG 1 | DeeglobalGh",
      "socialDescription": "Order Golden Mathematics Textbook for KG 1 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden mathematics textbook for kg 1 golden textbooks pre-school",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "pre-school"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0044",
    "slug": "golden-mathematics-textbook-for-kg-2",
    "name": "Golden Mathematics Textbook for KG 2",
    "price": 65,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "pre-school"
    ],
    "image": {
      "src": "/products/golden-mathematics-texbook-kg-2.webp",
      "alt": "Golden Mathematics Textbook for KG 2 - Pre-School | DeeGlobalGH",
      "title": "Golden Mathematics Textbook for KG 2",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden Mathematics Textbook for KG 2 in Ghana",
      "metaTitle": "Golden Mathematics Textbook for KG 2 | DeeglobalGh",
      "metaDescription": "Buy Golden Mathematics Textbook for KG 2 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden Mathematics Textbook for KG 2 | DeeglobalGh",
      "socialDescription": "Order Golden Mathematics Textbook for KG 2 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden mathematics textbook for kg 2 golden textbooks pre-school",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "pre-school"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0045",
    "slug": "golden-mathematics-textbook-for-nursery-1",
    "name": "Golden Mathematics Textbook for Nursery 1",
    "price": 50,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "pre-school"
    ],
    "image": {
      "src": "/products/golden-mathematics-texbook-nursery-1.webp",
      "alt": "Golden Mathematics Textbook for Nursery 1 - Pre-School | DeeGlobalGH",
      "title": "Golden Mathematics Textbook for Nursery 1",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden Mathematics Textbook for Nursery 1 in Ghana",
      "metaTitle": "Golden Mathematics Textbook for Nursery 1 | DeeglobalGh",
      "metaDescription": "Buy Golden Mathematics Textbook for Nursery 1 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden Mathematics Textbook for Nursery 1 | DeeglobalGh",
      "socialDescription": "Order Golden Mathematics Textbook for Nursery 1 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden mathematics textbook for nursery 1 golden textbooks pre-school",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "pre-school"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0046",
    "slug": "golden-mathematics-textbook-for-nursery-2",
    "name": "Golden Mathematics Textbook for Nursery 2",
    "price": 50,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "pre-school"
    ],
    "image": {
      "src": "/products/golden-mathematics-texbook-nursery-2.webp",
      "alt": "Golden Mathematics Textbook for Nursery 2 - Pre-School | DeeGlobalGH",
      "title": "Golden Mathematics Textbook for Nursery 2",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden Mathematics Textbook for Nursery 2 in Ghana",
      "metaTitle": "Golden Mathematics Textbook for Nursery 2 | DeeglobalGh",
      "metaDescription": "Buy Golden Mathematics Textbook for Nursery 2 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden Mathematics Textbook for Nursery 2 | DeeglobalGh",
      "socialDescription": "Order Golden Mathematics Textbook for Nursery 2 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden mathematics textbook for nursery 2 golden textbooks pre-school",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "pre-school"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0047",
    "slug": "golden-owop-textbook-for-kg1",
    "name": "Golden OWOP Textbook for KG1",
    "price": 65,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "pre-school"
    ],
    "image": {
      "src": "/products/golden-owop-texbook-kg-1.webp",
      "alt": "Golden OWOP Textbook for KG1 - Pre-School | DeeGlobalGH",
      "title": "Golden OWOP Textbook for KG1",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden OWOP Textbook for KG1 in Ghana",
      "metaTitle": "Golden OWOP Textbook for KG1 | DeeglobalGh",
      "metaDescription": "Buy Golden OWOP Textbook for KG1 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden OWOP Textbook for KG1 | DeeglobalGh",
      "socialDescription": "Order Golden OWOP Textbook for KG1 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden owop textbook for kg1 golden textbooks pre-school",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "pre-school"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0048",
    "slug": "golden-owop-textbook-for-kg2",
    "name": "Golden OWOP Textbook for KG2",
    "price": 65,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "pre-school"
    ],
    "image": {
      "src": "/products/golden-owop-texbook-kg-2.webp",
      "alt": "Golden OWOP Textbook for KG2 - Pre-School | DeeGlobalGH",
      "title": "Golden OWOP Textbook for KG2",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden OWOP Textbook for KG2 in Ghana",
      "metaTitle": "Golden OWOP Textbook for KG2 | DeeglobalGh",
      "metaDescription": "Buy Golden OWOP Textbook for KG2 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden OWOP Textbook for KG2 | DeeglobalGh",
      "socialDescription": "Order Golden OWOP Textbook for KG2 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden owop textbook for kg2 golden textbooks pre-school",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "pre-school"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0049",
    "slug": "golden-rme-textbook-for-basic-1",
    "name": "Golden RME  Textbook for Basic 1",
    "price": 65,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "basic-1"
    ],
    "image": {
      "src": "/products/golden-rme-texbook-basic-1.webp",
      "alt": "Golden RME  Textbook for Basic 1 - Basic 1 | DeeGlobalGH",
      "title": "Golden RME  Textbook for Basic 1",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden RME  Textbook for Basic 1 in Ghana",
      "metaTitle": "Golden RME  Textbook for Basic 1 | DeeglobalGh",
      "metaDescription": "Buy Golden RME  Textbook for Basic 1 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden RME  Textbook for Basic 1 | DeeglobalGh",
      "socialDescription": "Order Golden RME  Textbook for Basic 1 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden rme textbook for basic 1 golden textbooks basic 1",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "basic-1"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0050",
    "slug": "golden-rme-textbook-for-basic-2",
    "name": "Golden RME  Textbook for Basic 2",
    "price": 65,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "basic-2"
    ],
    "image": {
      "src": "/products/golden-rme-texbook-basic-2.webp",
      "alt": "Golden RME  Textbook for Basic 2 - Basic 2 | DeeGlobalGH",
      "title": "Golden RME  Textbook for Basic 2",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden RME  Textbook for Basic 2 in Ghana",
      "metaTitle": "Golden RME  Textbook for Basic 2 | DeeglobalGh",
      "metaDescription": "Buy Golden RME  Textbook for Basic 2 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden RME  Textbook for Basic 2 | DeeglobalGh",
      "socialDescription": "Order Golden RME  Textbook for Basic 2 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden rme textbook for basic 2 golden textbooks basic 2",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "basic-2"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0051",
    "slug": "golden-rme-textbook-for-basic-3",
    "name": "Golden RME  Textbook for Basic 3",
    "price": 65,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "basic-3"
    ],
    "image": {
      "src": "/products/golden-rme-texbook-basic-3.webp",
      "alt": "Golden RME  Textbook for Basic 3 - Basic 3 | DeeGlobalGH",
      "title": "Golden RME  Textbook for Basic 3",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden RME  Textbook for Basic 3 in Ghana",
      "metaTitle": "Golden RME  Textbook for Basic 3 | DeeglobalGh",
      "metaDescription": "Buy Golden RME  Textbook for Basic 3 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden RME  Textbook for Basic 3 | DeeglobalGh",
      "socialDescription": "Order Golden RME  Textbook for Basic 3 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden rme textbook for basic 3 golden textbooks basic 3",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "basic-3"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0052",
    "slug": "golden-rme-textbook-for-basic-4",
    "name": "Golden RME  Textbook for Basic 4",
    "price": 65,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "basic-4"
    ],
    "image": {
      "src": "/products/golden-rme-texbook-basic-4.webp",
      "alt": "Golden RME  Textbook for Basic 4 - Basic 4 | DeeGlobalGH",
      "title": "Golden RME  Textbook for Basic 4",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden RME  Textbook for Basic 4 in Ghana",
      "metaTitle": "Golden RME  Textbook for Basic 4 | DeeglobalGh",
      "metaDescription": "Buy Golden RME  Textbook for Basic 4 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden RME  Textbook for Basic 4 | DeeglobalGh",
      "socialDescription": "Order Golden RME  Textbook for Basic 4 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden rme textbook for basic 4 golden textbooks basic 4",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "basic-4"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0053",
    "slug": "golden-rme-textbook-for-basic-5",
    "name": "Golden RME  Textbook for Basic 5",
    "price": 65,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "basic-5"
    ],
    "image": {
      "src": "/products/golden-rme-texbook-basic-5.webp",
      "alt": "Golden RME  Textbook for Basic 5 - Basic 5 | DeeGlobalGH",
      "title": "Golden RME  Textbook for Basic 5",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden RME  Textbook for Basic 5 in Ghana",
      "metaTitle": "Golden RME  Textbook for Basic 5 | DeeglobalGh",
      "metaDescription": "Buy Golden RME  Textbook for Basic 5 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden RME  Textbook for Basic 5 | DeeglobalGh",
      "socialDescription": "Order Golden RME  Textbook for Basic 5 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden rme textbook for basic 5 golden textbooks basic 5",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "basic-5"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0054",
    "slug": "golden-rme-textbook-for-basic-6",
    "name": "Golden RME  Textbook for Basic 6",
    "price": 65,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "basic-6"
    ],
    "image": {
      "src": "/products/golden-rme-texbook-basic-6.webp",
      "alt": "Golden RME  Textbook for Basic 6 - Basic 6 | DeeGlobalGH",
      "title": "Golden RME  Textbook for Basic 6",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden RME  Textbook for Basic 6 in Ghana",
      "metaTitle": "Golden RME  Textbook for Basic 6 | DeeglobalGh",
      "metaDescription": "Buy Golden RME  Textbook for Basic 6 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden RME  Textbook for Basic 6 | DeeglobalGh",
      "socialDescription": "Order Golden RME  Textbook for Basic 6 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden rme textbook for basic 6 golden textbooks basic 6",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "basic-6"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0055",
    "slug": "golden-science-textbook-for-basic-1",
    "name": "Golden Science  Textbook for Basic 1",
    "price": 65,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "basic-1"
    ],
    "image": {
      "src": "/products/golden-science-texbook-basic-1.webp",
      "alt": "Golden Science  Textbook for Basic 1 - Basic 1 | DeeGlobalGH",
      "title": "Golden Science  Textbook for Basic 1",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden Science  Textbook for Basic 1 in Ghana",
      "metaTitle": "Golden Science  Textbook for Basic 1 | DeeglobalGh",
      "metaDescription": "Buy Golden Science  Textbook for Basic 1 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden Science  Textbook for Basic 1 | DeeglobalGh",
      "socialDescription": "Order Golden Science  Textbook for Basic 1 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden science textbook for basic 1 golden textbooks basic 1",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "basic-1"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0056",
    "slug": "golden-science-textbook-for-basic-2",
    "name": "Golden Science  Textbook for Basic 2",
    "price": 65,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "basic-2"
    ],
    "image": {
      "src": "/products/golden-science-texbook-basic-2.webp",
      "alt": "Golden Science  Textbook for Basic 2 - Basic 2 | DeeGlobalGH",
      "title": "Golden Science  Textbook for Basic 2",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden Science  Textbook for Basic 2 in Ghana",
      "metaTitle": "Golden Science  Textbook for Basic 2 | DeeglobalGh",
      "metaDescription": "Buy Golden Science  Textbook for Basic 2 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden Science  Textbook for Basic 2 | DeeglobalGh",
      "socialDescription": "Order Golden Science  Textbook for Basic 2 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden science textbook for basic 2 golden textbooks basic 2",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "basic-2"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0057",
    "slug": "golden-science-textbook-for-basic-3",
    "name": "Golden Science  Textbook for Basic 3",
    "price": 65,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "basic-3"
    ],
    "image": {
      "src": "/products/golden-science-texbook-basic-3.webp",
      "alt": "Golden Science  Textbook for Basic 3 - Basic 3 | DeeGlobalGH",
      "title": "Golden Science  Textbook for Basic 3",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden Science  Textbook for Basic 3 in Ghana",
      "metaTitle": "Golden Science  Textbook for Basic 3 | DeeglobalGh",
      "metaDescription": "Buy Golden Science  Textbook for Basic 3 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden Science  Textbook for Basic 3 | DeeglobalGh",
      "socialDescription": "Order Golden Science  Textbook for Basic 3 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden science textbook for basic 3 golden textbooks basic 3",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "basic-3"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0058",
    "slug": "golden-science-textbook-for-basic-4",
    "name": "Golden Science  Textbook for Basic 4",
    "price": 65,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "basic-4"
    ],
    "image": {
      "src": "/products/golden-science-texbook-basic-4.webp",
      "alt": "Golden Science  Textbook for Basic 4 - Basic 4 | DeeGlobalGH",
      "title": "Golden Science  Textbook for Basic 4",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden Science  Textbook for Basic 4 in Ghana",
      "metaTitle": "Golden Science  Textbook for Basic 4 | DeeglobalGh",
      "metaDescription": "Buy Golden Science  Textbook for Basic 4 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden Science  Textbook for Basic 4 | DeeglobalGh",
      "socialDescription": "Order Golden Science  Textbook for Basic 4 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden science textbook for basic 4 golden textbooks basic 4",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "basic-4"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0059",
    "slug": "golden-science-textbook-for-basic-5",
    "name": "Golden Science  Textbook for Basic 5",
    "price": 65,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "basic-5"
    ],
    "image": {
      "src": "/products/golden-science-texbook-basic-5.webp",
      "alt": "Golden Science  Textbook for Basic 5 - Basic 5 | DeeGlobalGH",
      "title": "Golden Science  Textbook for Basic 5",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden Science  Textbook for Basic 5 in Ghana",
      "metaTitle": "Golden Science  Textbook for Basic 5 | DeeglobalGh",
      "metaDescription": "Buy Golden Science  Textbook for Basic 5 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden Science  Textbook for Basic 5 | DeeglobalGh",
      "socialDescription": "Order Golden Science  Textbook for Basic 5 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden science textbook for basic 5 golden textbooks basic 5",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "basic-5"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0060",
    "slug": "golden-science-textbook-for-basic-6",
    "name": "Golden Science  Textbook for Basic 6",
    "price": 65,
    "categorySlug": "textbooks",
    "levelSlugs": [
      "basic-6"
    ],
    "image": {
      "src": "/products/golden-science-texbook-basic-6.webp",
      "alt": "Golden Science  Textbook for Basic 6 - Basic 6 | DeeGlobalGH",
      "title": "Golden Science  Textbook for Basic 6",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden Science  Textbook for Basic 6 in Ghana",
      "metaTitle": "Golden Science  Textbook for Basic 6 | DeeglobalGh",
      "metaDescription": "Buy Golden Science  Textbook for Basic 6 in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden Science  Textbook for Basic 6 | DeeglobalGh",
      "socialDescription": "Order Golden Science  Textbook for Basic 6 online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden science textbook for basic 6 golden textbooks basic 6",
      "fullDescription": "",
      "tags": [
        "textbooks",
        "golden",
        "basic-6"
      ],
      "brand": "Golden"
    }
  },
  {
    "id": "DG0061",
    "slug": "golden-science-textbook-for-jhs",
    "name": "Golden Science  Textbook for JHS",
    "price": 160,
    "categorySlug": "jhs-combined-edition-textbooks",
    "levelSlugs": [
      "jhs-1",
      "jhs-2",
      "jhs-3"
    ],
    "image": {
      "src": "/products/golden-science-texbook-jhs-1-3.webp",
      "alt": "Golden Science  Textbook for JHS - JHS 1 | DeeGlobalGH",
      "title": "Golden Science  Textbook for JHS",
      "caption": "",
      "description": ""
    },
    "seo": {
      "focusKeyphrase": "Golden Science  Textbook for JHS in Ghana",
      "metaTitle": "Golden Science  Textbook for JHS | DeeglobalGh",
      "metaDescription": "Buy Golden Science  Textbook for JHS in Ghana from DeeglobalGh. Available for delivery.",
      "socialTitle": "Golden Science  Textbook for JHS | DeeglobalGh",
      "socialDescription": "Order Golden Science  Textbook for JHS online for delivery in Kasoa and nearby areas.",
      "shortSummary": "golden science textbook for jhs golden jhs combined edition textbooks jhs 1 jhs 2 jhs 3",
      "fullDescription": "",
      "tags": [
        "jhs-combined-edition-textbooks",
        "golden",
        "jhs-1",
        "jhs-2",
        "jhs-3"
      ],
      "brand": "Golden"
      
    }
  }
  ,
  {
    id: "DG-PQ-JHS-0002",
    name: "A+ Series Mathematics Past Questions for JHS",
    slug: "a-plus-series-mathematics-past-questions-for-jhs",
    price: 65,    stockQty: 20,
    lowStockThreshold: 3,

    image: {
      src: "/products/A+-series-mathematics-past-questions-for-jhs.webp",
      alt: "A+ Series Mathematics Past Questions for JHS students in Ghana",
      title: "A+ Series Mathematics Past Questions for JHS",
      caption: "JHS Mathematics Past Questions for BECE preparation.",
      description:
        "Cover image of A+ Series Mathematics Past Questions for JHS learners.",
    },
    categorySlug: "jhs-past-questions",
    levelSlugs: ["jhs-1", "jhs-2", "jhs-3"],
    seo: {
      focusKeyphrase: "JHS maths past questions",
      metaTitle: "A+ Series Mathematics Past Questions for JHS | DeeglobalGh",
      metaDescription:
        "Buy A+ Series Mathematics Past Questions for JHS in Ghana. Ideal for BECE revision and practice. Order from DeeglobalGh for fast delivery in Kasoa and beyond.",
      socialTitle: "A+ Series Mathematics Past Questions for JHS",
      socialDescription:
        "Get JHS Maths Past Questions for BECE preparation. Order now from DeeglobalGh with delivery.",
      shortSummary:
        "A+ Series Mathematics Past Questions for JHS learners preparing for BECE.",
      fullDescription:
        "A+ Series Mathematics Past Questions for JHS supports learners with BECE-focused practice. It includes past questions to help students revise key topics, build speed, and improve confidence for examinations.",
      brand: "A+ Series",
      tags: [
        "JHS Past Questions",
        "BECE Past Questions",
        "Mathematics Past Questions",
        "Exam Preparation",
        "Past Questions Ghana",
      ],
    },
  },
  {
    id: "DG-PQ-JHS-0003",
    name: "A+ English Past Questions for JHS",
    slug: "a-plus-english-past-questions-for-jhs",
    price: 65,    stockQty: 20,
    lowStockThreshold: 3,

    image: {
      src: "/products/a+-english-past-questions-for-jhs.webp",
      alt: "A+ English Past Questions for JHS students in Ghana",
      title: "A+ English Past Questions for JHS",
      caption: "JHS English Past Questions for BECE preparation.",
      description:
        "Cover image of A+ English Past Questions for JHS learners.",
    },
    categorySlug: "jhs-past-questions",
    levelSlugs: ["jhs-1", "jhs-2", "jhs-3"],
    seo: {
      focusKeyphrase: "JHS English past questions",
      metaTitle: "A+ English Past Questions for JHS | DeeglobalGh",
      metaDescription:
        "Buy A+ English Past Questions for JHS in Ghana. Great for BECE English revision. Order from DeeglobalGh for fast delivery in Kasoa and beyond.",
      socialTitle: "A+ English Past Questions for JHS",
      socialDescription:
        "Get JHS English Past Questions for BECE preparation. Delivery available from DeeglobalGh.",
      shortSummary:
        "A+ English Past Questions for JHS learners for BECE revision and exam practice.",
      fullDescription:
        "A+ English Past Questions for JHS helps learners prepare for BECE with structured practice questions. It supports comprehension, grammar, and exam technique with repeated practice.",
      brand: "A+ Series",
      tags: [
        "JHS Past Questions",
        "BECE Past Questions",
        "English Past Questions",
        "Exam Preparation",
        "Past Questions Ghana",
      ],
    },
  },
  {
    id: "DG-PQ-JHS-0004",
    name: "A+ Series Science Past Questions for JHS",
    slug: "a-plus-series-science-past-questions-for-jhs",
    price: 65,    stockQty: 20,
    lowStockThreshold: 3,

    image: {
      src: "/products/a+-series-science-past-questions-for-jhs.webp",
      alt: "A+ Series Science Past Questions for JHS students in Ghana",
      title: "A+ Series Science Past Questions for JHS",
      caption: "JHS Science Past Questions for BECE preparation.",
      description:
        "Cover image of A+ Series Science Past Questions for JHS learners.",
    },
    categorySlug: "jhs-past-questions",
    levelSlugs: ["jhs-1", "jhs-2", "jhs-3"],
    seo: {
      focusKeyphrase: "JHS science past questions",
      metaTitle: "A+ Series Science Past Questions for JHS | DeeglobalGh",
      metaDescription:
        "Buy A+ Series Science Past Questions for JHS in Ghana. Ideal for BECE Integrated Science revision. Order from DeeglobalGh for fast delivery in Kasoa and beyond.",
      socialTitle: "A+ Series Science Past Questions for JHS",
      socialDescription:
        "Get JHS Science Past Questions for BECE preparation. Delivery available from DeeglobalGh.",
      shortSummary:
        "A+ Series Science Past Questions for JHS learners preparing for BECE.",
      fullDescription:
        "A+ Series Science Past Questions for JHS supports learners preparing for BECE Integrated Science. It provides practice questions to strengthen understanding and improve exam performance.",
      brand: "A+ Series",
      tags: [
        "JHS Past Questions",
        "BECE Past Questions",
        "Science Past Questions",
        "Exam Preparation",
        "Past Questions Ghana",
      ],
    },
  },
  {
    id: "DG-PQ-SHS-0002",
    name: "A+ Core Mathematics Past Question for SHS",
    slug: "a-plus-core-mathematics-past-question-for-shs",
    price: 160,    stockQty: 20,
    lowStockThreshold: 3,

    image: {
      src: "/products/a+-core-mathematics-past-question-for-shs.webp",
      alt: "A+ Core Mathematics Past Question for SHS students in Ghana",
      title: "A+ Core Mathematics Past Question for SHS",
      caption: "SHS Core Maths Past Questions for WASSCE preparation.",
      description:
        "Cover image of A+ Core Mathematics Past Question for SHS learners.",
    },
    categorySlug: "shs-past-questions",
    levelSlugs: ["shs-1", "shs-2", "shs-3"],
    seo: {
      focusKeyphrase: "SHS core maths past questions",
      metaTitle: "A+ Core Mathematics Past Question for SHS | DeeglobalGh",
      metaDescription:
        "Buy A+ Core Mathematics Past Questions for SHS in Ghana. Perfect for WASSCE Core Maths preparation. Order from DeeglobalGh for fast delivery in Kasoa and beyond.",
      socialTitle: "A+ Core Mathematics Past Questions for SHS",
      socialDescription:
        "Get SHS Core Maths Past Questions for WASSCE preparation. Delivery available from DeeglobalGh.",
      shortSummary:
        "A+ Core Mathematics Past Questions for SHS learners for WASSCE revision and practice.",
      fullDescription:
        "A+ Core Mathematics Past Question for SHS supports SHS learners preparing for WASSCE Core Mathematics. It provides past questions to help students practise consistently, improve speed, and strengthen exam confidence.",
      brand: "A+ Series",
      tags: [
        "SHS Past Questions",
        "WASSCE Past Questions",
        "Core Mathematics Past Questions",
        "Exam Preparation",
        "Past Questions Ghana",
      ],
    },
  },
  {
    id: "DG-PQ-SHS-0003",
    name: "A+ Series English Questions and Answers (SHS WASSCE Edition)",
    slug: "a-plus-series-english-questions-and-answers-shs-wassce-edition",
    price: 160,    stockQty: 20,
    lowStockThreshold: 3,

    image: {
      src: "/products/a+-series-english-questions-and-answers-shs-wassce-edition.webp",
      alt: "A+ Series English Questions and Answers for SHS WASSCE in Ghana",
      title: "A+ Series English Questions and Answers (SHS WASSCE Edition)",
      caption: "SHS English Past Questions for WASSCE preparation.",
      description:
        "Cover image of A+ Series English Questions and Answers for SHS WASSCE edition.",
    },
    categorySlug: "shs-past-questions",
    levelSlugs: ["shs-1", "shs-2", "shs-3"],
    seo: {
      focusKeyphrase: "WASSCE English past questions",
      metaTitle:
        "A+ Series English Questions and Answers (WASSCE) | DeeglobalGh",
      metaDescription:
        "Buy A+ Series English Questions and Answers (WASSCE Edition) in Ghana. Ideal for SHS English revision and WASSCE preparation. Order from DeeglobalGh for delivery.",
      socialTitle: "A+ Series English Questions and Answers (WASSCE Edition)",
      socialDescription:
        "Get SHS English WASSCE Past Questions and Answers from DeeglobalGh. Delivery available in Kasoa and beyond.",
      shortSummary:
        "A+ Series English Questions and Answers for SHS learners preparing for WASSCE.",
      fullDescription:
        "A+ Series English Questions and Answers (SHS WASSCE Edition) supports SHS learners preparing for WASSCE English Language. It provides exam-style questions and answers to build comprehension skills, grammar accuracy, and exam technique.",
      brand: "A+ Series",
      tags: [
        "SHS Past Questions",
        "WASSCE Past Questions",
        "English Past Questions",
        "WASSCE English",
        "Exam Preparation",
      ],
    },
  },
  {
    id: "DG-PQ-SHS-0004",
    name: "A+ Integrated Science Past Question for SHS",
    slug: "a-plus-integrated-science-past-question-for-shs",
    price: 160,    stockQty: 20,
    lowStockThreshold: 3,

    image: {
      src: "/products/a+-integrated-science-past-question-for-shs.webp",
      alt: "A+ Integrated Science Past Question for SHS students in Ghana",
      title: "A+ Integrated Science Past Question for SHS",
      caption: "SHS Integrated Science Past Questions for WASSCE preparation.",
      description:
        "Cover image of A+ Integrated Science Past Question for SHS learners.",
    },
    categorySlug: "shs-past-questions",
    levelSlugs: ["shs-1", "shs-2", "shs-3"],
    seo: {
      focusKeyphrase: "WASSCE Integrated Science past questions",
      metaTitle: "A+ Integrated Science Past Question for SHS | DeeglobalGh",
      metaDescription:
        "Buy A+ Integrated Science Past Questions for SHS in Ghana. Perfect for WASSCE Integrated Science revision. Order from DeeglobalGh for fast delivery in Kasoa and beyond.",
      socialTitle: "A+ Integrated Science Past Questions for SHS",
      socialDescription:
        "Get SHS Integrated Science Past Questions for WASSCE preparation. Delivery available from DeeglobalGh.",
      shortSummary:
        "A+ Integrated Science Past Questions for SHS learners preparing for WASSCE.",
      fullDescription:
        "A+ Integrated Science Past Question for SHS supports WASSCE preparation with focused practice questions. It helps learners revise key topics and improve performance through regular exam-style practice.",
      brand: "A+ Series",
      tags: [
        "SHS Past Questions",
        "WASSCE Past Questions",
        "Integrated Science Past Questions",
        "Exam Preparation",
        "Past Questions Ghana",
      ],
    },
  }
    ,
  {
    id: "DG-PQ-SHS-0005",
    name: "A+ Series Elective Mathematics Questions and Answers (SHS WASSCE Edition)",
    slug: "a-plus-series-elective-mathematics-questions-and-answers-shs-wassce-edition",
    price: 160,    stockQty: 20,
    lowStockThreshold: 3,

    image: {
      src: "/products/a+-series-elective-mathematics-questions-and-answers-shs-wassce-edition.webp",
      alt: "A+ Series Elective Mathematics Questions and Answers for SHS WASSCE in Ghana",
      title:
        "A+ Series Elective Mathematics Questions and Answers (SHS WASSCE Edition)",
      caption: "Elective Mathematics questions and answers for WASSCE revision.",
      description:
        "Cover image of A+ Series Elective Mathematics Questions and Answers (SHS WASSCE Edition).",
    },
    categorySlug: "shs-past-questions",
    levelSlugs: ["shs-1", "shs-2", "shs-3"],
    seo: {
      focusKeyphrase: "WASSCE elective maths past questions",
      metaTitle:
        "A+ Series Elective Mathematics Q&A (WASSCE) | DeeglobalGh",
      metaDescription:
        "Buy A+ Series Elective Mathematics Questions and Answers (WASSCE Edition) in Ghana. Perfect for Elective Maths revision and WASSCE preparation. Order from DeeglobalGh for delivery.",
      socialTitle:
        "A+ Series Elective Mathematics Questions and Answers (WASSCE Edition)",
      socialDescription:
        "Get Elective Mathematics WASSCE Questions and Answers from DeeglobalGh. Delivery available in Kasoa and beyond.",
      shortSummary:
        "Elective Mathematics questions and answers for SHS learners preparing for WASSCE.",
      fullDescription:
        "A+ Series Elective Mathematics Questions and Answers (SHS WASSCE Edition) supports learners preparing for WASSCE Elective Mathematics. It provides structured practice questions with answers to improve speed, accuracy, and exam confidence.",
      brand: "A+ Series",
      tags: [
        "SHS Past Questions",
        "WASSCE Past Questions",
        "Elective Mathematics",
        "Elective Maths Past Questions",
        "Questions and Answers",
        "Exam Preparation",
      ],
    },
  }


];

