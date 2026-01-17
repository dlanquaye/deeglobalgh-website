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

  seo?: ProductSEO;
};

export const products: Product[] = [
  {
    id: "DG0001",
    name: "Wise Ant Chemistry – SHS 1–3 Combined Edition",
    slug: "wise-ant-chemistry-shs-1-3-combined-edition",
    price: 215,
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
    price: 215,
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
    price: 215,
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
    price: 215,
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
    price: 215,
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
    price: 215,
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
    price: 215,
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
    price: 205,
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
    price: 70,
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
    price: 70,
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
    price: 70,
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
    price: 70,
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
    price: 70,
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
    price: 70,
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
    price: 160,
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
  ],
},

  },
];
