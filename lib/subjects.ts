export type SubjectLevel =
  | "creche"
  | "nursery-1"
  | "nursery-2"
  | "kg-1"
  | "kg-2"
  | "pre-school"
  | "preschool"
  | "basic-1"
  | "basic-2"
  | "basic-3"
  | "basic-4"
  | "basic-5"
  | "basic-6"
  | "jhs-1"
  | "jhs-2"
  | "jhs-3"
  | "jhs"
  | "shs"
  | "shs-1"
  | "shs-2"
  | "shs-3";

export type PublicSubject = {
  slug: string;
  name: string;
  family: string;
  aliases: string[];
  levels: SubjectLevel[];
  title: string;
  description: string;
  heading: string;
  intro: string;
  standalonePage: boolean;
  relatedSubjects?: string[];
};

const EARLY_YEARS_LEVELS: SubjectLevel[] = [
  "creche",
  "nursery-1",
  "nursery-2",
  "kg-1",
  "kg-2",
];

const PRIMARY_LEVELS: SubjectLevel[] = [
  "basic-1",
  "basic-2",
  "basic-3",
  "basic-4",
  "basic-5",
  "basic-6",
];

const JHS_LEVELS: SubjectLevel[] = ["jhs-1", "jhs-2", "jhs-3"];

const SHS_LEVELS: SubjectLevel[] = ["shs-1", "shs-2", "shs-3"];

