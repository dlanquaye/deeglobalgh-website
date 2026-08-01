import {
  Prisma,
  PrismaClient,
} from "@prisma/client";

import {
  BookRepository,
  EducationalBookRecord,
} from "../repositories/BookRepository";

export type EducationalBookReadRecord =
  EducationalBookRecord;

export interface SearchEducationalBooksInput {
  query: string;

  limit?: number;

  offset?: number;
}

export interface ListEducationalBooksInput {
  limit?: number;

  offset?: number;
}

/**
 * Read-only application service for Educational Books.
 *
 * Responsibilities:
 *
 * - Validate and normalise query input.
 * - Apply safe pagination limits.
 * - Delegate database access to BookRepository.
 *
 * This service must not create, update or delete records.
 * All Educational Book writes remain the responsibility of BookService
 * and the existing synchronisation execution layer.
 */
export class BookReadService {
  private readonly repository: BookRepository;

  constructor(
    prisma:
      | PrismaClient
      | Prisma.TransactionClient,
  ) {
    this.repository = new BookRepository(prisma);
  }

  /**
   * Find an Educational Book by its internal book ID.
   */
  async findById(
    id: string,
  ): Promise<EducationalBookReadRecord | null> {
    const normalizedId = id.trim();

    if (!normalizedId) {
      return null;
    }

    return this.repository.findById(normalizedId);
  }

  /**
   * Find an Educational Book by its EducationalEntity ID.
   */
  async findByEntityId(
    entityId: string,
  ): Promise<EducationalBookReadRecord | null> {
    const normalizedEntityId = entityId.trim();

    if (!normalizedEntityId) {
      return null;
    }

    return this.repository.findByEntityId(
      normalizedEntityId,
    );
  }

  /**
   * Find an Educational Book using its unique entity code.
   */
  async findByCode(
    code: string,
  ): Promise<EducationalBookReadRecord | null> {
    const normalizedCode = code.trim();

    if (!normalizedCode) {
      return null;
    }

    return this.repository.findByCode(
      normalizedCode,
    );
  }

  /**
   * Find the first Educational Book whose canonical name matches exactly,
   * ignoring letter case.
   */
  async findByCanonicalName(
    canonicalName: string,
  ): Promise<EducationalBookReadRecord | null> {
    const normalizedName = canonicalName.trim();

    if (!normalizedName) {
      return null;
    }

    return this.repository.findByCanonicalName(
      normalizedName,
    );
  }

  /**
   * Search Educational Books by official name, display name,
   * normalised search name, entity code, subtitle or summary.
   */
  async search(
    input: SearchEducationalBooksInput,
  ): Promise<EducationalBookReadRecord[]> {
    const query = input.query.trim();

    if (!query) {
      return [];
    }

    return this.repository.search({
      query,

      limit: this.normalizeLimit(input.limit),

      offset: this.normalizeOffset(input.offset),
    });
  }

  /**
   * Return Educational Books connected to a Subject.
   */
  async findBySubjectId(
    subjectId: string,
    input: ListEducationalBooksInput = {},
  ): Promise<EducationalBookReadRecord[]> {
    const normalizedSubjectId = subjectId.trim();

    if (!normalizedSubjectId) {
      return [];
    }

    return this.repository.findBySubjectId(
      normalizedSubjectId,
      this.normalizeListInput(input),
    );
  }

  /**
   * Return Educational Books connected to an Educational Level.
   */
  async findByLevelId(
    levelId: string,
    input: ListEducationalBooksInput = {},
  ): Promise<EducationalBookReadRecord[]> {
    const normalizedLevelId = levelId.trim();

    if (!normalizedLevelId) {
      return [];
    }

    return this.repository.findByLevelId(
      normalizedLevelId,
      this.normalizeListInput(input),
    );
  }

  /**
   * Return Educational Books connected to an Author.
   */
  async findByAuthorId(
    authorId: string,
    input: ListEducationalBooksInput = {},
  ): Promise<EducationalBookReadRecord[]> {
    const normalizedAuthorId = authorId.trim();

    if (!normalizedAuthorId) {
      return [];
    }

    return this.repository.findByAuthorId(
      normalizedAuthorId,
      this.normalizeListInput(input),
    );
  }

  /**
   * Return Educational Books connected to a Language.
   */
  async findByLanguageId(
    languageId: string,
    input: ListEducationalBooksInput = {},
  ): Promise<EducationalBookReadRecord[]> {
    const normalizedLanguageId = languageId.trim();

    if (!normalizedLanguageId) {
      return [];
    }

    return this.repository.findByLanguageId(
      normalizedLanguageId,
      this.normalizeListInput(input),
    );
  }

  /**
   * Return Educational Books connected to a Resource Type.
   */
  async findByResourceTypeId(
    resourceTypeId: string,
    input: ListEducationalBooksInput = {},
  ): Promise<EducationalBookReadRecord[]> {
    const normalizedResourceTypeId =
      resourceTypeId.trim();

    if (!normalizedResourceTypeId) {
      return [];
    }

    return this.repository.findByResourceTypeId(
      normalizedResourceTypeId,
      this.normalizeListInput(input),
    );
  }

  /**
   * Return Educational Books connected to a Curriculum Version.
   */
  async findByCurriculumVersionId(
    curriculumVersionId: string,
    input: ListEducationalBooksInput = {},
  ): Promise<EducationalBookReadRecord[]> {
    const normalizedCurriculumVersionId =
      curriculumVersionId.trim();

    if (!normalizedCurriculumVersionId) {
      return [];
    }

    return this.repository.findByCurriculumVersionId(
      normalizedCurriculumVersionId,
      this.normalizeListInput(input),
    );
  }

  /**
   * Return the total number of Educational Books.
   */
  async count(): Promise<number> {
    return this.repository.count();
  }

  private normalizeListInput(
    input: ListEducationalBooksInput,
  ) {
    return {
      limit: this.normalizeLimit(input.limit),

      offset: this.normalizeOffset(input.offset),
    };
  }

  private normalizeLimit(
    limit: number | undefined,
  ): number {
    if (
      limit === undefined
      || !Number.isFinite(limit)
    ) {
      return 50;
    }

    return Math.min(
      Math.max(Math.trunc(limit), 1),
      200,
    );
  }

  private normalizeOffset(
    offset: number | undefined,
  ): number {
    if (
      offset === undefined
      || !Number.isFinite(offset)
    ) {
      return 0;
    }

    return Math.max(
      Math.trunc(offset),
      0,
    );
  }
}