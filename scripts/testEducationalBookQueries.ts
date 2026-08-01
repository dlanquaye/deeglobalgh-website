import {
  PrismaClient,
} from "@prisma/client";

import {
  educationalBookInclude,
} from "../lib/ekb/repositories/BookRepository";

import {
  EducationalBookSearchService,
} from "../lib/ekb/search/EducationalBookSearchService";

import {
  BookReadService,
} from "../lib/ekb/services/BookReadService";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log(
    "Testing Educational Book query and ranked-search layers...",
  );

  const bookReadService =
    new BookReadService(prisma);

  const searchService =
    new EducationalBookSearchService(
      bookReadService,
    );

  const totalBooks =
    await bookReadService.count();

  console.log("");
  console.log("Book count");
  console.log("----------");
  console.log(
    `Total Educational Books: ${totalBooks}`,
  );

  if (totalBooks === 0) {
    throw new Error(
      "No Educational Books were found. The query and search layers cannot be verified against an empty database.",
    );
  }

  const firstBook =
    await prisma.educationalBook.findFirst({
      include: educationalBookInclude,

      orderBy: {
        createdAt: "asc",
      },
    });

  if (!firstBook) {
    throw new Error(
      "The database reported Educational Books, but no reference record could be loaded.",
    );
  }

  console.log("");
  console.log("Reference book");
  console.log("--------------");
  console.log(
    `Book ID: ${firstBook.id}`,
  );
  console.log(
    `Entity ID: ${firstBook.entityId}`,
  );
  console.log(
    `Code: ${firstBook.entity.code}`,
  );
  console.log(
    `Canonical name: ${firstBook.entity.canonicalName}`,
  );
  console.log(
    `Authors: ${firstBook.authors.length}`,
  );
  console.log(
    `Subjects: ${firstBook.subjects.length}`,
  );
  console.log(
    `Levels: ${firstBook.levels.length}`,
  );
  console.log(
    `Languages: ${firstBook.languages.length}`,
  );
  console.log(
    `Resource types: ${firstBook.resourceTypes.length}`,
  );
  console.log(
    `Curriculum versions: ${firstBook.curriculumVersions.length}`,
  );

  await verifyReadLayer(
    bookReadService,
    firstBook,
  );

  await verifyExactCodeSearch(
    searchService,
    firstBook.id,
    firstBook.entity.code,
  );

  await verifyExactTitleSearch(
    searchService,
    firstBook.id,
    firstBook.entity.canonicalName,
  );

  await verifyCustomerWordingSearch(
    searchService,
    firstBook,
  );

  await verifyDeterministicOrdering(
    searchService,
    firstBook.entity.canonicalName,
  );

  await verifySearchProtection(
    searchService,
  );

  console.log("");
  console.log(
    "Educational Book query and ranked-search verification completed successfully.",
  );
}

