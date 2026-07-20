import {
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { PublisherService } from "../../services/PublisherService";
import { BaseReferenceExecutionOperations } from "./BaseReferenceExecutionOperations";

export class PublisherExecutionOperations
  extends BaseReferenceExecutionOperations
{
  private readonly service: PublisherService;

  constructor(
    prisma:
      | PrismaClient
      | Prisma.TransactionClient,
  ) {
    super(prisma);

    this.service =
      new PublisherService(prisma);
  }

  protected get codePrefix(): string {
    return "PUB";
  }

  protected async upsert(
    code: string,
    canonicalName: string,
  ): Promise<string> {
    const publisher =
      await this.service.upsert({
        code,

        canonicalName,

        displayName: canonicalName,

        searchName: canonicalName,
      });

    return publisher.id;
  }
}