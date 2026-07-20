import {
  EducationalEntityType,
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { BaseEntityService } from "./BaseEntityService";

export interface UpsertClassInput {
  code: string;

  canonicalName: string;

  academicYearId: string;

  schoolId?: string;

  levelId?: string;

  classCode?: string;

  className?: string;

  stream?: string;

  teacherName?: string;

  capacity?: number;

  displayName?: string;

  searchName?: string;

  slug?: string;

  description?: string;
}

export class ClassService extends BaseEntityService {
  constructor(
    prisma: PrismaClient | Prisma.TransactionClient,
  ) {
    super(prisma);
  }

  async upsert(input: UpsertClassInput) {
    const entity = await this.upsertEntity({
      entityType: EducationalEntityType.CLASS,

      code: input.code,

      canonicalName: input.canonicalName,

      displayName: input.displayName,

      searchName: input.searchName,

      slug: input.slug,

      description: input.description,
    });

    return this.prisma.educationalClass.upsert({
      where: {
        entityId: entity.id,
      },

      create: {
        entityId: entity.id,

        academicYearId: input.academicYearId,

        schoolId: input.schoolId,

        levelId: input.levelId,

        classCode: input.classCode,

        className: input.className,

        stream: input.stream,

        teacherName: input.teacherName,

        capacity: input.capacity,
      },

      update: {
        academicYearId: input.academicYearId,

        schoolId: input.schoolId,

        levelId: input.levelId,

        classCode: input.classCode,

        className: input.className,

        stream: input.stream,

        teacherName: input.teacherName,

        capacity: input.capacity,
      },
    });
  }
}