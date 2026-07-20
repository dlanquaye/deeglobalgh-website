import {
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { SubjectService } from "../../services/SubjectService";
import { ExecutionContext } from "./ExecutionContext";
import { generateEntityCode } from "./generateEntityCode";

export class SubjectExecutionOperations {
  private readonly service: SubjectService;

  constructor(
    prisma:
      | PrismaClient
      | Prisma.TransactionClient,

    private readonly context: ExecutionContext,
  ) {
    this.service =
      new SubjectService(prisma);
  }

  async ensure(
    subjectName: string,
  ): Promise<string> {
    const normalisedSubjectName =
      subjectName.trim();

    if (!normalisedSubjectName) {
      throw new Error(
        "Subject name is required before execution.",
      );
    }

    const learningAreaId =
      this.context.getEntityId(
        `learningArea:${normalisedSubjectName.toLowerCase()}`
      ) ??
      this.context.getEntityId(
        "learningArea"
      );

    if (!learningAreaId) {
      throw new Error(
        "Learning area must be executed before its subject.",
      );
    }

    const code =
      generateEntityCode(
        "SUB",
        normalisedSubjectName,
      );

    const subject =
      await this.service.upsert({
        code,

        canonicalName:
          normalisedSubjectName,

        learningAreaId,

        displayName:
          normalisedSubjectName,

        searchName:
          normalisedSubjectName,

        subjectCode: code,

        description:
          `${normalisedSubjectName} subject.`,

        displayOrder: 1,
      });

    this.context.setEntityId(
      "subject",
      subject.id,
    );

    this.context.setEntityId(
      `subject:${normalisedSubjectName.toLowerCase()}`,
      subject.id,
    );

    return subject.id;
  }
}