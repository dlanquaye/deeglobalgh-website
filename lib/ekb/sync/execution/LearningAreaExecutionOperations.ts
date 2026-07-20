import {
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { LearningAreaService } from "../../services/LearningAreaService";
import { ExecutionContext } from "./ExecutionContext";
import { generateEntityCode } from "./generateEntityCode";

export class LearningAreaExecutionOperations {
  private readonly service: LearningAreaService;

  constructor(
    prisma:
      | PrismaClient
      | Prisma.TransactionClient,

    private readonly context: ExecutionContext,
  ) {
    this.service =
      new LearningAreaService(prisma);
  }

  async ensureForSubject(
    subjectName: string,
  ): Promise<string> {
    const normalisedSubjectName =
      subjectName.trim();

    if (!normalisedSubjectName) {
      throw new Error(
        "Subject name is required before resolving its learning area.",
      );
    }

    const curriculumVersionId =
      this.context.getEntityId(
        "curriculumVersion",
      );

    if (!curriculumVersionId) {
      throw new Error(
        "Curriculum version must be executed before its learning area.",
      );
    }

    const canonicalName =
      `${normalisedSubjectName} Learning Area`;

    const code =
      generateEntityCode(
        "LEARNING_AREA",
        normalisedSubjectName,
      );

    const learningArea =
      await this.service.upsert({
        code,

        canonicalName,

        curriculumVersionId,

        displayName:
          normalisedSubjectName,

        searchName:
          normalisedSubjectName,

        description:
          `Learning area for ${normalisedSubjectName}.`,

        displayOrder: 1,
      });

    this.context.setEntityId(
      "learningArea",
      learningArea.id,
    );

    this.context.setEntityId(
      `learningArea:${normalisedSubjectName.toLowerCase()}`,
      learningArea.id,
    );

    return learningArea.id;
  }
}