async function verifyReadLayer(
  service: BookReadService,
  firstBook: Awaited<
    ReturnType<
      typeof prisma.educationalBook.findFirst<{
        include: typeof educationalBookInclude;

        orderBy: {
          createdAt: "asc";
        };
      }>
    >
  > & object,
): Promise<void> {
  const byId =
    await service.findById(
      firstBook.id,
    );

  assertRecord(
    byId?.id === firstBook.id,
    "findById",
  );

  const byEntityId =
    await service.findByEntityId(
      firstBook.entityId,
    );

  assertRecord(
    byEntityId?.id === firstBook.id,
    "findByEntityId",
  );

  const byCode =
    await service.findByCode(
      firstBook.entity.code,
    );

  assertRecord(
    byCode?.id === firstBook.id,
    "findByCode",
  );

  const byCanonicalName =
    await service.findByCanonicalName(
      firstBook.entity.canonicalName,
    );

  assertRecord(
    byCanonicalName?.id
      === firstBook.id,
    "findByCanonicalName",
  );

  const searchTerm =
    selectSearchTerm(
      firstBook.entity.canonicalName,
    );

  const searchResults =
    await service.search({
      query: searchTerm,

      limit: 20,
    });

  assertRecord(
    searchResults.some(
      (book) =>
        book.id === firstBook.id,
    ),
    "repository search",
  );

  if (firstBook.subjects[0]) {
    const booksBySubject =
      await service.findBySubjectId(
        firstBook.subjects[0]
          .subjectId,
        {
          limit: 20,
        },
      );

    assertRecord(
      booksBySubject.some(
        (book) =>
          book.id === firstBook.id,
      ),
      "findBySubjectId",
    );
  } else {
    printSkipped(
      "findBySubjectId",
      "reference book has no subject relationship",
    );
  }

  if (firstBook.levels[0]) {
    const booksByLevel =
      await service.findByLevelId(
        firstBook.levels[0]
          .levelId,
        {
          limit: 20,
        },
      );

    assertRecord(
      booksByLevel.some(
        (book) =>
          book.id === firstBook.id,
      ),
      "findByLevelId",
    );
  } else {
    printSkipped(
      "findByLevelId",
      "reference book has no level relationship",
    );
  }

  if (firstBook.authors[0]) {
    const booksByAuthor =
      await service.findByAuthorId(
        firstBook.authors[0]
          .authorId,
        {
          limit: 20,
        },
      );

    assertRecord(
      booksByAuthor.some(
        (book) =>
          book.id === firstBook.id,
      ),
      "findByAuthorId",
    );
  } else {
    printSkipped(
      "findByAuthorId",
      "reference book has no author relationship",
    );
  }

  if (firstBook.languages[0]) {
    const booksByLanguage =
      await service.findByLanguageId(
        firstBook.languages[0]
          .languageId,
        {
          limit: 20,
        },
      );

    assertRecord(
      booksByLanguage.some(
        (book) =>
          book.id === firstBook.id,
      ),
      "findByLanguageId",
    );
  } else {
    printSkipped(
      "findByLanguageId",
      "reference book has no language relationship",
    );
  }

  if (
    firstBook.resourceTypes[0]
  ) {
    const booksByResourceType =
      await service
        .findByResourceTypeId(
          firstBook.resourceTypes[0]
            .resourceTypeId,
          {
            limit: 20,
          },
        );

    assertRecord(
      booksByResourceType.some(
        (book) =>
          book.id === firstBook.id,
      ),
      "findByResourceTypeId",
    );
  } else {
    printSkipped(
      "findByResourceTypeId",
      "reference book has no resource-type relationship",
    );
  }

  if (
    firstBook.curriculumVersions[0]
  ) {
    const booksByCurriculum =
      await service
        .findByCurriculumVersionId(
          firstBook
            .curriculumVersions[0]
            .curriculumVersionId,
          {
            limit: 20,
          },
        );

    assertRecord(
      booksByCurriculum.some(
        (book) =>
          book.id === firstBook.id,
      ),
      "findByCurriculumVersionId",
    );
  } else {
    printSkipped(
      "findByCurriculumVersionId",
      "reference book has no curriculum relationship",
    );
  }

  const blankSearchResults =
    await service.search({
      query: "   ",
    });

  assertRecord(
    blankSearchResults.length === 0,
    "blank repository-search protection",
  );

  const missingIdResult =
    await service.findById("   ");

  assertRecord(
    missingIdResult === null,
    "blank ID protection",
  );
}

async function verifyExactCodeSearch(
  service:
    EducationalBookSearchService,
  expectedBookId: string,
  code: string,
): Promise<void> {
  const results =
    await service.search({
      query: code,

      limit: 10,
    });

  assertRecord(
    results.length > 0,
    "exact-code search returns results",
  );

  const exactMatch =
    results.find(
      (result) =>
        result.book.id
        === expectedBookId,
    );

  assertRecord(
    exactMatch !== undefined,
    "exact-code search finds reference book",
  );

  assertRecord(
    exactMatch?.matchMethod
      === "EXACT_CODE",
    "exact-code match method",
  );

  assertRecord(
    exactMatch?.score === 100,
    "exact-code priority score",
  );

  assertRecord(
    results[0]?.book.id
      === expectedBookId,
    "exact-code result is ranked first",
  );
}

async function verifyExactTitleSearch(
  service:
    EducationalBookSearchService,
  expectedBookId: string,
  canonicalName: string,
): Promise<void> {
  const results =
    await service.search({
      query: canonicalName,

      limit: 10,
    });

  assertRecord(
    results.length > 0,
    "exact-title search returns results",
  );

  const exactMatch =
    results.find(
      (result) =>
        result.book.id
        === expectedBookId,
    );

  assertRecord(
    exactMatch !== undefined,
    "exact-title search finds reference book",
  );

  assertRecord(
    exactMatch?.matchMethod
      === "EXACT_TITLE",
    "exact-title match method",
  );

  assertRecord(
    exactMatch?.score === 99,
    "exact-title priority score",
  );

  assertRecord(
    results[0]?.book.id
      === expectedBookId,
    "exact-title result is ranked first",
  );
}

