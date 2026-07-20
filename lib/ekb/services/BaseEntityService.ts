import { Prisma, PrismaClient } from "@prisma/client";
import {
  EducationalEntityService,
  CreateEducationalEntityInput,
} from "./EducationalEntityService";

export abstract class BaseEntityService {
  protected readonly entityService: EducationalEntityService;

  constructor(
    protected readonly prisma: PrismaClient | Prisma.TransactionClient,
  ) {
    this.entityService = new EducationalEntityService(prisma);
  }

  protected async upsertEntity(input: CreateEducationalEntityInput) {
    return this.entityService.upsert(input);
  }
}