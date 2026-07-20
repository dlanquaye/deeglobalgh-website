import {
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { CurriculumVersionService } from "../../services/CurriculumVersionService";
import { ExecutionContext } from "./ExecutionContext";
import { generateEntityCode } from "./generateEntityCode";

export class CurriculumVersionExecutionOperations {
  private static readonly CURRENT_VERSION = "CURRENT";

  private readonly service: CurriculumVersionService;

  constructor(
    prisma:
      | PrismaClient
      | Prisma.TransactionClient,

    private readonly context: ExecutionContext,
  ) {
    this.service =
      new CurriculumVersionService(prisma);
  }

  async ensureCurrent(
    curriculumName: string,
  ): Promise<string> {
    const normalisedCurriculumName =
      curriculumName.trim();

    if (!normalisedCurriculumName) {
      throw new Error(
        "Curriculum name is required before creating a curriculum version.",
      );
    }

    const curriculumId =
      this.context.getEntityId("curriculum");

    if (!curriculumId) {
      throw new Error(
        "Curriculum must be executed before its curriculum version.",
      );
    }

    const canonicalName =
      `${normalisedCurriculumName} Current Version`;

    const code =
      generateEntityCode(
        "CURR_VERSION",
        canonicalName,
      );

    const curriculumVersion =
      await this.service.upsert({
        code,

        canonicalName,

        curriculumId,

        version:
          CurriculumVersionExecutionOperations.CURRENT_VERSION,

        displayName: canonicalName,

        searchName: canonicalName,

        isCurrent: true,

        description:
          `Current active version of ${normalisedCurriculumName}.`,
      });

    this.context.setEntityId(
      "curriculumVersion",
      curriculumVersion.id,
    );

    return curriculumVersion.id;
  }
}