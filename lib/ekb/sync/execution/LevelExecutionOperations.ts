import {
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { LevelService } from "../../services/LevelService";
import { ReferenceEntityOperations } from "./ReferenceEntityExecutor";
import { generateEntityCode } from "./generateEntityCode";

export interface LevelExecutionValue {
  name: string;

  educationStageId: string;

  displayOrder?: number;
}

export class LevelExecutionOperations
  implements ReferenceEntityOperations<LevelExecutionValue>
{
  private readonly service: LevelService;

  constructor(
    prisma:
      | PrismaClient
      | Prisma.TransactionClient,
  ) {
    this.service =
      new LevelService(prisma);
  }

  async create(
    value: LevelExecutionValue,
  ): Promise<string> {
    const normalisedValue =
      this.normalise(value);

    const level =
      await this.service.upsert({
        code:
          generateEntityCode(
            "LEVEL",
            normalisedValue.name,
          ),

        canonicalName:
          normalisedValue.name,

        educationStageId:
          normalisedValue.educationStageId,

        displayOrder:
          normalisedValue.displayOrder,

        displayName:
          normalisedValue.name,

        searchName:
          normalisedValue.name,
      });

    return level.id;
  }

  async update(
    _id: string,
    value: LevelExecutionValue,
  ): Promise<void> {
    const normalisedValue =
      this.normalise(value);

    await this.service.upsert({
      code:
        generateEntityCode(
          "LEVEL",
          normalisedValue.name,
        ),

      canonicalName:
        normalisedValue.name,

      educationStageId:
        normalisedValue.educationStageId,

      displayOrder:
        normalisedValue.displayOrder,

      displayName:
        normalisedValue.name,

      searchName:
        normalisedValue.name,
    });
  }

  private normalise(
    value: LevelExecutionValue,
  ): LevelExecutionValue {
    const name =
      value.name.trim();

    const educationStageId =
      value.educationStageId.trim();

    if (!name) {
      throw new Error(
        "Level name is required for execution.",
      );
    }

    if (!educationStageId) {
      throw new Error(
        `Education stage ID is required before executing level "${name}".`,
      );
    }

    return {
      name,

      educationStageId,

      displayOrder:
        value.displayOrder ??
        this.resolveDisplayOrder(name),
    };
  }

  private resolveDisplayOrder(
    levelName: string,
  ): number {
    const value =
      levelName
        .trim()
        .toLowerCase();

    const numberMatch =
      value.match(/\d+/);

    const levelNumber =
      numberMatch
        ? Number(numberMatch[0])
        : 1;

    if (
      value.includes("creche") ||
      value.includes("crèche")
    ) {
      return 1;
    }

    if (
      value.includes("nursery")
    ) {
      return 1 + levelNumber;
    }

    if (
      value.includes("kindergarten") ||
      value === "kg" ||
      value.startsWith("kg ")
    ) {
      return 3 + levelNumber;
    }

    if (
      value.includes("primary") ||
      value.includes("basic")
    ) {
      return 10 + levelNumber;
    }

    if (
      value.includes("jhs") ||
      value.includes("junior high") ||
      value.includes("junior secondary")
    ) {
      return 20 + levelNumber;
    }

    if (
      value.includes("shs") ||
      value.includes("senior high") ||
      value.includes("senior secondary")
    ) {
      return 30 + levelNumber;
    }

    if (
      value.includes("tvet") ||
      value.includes("technical") ||
      value.includes("vocational")
    ) {
      return 40 + levelNumber;
    }

    if (
      value.includes("tertiary") ||
      value.includes("university") ||
      value.includes("polytechnic") ||
      value.includes("college")
    ) {
      return 50 + levelNumber;
    }

    return levelNumber;
  }
}