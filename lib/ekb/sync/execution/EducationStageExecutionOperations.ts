import {
  EducationalLevelType,
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { EducationStageService } from "../../services/EducationStageService";
import { generateEntityCode } from "./generateEntityCode";

export interface EducationStageOperations {
  ensure(
    stageName: string,
  ): Promise<string>;
}

export class EducationStageExecutionOperations
  implements EducationStageOperations
{
  private readonly service: EducationStageService;

  constructor(
    prisma:
      | PrismaClient
      | Prisma.TransactionClient,
  ) {
    this.service =
      new EducationStageService(prisma);
  }

  async ensure(
    stageName: string,
  ): Promise<string> {
    const normalisedName =
      this.normaliseName(stageName);

    const stage =
      await this.service.upsert({
        code:
          generateEntityCode(
            "STAGE",
            normalisedName,
          ),

        canonicalName:
          normalisedName,

        displayName:
          normalisedName,

        searchName:
          normalisedName,

        levelType:
          this.resolveLevelType(
            normalisedName,
          ),
      });

    return stage.id;
  }

  private normaliseName(
    stageName: string,
  ): string {
    const normalisedName =
      stageName.trim();

    if (!normalisedName) {
      throw new Error(
        "Education stage name is required.",
      );
    }

    return normalisedName;
  }

  private resolveLevelType(
    stageName: string,
  ): EducationalLevelType {
    const value =
      stageName
        .trim()
        .toLowerCase();

    if (
      value.includes("creche") ||
      value.includes("crèche") ||
      value.includes("nursery") ||
      value.includes("kindergarten") ||
      value.includes("pre-school") ||
      value.includes("preschool") ||
      value === "kg" ||
      value.startsWith("kg ")
    ) {
      return this.getLevelType(
        "EARLY_CHILDHOOD",
      );
    }

    if (
      value.includes("junior high") ||
      value.includes("junior secondary") ||
      value === "jhs" ||
      value.startsWith("jhs ")
    ) {
      return this.getLevelType(
        "JHS",
      );
    }

    if (
      value.includes("senior high") ||
      value.includes("senior secondary") ||
      value === "shs" ||
      value.startsWith("shs ")
    ) {
      return this.getLevelType(
        "SHS",
      );
    }

    if (
      value.includes("tvet") ||
      value.includes("technical") ||
      value.includes("vocational")
    ) {
      return this.getLevelType(
        "TVET",
      );
    }

    if (
      value.includes("tertiary") ||
      value.includes("university") ||
      value.includes("polytechnic") ||
      value.includes("college")
    ) {
      return this.getLevelType(
        "TERTIARY",
      );
    }

    if (
      value.includes("primary") ||
      value.includes("basic") ||
      value.startsWith("p") ||
      value.includes("lower primary") ||
      value.includes("upper primary")
    ) {
      return this.getLevelType(
        "PRIMARY",
      );
    }

    return this.getLevelType(
      "PRIMARY",
    );
  }

  private getLevelType(
    key: string,
  ): EducationalLevelType {
    const levelTypes =
      EducationalLevelType as unknown as Record<
        string,
        EducationalLevelType
      >;

    const levelType =
      levelTypes[key];

    if (levelType) {
      return levelType;
    }

    const fallback =
      Object.values(levelTypes)[0];

    if (!fallback) {
      throw new Error(
        "No EducationalLevelType values are available in the generated Prisma client.",
      );
    }

    return fallback;
  }
}