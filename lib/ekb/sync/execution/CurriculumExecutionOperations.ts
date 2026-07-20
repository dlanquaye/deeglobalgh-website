import {
  CurriculumAuthority,
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { CurriculumService } from "../../services/CurriculumService";
import { BaseReferenceExecutionOperations } from "./BaseReferenceExecutionOperations";

export class CurriculumExecutionOperations
  extends BaseReferenceExecutionOperations
{
  private readonly service: CurriculumService;

  constructor(
    prisma:
      | PrismaClient
      | Prisma.TransactionClient,
  ) {
    super(prisma);

    this.service =
      new CurriculumService(prisma);
  }

  protected get codePrefix(): string {
    return "CURR";
  }

  protected async upsert(
    code: string,
    canonicalName: string,
  ): Promise<string> {
    const curriculum =
      await this.service.upsert({
        code,

        canonicalName,

        authority:
          CurriculumAuthority.NACCA,

        countryCode: "GH",

        officialCode: code,

        displayName: canonicalName,

        searchName: canonicalName,
      });

    return curriculum.id;
  }
}