export const PUBLIC_SUBJECTS: PublicSubject[] = [
  {
    slug: "literacy",
    name: "Literacy",
    family: "Literacy / English",
    aliases: [
      "Early Literacy",
      "Literacy",
      "Language and Literacy",
      "Language & Literacy",
      "Language",
    ],
    levels: EARLY_YEARS_LEVELS,
    title: "Literacy Books for Early Learners in Ghana | DeeGlobalGH",
    description:
      "Browse literacy, language and early reading books for Creche, Nursery and KG learners from DeeGlobalGH in Kasoa.",
    heading: "Literacy Books",
    intro:
      "Explore early literacy, language, phonics, reading and related learning materials for young learners.",
    standalonePage: false,
    relatedSubjects: ["english"],
  },
  {
    slug: "numeracy",
    name: "Numeracy",
    family: "Numeracy / Mathematics",
    aliases: ["Early Numeracy", "Numeracy", "Number Work", "Number Activities"],
    levels: EARLY_YEARS_LEVELS,
    title: "Numeracy Books for Early Learners in Ghana | DeeGlobalGH",
    description:
      "Browse numeracy and early number-work books for Creche, Nursery and KG learners from DeeGlobalGH in Kasoa.",
    heading: "Numeracy Books",
    intro:
      "Explore early numeracy, counting, number work and related mathematics learning materials for young learners.",
    standalonePage: false,
    relatedSubjects: ["mathematics"],
  },
  {
    slug: "english",
    name: "English",
    family: "Literacy / English",
    aliases: ["English", "English Language"],
    levels: [...EARLY_YEARS_LEVELS, ...PRIMARY_LEVELS, ...JHS_LEVELS, ...SHS_LEVELS],
    title: "English Textbooks in Ghana | DeeGlobalGH",
    description:
      "Shop English textbooks and learning materials for Ghanaian school learners. Browse available English books from DeeGlobalGH in Kasoa.",
    heading: "English Textbooks",
    intro:
      "Browse available English textbooks and learning materials across school levels.",
    standalonePage: true,
    relatedSubjects: ["literacy", "literature"],
  },
  {
    slug: "mathematics",
    name: "Mathematics",
    family: "Numeracy / Mathematics",
    aliases: ["Mathematics", "Maths", "Core Mathematics", "General Mathematics"],
    levels: [...PRIMARY_LEVELS, ...JHS_LEVELS, ...SHS_LEVELS],
    title: "Mathematics Textbooks in Ghana | DeeGlobalGH",
    description:
      "Shop Mathematics textbooks and learning materials for Ghanaian school learners. Browse available Mathematics books from DeeGlobalGH in Kasoa.",
    heading: "Mathematics Textbooks",
    intro:
      "Browse available Mathematics textbooks and learning materials across Primary, JHS and SHS levels.",
    standalonePage: true,
    relatedSubjects: ["numeracy", "additional-mathematics"],
  },
  {
    slug: "additional-mathematics",
    name: "Additional Mathematics",
    family: "Numeracy / Mathematics",
    aliases: [
      "Additional Mathematics",
      "Additional Maths",
      "Elective Mathematics",
      "Elective Maths",
      "Further Mathematics",
      "Further Maths",
    ],
    levels: SHS_LEVELS,
    title: "Additional Mathematics Textbooks in Ghana | DeeGlobalGH",
    description:
      "Browse available Additional Mathematics, Elective Mathematics and Further Mathematics books for SHS learners from DeeGlobalGH in Kasoa.",
    heading: "Additional Mathematics Textbooks",
    intro:
      "Explore available SHS Additional Mathematics books, including titles described as Elective Mathematics or Further Mathematics.",
    standalonePage: false,
    relatedSubjects: ["mathematics"],
  },
  {
    slug: "science",
    name: "Science",
    family: "Science",
    aliases: ["Science"],
    levels: [...PRIMARY_LEVELS, ...JHS_LEVELS, ...SHS_LEVELS],
    title: "Science Textbooks in Ghana | DeeGlobalGH",
    description:
      "Shop Science textbooks and learning materials for Ghanaian school learners. Browse available Science books from DeeGlobalGH in Kasoa.",
    heading: "Science Textbooks",
    intro:
      "Browse available Science textbooks and learning materials across Primary, JHS and SHS levels.",
    standalonePage: true,
    relatedSubjects: [
      "general-science",
      "integrated-science",
      "biology",
      "chemistry",
      "physics",
    ],
  },
  {
    slug: "general-science",
    name: "General Science",
    family: "Science",
    aliases: ["General Science"],
    levels: SHS_LEVELS,
    title: "General Science Textbooks in Ghana | DeeGlobalGH",
    description:
      "Browse available General Science books and learning materials for SHS learners from DeeGlobalGH in Kasoa.",
    heading: "General Science Textbooks",
    intro:
      "Explore available General Science textbooks and related learning materials for SHS learners.",
    standalonePage: false,
    relatedSubjects: ["science", "integrated-science", "biology", "chemistry", "physics"],
  },
  {
    slug: "integrated-science",
    name: "Integrated Science",
    family: "Science",
    aliases: ["Integrated Science"],
    levels: [...JHS_LEVELS, ...SHS_LEVELS],
    title: "Integrated Science Books in Ghana | DeeGlobalGH",
    description:
      "Browse available books described as Integrated Science for Ghanaian school learners from DeeGlobalGH in Kasoa.",
    heading: "Integrated Science Books",
    intro:
      "Explore available learning materials described as Integrated Science. Subject naming may vary by curriculum period and school level.",
    standalonePage: false,
    relatedSubjects: ["science", "general-science"],
  },
  {
    slug: "biology",
    name: "Biology",
    family: "Science",
    aliases: ["Biology"],
    levels: SHS_LEVELS,
    title: "Biology Textbooks in Ghana | DeeGlobalGH",
    description:
      "Browse available Biology textbooks and learning materials for SHS learners from DeeGlobalGH in Kasoa.",
    heading: "Biology Textbooks",
    intro:
      "Explore available Biology textbooks and related learning materials for SHS learners.",
    standalonePage: false,
    relatedSubjects: ["science"],
  },
  {
    slug: "chemistry",
    name: "Chemistry",
    family: "Science",
    aliases: ["Chemistry"],
    levels: SHS_LEVELS,
    title: "Chemistry Textbooks in Ghana | DeeGlobalGH",
    description:
      "Browse available Chemistry textbooks and learning materials for SHS learners from DeeGlobalGH in Kasoa.",
    heading: "Chemistry Textbooks",
    intro:
      "Explore available Chemistry textbooks and related learning materials for SHS learners.",
    standalonePage: false,
    relatedSubjects: ["science"],
  },
  {
    slug: "physics",
    name: "Physics",
    family: "Science",
    aliases: ["Physics"],
    levels: SHS_LEVELS,
    title: "Physics Textbooks in Ghana | DeeGlobalGH",
    description:
      "Browse available Physics textbooks and learning materials for SHS learners from DeeGlobalGH in Kasoa.",
    heading: "Physics Textbooks",
    intro:
      "Explore available Physics textbooks and related learning materials for SHS learners.",
    standalonePage: false,
    relatedSubjects: ["science"],
  },
  {
    slug: "computing",
    name: "Computing / ICT",
    family: "Computing",
    aliases: ["Computing", "ICT", "Information and Communication Technology"],
    levels: [...PRIMARY_LEVELS, ...JHS_LEVELS, ...SHS_LEVELS],
    title: "Computing and ICT Textbooks in Ghana | DeeGlobalGH",
    description:
      "Shop Computing and ICT textbooks and learning materials for Ghanaian school learners from DeeGlobalGH in Kasoa.",
    heading: "Computing and ICT Textbooks",
    intro:
      "Browse available Computing and ICT textbooks and learning materials across school levels.",
    standalonePage: true,
    relatedSubjects: ["computer-science"],
  },
  {
    slug: "computer-science",
    name: "Computer Science",
    family: "Computing",
    aliases: ["Computer Science"],
    levels: SHS_LEVELS,
    title: "Computer Science Textbooks in Ghana | DeeGlobalGH",
    description:
      "Browse available Computer Science textbooks and learning materials for SHS learners from DeeGlobalGH in Kasoa.",
    heading: "Computer Science Textbooks",
    intro:
      "Explore available Computer Science textbooks and related learning materials for SHS learners.",
    standalonePage: false,
    relatedSubjects: ["computing"],
  },
  {
    slug: "rme",
    name: "Religious and Moral Education",
    family: "Religious and Moral Education",
    aliases: ["RME", "Religious and Moral Education", "Religious & Moral Education"],
    levels: [...PRIMARY_LEVELS, ...JHS_LEVELS, ...SHS_LEVELS],
    title: "RME Textbooks in Ghana | DeeGlobalGH",
    description:
      "Shop Religious and Moral Education textbooks and learning materials for Ghanaian school learners from DeeGlobalGH in Kasoa.",
    heading: "RME Textbooks",
    intro:
      "Browse available Religious and Moral Education textbooks and learning materials across school levels.",
    standalonePage: true,
  },
  {
    slug: "history",
    name: "History",
    family: "History",
    aliases: ["History", "History of Ghana"],
    levels: [...PRIMARY_LEVELS, ...SHS_LEVELS],
    title: "History Textbooks in Ghana | DeeGlobalGH",
    description:
      "Shop History textbooks and learning materials for Ghanaian school learners from DeeGlobalGH in Kasoa.",
    heading: "History Textbooks",
    intro:
      "Browse available History textbooks and related learning materials for Ghanaian school learners.",
    standalonePage: true,
  },
  {
    slug: "creative-arts",
    name: "Creative Arts",
    family: "Creative Arts",
    aliases: ["Creative Arts"],
    levels: [...EARLY_YEARS_LEVELS, ...PRIMARY_LEVELS],
    title: "Creative Arts Textbooks in Ghana | DeeGlobalGH",
    description:
      "Browse available Creative Arts textbooks and learning materials for Ghanaian school learners from DeeGlobalGH in Kasoa.",
    heading: "Creative Arts Textbooks",
    intro:
      "Explore available Creative Arts books and related learning materials for early years and Primary learners.",
    standalonePage: true,
    relatedSubjects: ["creative-arts-and-design"],
  },
  {
    slug: "creative-arts-and-design",
    name: "Creative Arts and Design",
    family: "Creative Arts",
    aliases: ["Creative Arts and Design", "Creative Arts & Design"],
    levels: JHS_LEVELS,
    title: "Creative Arts and Design Textbooks in Ghana | DeeGlobalGH",
    description:
      "Browse available Creative Arts and Design textbooks and learning materials for JHS learners from DeeGlobalGH in Kasoa.",
    heading: "Creative Arts and Design Textbooks",
    intro:
      "Explore available Creative Arts and Design textbooks and related learning materials for JHS learners.",
    standalonePage: false,
    relatedSubjects: ["creative-arts"],
  },
  {
    slug: "owop",
    name: "Our World and Our People",
    family: "Our World and Our People",
    aliases: ["OWOP", "Our World and Our People"],
    levels: [...EARLY_YEARS_LEVELS, ...PRIMARY_LEVELS],
    title: "OWOP Books in Ghana | DeeGlobalGH",
    description:
      "Browse available Our World and Our People books and learning materials from DeeGlobalGH in Kasoa.",
    heading: "Our World and Our People Books",
    intro:
      "Explore available OWOP learning materials. Curriculum status and use can vary by school level and curriculum period.",
    standalonePage: false,
  },
  {
    slug: "social-studies",
    name: "Social Studies",
    family: "Social Studies",
    aliases: ["Social Studies", "Social"],
    levels: [...JHS_LEVELS, ...SHS_LEVELS],
    title: "Social Studies Textbooks in Ghana | DeeGlobalGH",
    description:
      "Browse available Social Studies textbooks and learning materials for JHS and SHS learners from DeeGlobalGH in Kasoa.",
    heading: "Social Studies Textbooks",
    intro:
      "Explore available Social Studies textbooks and related learning materials.",
    standalonePage: false,
  },
  {
    slug: "career-technology",
    name: "Career Technology",
    family: "Career Technology",
    aliases: ["Career Technology"],
    levels: JHS_LEVELS,
    title: "Career Technology Textbooks in Ghana | DeeGlobalGH",
    description:
      "Browse available Career Technology textbooks and learning materials for JHS learners from DeeGlobalGH in Kasoa.",
    heading: "Career Technology Textbooks",
    intro:
      "Explore available Career Technology textbooks and related learning materials for JHS learners.",
    standalonePage: false,
  },
  {
    slug: "economics",
    name: "Economics",
    family: "Humanities / Business",
    aliases: ["Economics"],
    levels: SHS_LEVELS,
    title: "Economics Textbooks in Ghana | DeeGlobalGH",
    description:
      "Browse available Economics textbooks and learning materials for SHS learners from DeeGlobalGH in Kasoa.",
    heading: "Economics Textbooks",
    intro:
      "Explore available Economics textbooks and related learning materials for SHS learners.",
    standalonePage: false,
  },
  {
    slug: "literature",
    name: "Literature",
    family: "Literature / English",
    aliases: ["Literature", "Literature in English", "English Literature"],
    levels: [...JHS_LEVELS, ...SHS_LEVELS],
    title: "Literature Books for Ghanaian Schools | DeeGlobalGH",
    description:
      "Browse available literature texts and related learning materials for Ghanaian school learners from DeeGlobalGH in Kasoa.",
    heading: "Literature Books",
    intro:
      "Explore available prescribed literature texts, workbooks and related literature resources. Literature has different curriculum relationships at JHS and SHS levels.",
    standalonePage: false,
  },
];

export function getPublicSubject(slug: string): PublicSubject | undefined {
  return PUBLIC_SUBJECTS.find((subject) => subject.slug === slug);
}

export function getStandaloneSubjects(): PublicSubject[] {
  return PUBLIC_SUBJECTS.filter((subject) => subject.standalonePage);
}