async function verifyCustomerWordingSearch(
  service:
    EducationalBookSearchService,
  firstBook: Awaited<
    ReturnType<
      typeof prisma.educationalBook.findFirst<{
        include: typeof educationalBookInclude;

        orderBy: {
          createdAt: "asc";
        };
      }>
    >
  > & object,
): Promise<void> {
  const customerQuery =
    buildCustomerQuery(firstBook);

  console.log("");
  console.log("Customer-style search");
  console.log("---------------------");
  console.log(
    `Query: ${customerQuery}`,
  );

  const results =
    await service.search({
      query: customerQuery,

      limit: 20,
    });

  assertRecord(
    results.length > 0,
    "customer-style search returns results",
  );

  const referenceResult =
    results.find(
      (result) =>
        result.book.id
        === firstBook.id,
    );

  assertRecord(
    referenceResult !== undefined,
    "customer-style search finds reference book",
  );

  if (!referenceResult) {
    return;
  }

  console.log(
    `Reference score: ${referenceResult.score}`,
  );
  console.log(
    `Match method: ${referenceResult.matchMethod}`,
  );

  if (
    referenceResult.scoreBreakdown
  ) {
    console.log(
      "Score breakdown:",
      referenceResult.scoreBreakdown,
    );
  }

  assertRecord(
    referenceResult.score > 0,
    "customer-style search produces a positive score",
  );

  const hasEducationalSignals =
    firstBook.subjects.length > 0
    || firstBook.levels.length > 0
    || firstBook.resourceTypes.length
      > 0
    || firstBook
      .curriculumVersions.length > 0;

  if (
    hasEducationalSignals
    && referenceResult
      .scoreBreakdown
  ) {
    const educationalScore =
      referenceResult
        .scoreBreakdown.subject
      + referenceResult
        .scoreBreakdown.level
      + referenceResult
        .scoreBreakdown.resourceType
      + referenceResult
        .scoreBreakdown
        .curriculumVersion;

    assertRecord(
      educationalScore > 0,
      "educational relationship scoring",
    );
  } else {
    printSkipped(
      "educational relationship scoring",
      "reference book has no recognised educational relationships",
    );
  }
}

async function verifyDeterministicOrdering(
  service:
    EducationalBookSearchService,
  query: string,
): Promise<void> {
  const firstRun =
    await service.search({
      query,

      limit: 20,
    });

  const secondRun =
    await service.search({
      query,

      limit: 20,
    });

  const firstIds =
    firstRun.map(
      (result) =>
        result.book.id,
    );

  const secondIds =
    secondRun.map(
      (result) =>
        result.book.id,
    );

  assertRecord(
    JSON.stringify(firstIds)
      === JSON.stringify(secondIds),
    "deterministic result ordering",
  );
}

async function verifySearchProtection(
  service:
    EducationalBookSearchService,
): Promise<void> {
  const blankResults =
    await service.search({
      query: "   ",
    });

  assertRecord(
    blankResults.length === 0,
    "blank ranked-search protection",
  );

  const limitedResults =
    await service.search({
      query: "a",

      limit: 1,
    });

  assertRecord(
    limitedResults.length <= 1,
    "ranked-search result limit",
  );
}

function buildCustomerQuery(
  book: Awaited<
    ReturnType<
      typeof prisma.educationalBook.findFirst<{
        include: typeof educationalBookInclude;

        orderBy: {
          createdAt: "asc";
        };
      }>
    >
  > & object,
): string {
  const titleTerm =
    selectSearchTerm(
      book.entity.canonicalName,
    );

  const subject =
    book.subjects[0]
      ?.subject.entity.canonicalName;

  const level =
    book.levels[0]
      ?.level.entity.canonicalName;

  const resourceType =
    book.resourceTypes[0]
      ?.resourceType.entity
      .canonicalName;

  const curriculum =
    book.curriculumVersions[0]
      ?.curriculumVersion
      .curriculum.entity
      .canonicalName;

  return [
    titleTerm,

    subject,

    level,

    resourceType,

    curriculum,
  ]
    .filter(
      (
        value,
      ): value is string =>
        typeof value === "string"
        && value.trim().length > 0,
    )
    .join(" ");
}

function selectSearchTerm(
  canonicalName: string,
): string {
  const words =
    canonicalName
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  return (
    words[0]
    ?? canonicalName.trim()
  );
}

function assertRecord(
  condition: boolean,
  operation: string,
): void {
  if (!condition) {
    throw new Error(
      `FAILED: ${operation}`,
    );
  }

  console.log(
    `PASSED: ${operation}`,
  );
}

function printSkipped(
  operation: string,
  reason: string,
): void {
  console.log(
    `SKIPPED: ${operation} — ${reason}.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error("");
    console.error(
      "Educational Book query and ranked-search verification failed.",
    );

    console.error(error);

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });