import { Prisma } from "@prisma/client";

import {
  PlannedRecord,
} from "../syncPlan";

import { AuthorExecutionOperations } from "./AuthorExecutionOperations";
import { AuthorExecutor } from "./AuthorExecutor";
import { BookExecutionOperations } from "./BookExecutionOperations";
import { BookExecutor } from "./BookExecutor";
import { BookLineExecutionOperations } from "./BookLineExecutionOperations";
import { BookLineExecutor } from "./BookLineExecutor";
import { BookRelationshipExecutor } from "./BookRelationshipExecutor";
import { CurriculumExecutionOperations } from "./CurriculumExecutionOperations";
import { CurriculumVersionExecutionOperations } from "./CurriculumVersionExecutionOperations";
import { EducationStageExecutionOperations } from "./EducationStageExecutionOperations";
import { EducationStageNameResolver } from "./EducationStageNameResolver";
import { ExecutedEntityResultResolver } from "./ExecutedEntityResultResolver";
import { ExecutionContext } from "./ExecutionContext";
import { LanguageExecutionOperations } from "./LanguageExecutionOperations";
import { LearningAreaExecutionOperations } from "./LearningAreaExecutionOperations";
import {
  LevelExecutionOperations,
  LevelExecutionValue,
} from "./LevelExecutionOperations";
import { PublisherExecutionOperations } from "./PublisherExecutionOperations";
import { ReferenceEntityExecutor } from "./ReferenceEntityExecutor";
import { ReferenceExecutionPipeline } from "./ReferenceExecutionPipeline";
import { ResourceTypeExecutionOperations } from "./ResourceTypeExecutionOperations";
import { SubjectExecutionOperations } from "./SubjectExecutionOperations";
import {
  ExecutedEntityResult,
  ExecutedRecordResult,
} from "./types";

export class PlannedRecordExecutor {
  private readonly resultResolver =
    new ExecutedEntityResultResolver();

  private readonly referencePipeline =
    new ReferenceExecutionPipeline();

  private readonly educationStageNameResolver =
    new EducationStageNameResolver();

  constructor(
    private readonly prisma:
      Prisma.TransactionClient,
  ) {}

