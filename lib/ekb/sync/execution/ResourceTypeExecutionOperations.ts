import {
  Prisma,
  PrismaClient,
  ResourceTypeCategory,
} from "@prisma/client";

import { ResourceTypeService } from "../../services/ResourceTypeService";
import { ReferenceEntityOperations } from "./ReferenceEntityExecutor";
import { generateEntityCode } from "./generateEntityCode";

export class ResourceTypeExecutionOperations
  implements ReferenceEntityOperations<string>
{
  private readonly service: ResourceTypeService;

  constructor(
    prisma:
      | PrismaClient
      | Prisma.TransactionClient,
  ) {
    this.service =
      new ResourceTypeService(prisma);
  }

  async create(
    resourceTypeName: string,
  ): Promise<string> {
    const normalisedName =
      this.normaliseName(resourceTypeName);

    const resourceType =
      await this.service.upsert({
        code:
          generateEntityCode(
            "RESOURCE_TYPE",
            normalisedName,
          ),

        canonicalName:
          normalisedName,

        displayName:
          normalisedName,

        searchName:
          normalisedName,

        category:
          this.resolveCategory(
            normalisedName,
          ),
      });

    return resourceType.id;
  }

  async update(
    _id: string,
    resourceTypeName: string,
  ): Promise<void> {
    const normalisedName =
      this.normaliseName(resourceTypeName);

    await this.service.upsert({
      code:
        generateEntityCode(
          "RESOURCE_TYPE",
          normalisedName,
        ),

      canonicalName:
        normalisedName,

      displayName:
        normalisedName,

      searchName:
        normalisedName,

      category:
        this.resolveCategory(
          normalisedName,
        ),
    });
  }

  private normaliseName(
    resourceTypeName: string,
  ): string {
    const normalisedName =
      resourceTypeName.trim();

    if (!normalisedName) {
      throw new Error(
        "Resource type name is required for execution.",
      );
    }

    return normalisedName;
  }

  private resolveCategory(
    resourceTypeName: string,
  ): ResourceTypeCategory {
    const value =
      resourceTypeName
        .trim()
        .toLowerCase();

    if (
      value.includes("teacher") &&
      (
        value.includes("guide") ||
        value.includes("manual")
      )
    ) {
      return ResourceTypeCategory.TEACHER_GUIDE;
    }

    if (
      value.includes("learner") &&
      value.includes("guide")
    ) {
      return ResourceTypeCategory.LEARNER_GUIDE;
    }

    if (
      value.includes("workbook") ||
      value.includes("work book") ||
      value.includes("activity book") ||
      value.includes("exercise book")
    ) {
      return ResourceTypeCategory.WORKBOOK;
    }

    if (
      value.includes("revision") ||
      value.includes("study guide")
    ) {
      return ResourceTypeCategory.REVISION_GUIDE;
    }

    if (
      value.includes("assessment") ||
      value.includes("test") ||
      value.includes("exam")
    ) {
      return ResourceTypeCategory.ASSESSMENT;
    }

    if (
      value.includes("storybook") ||
      value.includes("story book") ||
      value.includes("reader")
    ) {
      return ResourceTypeCategory.STORYBOOK;
    }

    if (
      value.includes("dictionary")
    ) {
      return ResourceTypeCategory.DICTIONARY;
    }

    if (
      value.includes("reference") ||
      value.includes("encyclopaedia") ||
      value.includes("encyclopedia") ||
      value.includes("atlas")
    ) {
      return ResourceTypeCategory.REFERENCE;
    }

    if (
      value.includes("digital") ||
      value.includes("ebook") ||
      value.includes("e-book") ||
      value.includes("online")
    ) {
      return ResourceTypeCategory.DIGITAL;
    }

    if (
      value.includes("supplementary") ||
      value.includes("supplement")
    ) {
      return ResourceTypeCategory.SUPPLEMENTARY;
    }

    if (
      value.includes("textbook") ||
      value.includes("text book") ||
      value.includes("learner book") ||
      value.includes("course book")
    ) {
      return ResourceTypeCategory.TEXTBOOK;
    }

    return ResourceTypeCategory.OTHER;
  }
}