  async execute(
    plannedRecord: PlannedRecord,
    recordNumber: number,
  ): Promise<ExecutedRecordResult> {
    const context =
      new ExecutionContext(
        this.prisma,
      );

    const entities:
      ExecutedEntityResult[] = [];

    const record =
      plannedRecord.staged.record;

    const publisherId =
      await this.referencePipeline.execute({
        resolution:
          plannedRecord.publisher,

        value:
          record.publisher,

        executor:
          new ReferenceEntityExecutor(
            new PublisherExecutionOperations(
              this.prisma,
            ),
          ),

        context,

        contextKey:
          "publisher",

        entities,
      });

    const curriculumName =
      record.curriculum?.trim() ||
      "NaCCA";

    const curriculumId =
      await this.referencePipeline.execute({
        resolution:
          plannedRecord.curriculum,

        value:
          curriculumName,

        executor:
          new ReferenceEntityExecutor(
            new CurriculumExecutionOperations(
              this.prisma,
            ),
          ),

        context,

        contextKey:
          "curriculum",

        entities,
      });

    context.setEntityId(
      "curriculum",
      curriculumId,
    );

    const curriculumVersionOperations =
      new CurriculumVersionExecutionOperations(
        this.prisma,
        context,
      );

    const curriculumVersionId =
      await curriculumVersionOperations.ensureCurrent(
        curriculumName,
      );

    context.setEntityId(
      "curriculumVersion",
      curriculumVersionId,
    );

    const learningAreaOperations =
      new LearningAreaExecutionOperations(
        this.prisma,
        context,
      );

    const learningAreaId =
      await learningAreaOperations.ensureForSubject(
        record.subject,
      );

    const normalisedSubjectName =
      record.subject
        .trim()
        .toLowerCase();

    context.setEntityId(
      "learningArea",
      learningAreaId,
    );

    context.setEntityId(
      `learningArea:${normalisedSubjectName}`,
      learningAreaId,
    );

    this.resultResolver.assertExecutable(
      plannedRecord.subject,
    );

    const subjectOperations =
      new SubjectExecutionOperations(
        this.prisma,
        context,
      );

    const subjectId =
      await subjectOperations.ensure(
        record.subject,
      );

    context.setEntityId(
      "subject",
      subjectId,
    );

    context.setEntityId(
      `subject:${normalisedSubjectName}`,
      subjectId,
    );

    entities.push(
      this.resultResolver.createFromResolution(
        plannedRecord.subject,
        subjectId,
      ),
    );

    const educationStageName =
      this.educationStageNameResolver.resolve(
        record.level,
      );

    const educationStageOperations =
      new EducationStageExecutionOperations(
        this.prisma,
      );

    const educationStageId =
      await educationStageOperations.ensure(
        educationStageName,
      );

    context.setEntityId(
      "educationStage",
      educationStageId,
    );

    const levelValue:
      LevelExecutionValue = {
        name:
          record.level,

        educationStageId,
      };

    const levelId =
      await this.referencePipeline.execute({
        resolution:
          plannedRecord.level,

        value:
          levelValue,

        executor:
          new ReferenceEntityExecutor(
            new LevelExecutionOperations(
              this.prisma,
            ),
          ),

        context,

        contextKey:
          "level",

        entities,
      });

    const resourceTypeId =
      await this.referencePipeline.execute({
        resolution:
          plannedRecord.resourceType,

        value:
          record.resourceType,

        executor:
          new ReferenceEntityExecutor(
            new ResourceTypeExecutionOperations(
              this.prisma,
            ),
          ),

        context,

        contextKey:
          "resourceType",

        entities,
      });

    const languageName =
      record.language?.trim() ||
      "English";

    const languageId =
      await this.referencePipeline.execute({
        resolution:
          plannedRecord.language,

        value:
          languageName,

        executor:
          new ReferenceEntityExecutor(
            new LanguageExecutionOperations(
              this.prisma,
            ),
          ),

        context,

        contextKey:
          "language",

        entities,
      });

    const bookLineExecutor =
      new BookLineExecutor(
        new BookLineExecutionOperations(
          this.prisma,
        ),
      );

    const bookLineResult =
      await bookLineExecutor.execute({
        resolution:
          plannedRecord.bookLine,

        value: {
          name:
            record.bookLine?.trim() ||
            record.title,

          publisherId,
        },

        context,
      });

    entities.push(
      bookLineResult,
    );

    const bookLineId =
      this.resultResolver.getEntityId(
        bookLineResult,
      );

    context.setEntityId(
      "bookLine",
      bookLineId,
    );

    const authorExecutor =
      new AuthorExecutor(
        new AuthorExecutionOperations(
          this.prisma,
        ),
      );

    const authorResults =
      await authorExecutor.execute({
        names:
          record.authors,

        resolutions:
          plannedRecord.author,

        context,
      });

    entities.push(
      ...authorResults,
    );

    const bookExecutor =
      new BookExecutor(
        new BookExecutionOperations(
          this.prisma,
        ),
      );

    const bookResult =
      await bookExecutor.execute({
        resolution:
          plannedRecord.book,

        value: {
          title:
            record.title,

          bookLineId,

          isbn:
            record.isbn,
        },

        context,
      });

    entities.push(
      bookResult,
    );

    const bookId =
      this.resultResolver.getEntityId(
        bookResult,
      );

    context.setEntityId(
      "book",
      bookId,
    );

    const bookRelationshipExecutor =
      new BookRelationshipExecutor(
        this.prisma,
      );

    await bookRelationshipExecutor.execute({
      bookId,

      subjectId,

      levelId,

      languageId,

      resourceTypeId,

      curriculumVersionId,

      authorResults,
    });

    return {
      recordNumber,

      title:
        record.title,

      success:
        true,

      entities,

      errors:
        [],
    };
  }
}