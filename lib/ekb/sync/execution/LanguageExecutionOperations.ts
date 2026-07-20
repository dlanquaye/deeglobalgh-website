import {
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { LanguageService } from "../../services/LanguageService";
import { ReferenceEntityOperations } from "./ReferenceEntityExecutor";
import { generateEntityCode } from "./generateEntityCode";

export class LanguageExecutionOperations
  implements ReferenceEntityOperations<string>
{
  private readonly service: LanguageService;

  constructor(
    prisma:
      | PrismaClient
      | Prisma.TransactionClient,
  ) {
    this.service =
      new LanguageService(prisma);
  }

  async create(
    languageName: string,
  ): Promise<string> {
    const normalisedName =
      this.normaliseName(languageName);

    const language =
      await this.service.upsert({
        code:
          generateEntityCode(
            "LANGUAGE",
            normalisedName,
          ),

        isoCode:
          this.resolveIsoCode(
            normalisedName,
          ),

        canonicalName:
          normalisedName,

        displayName:
          normalisedName,

        searchName:
          normalisedName,
      });

    return language.id;
  }

  async update(
    _id: string,
    languageName: string,
  ): Promise<void> {
    const normalisedName =
      this.normaliseName(languageName);

    await this.service.upsert({
      code:
        generateEntityCode(
          "LANGUAGE",
          normalisedName,
        ),

      isoCode:
        this.resolveIsoCode(
          normalisedName,
        ),

      canonicalName:
        normalisedName,

      displayName:
        normalisedName,

      searchName:
        normalisedName,
    });
  }

  private normaliseName(
    languageName: string,
  ): string {
    const normalisedName =
      languageName.trim();

    if (!normalisedName) {
      throw new Error(
        "Language name is required for execution.",
      );
    }

    return normalisedName;
  }

  private resolveIsoCode(
    languageName: string,
  ): string {
    const value =
      languageName
        .trim()
        .toLowerCase();

    const knownCodes:
      Record<string, string> = {
        english: "en",
        french: "fr",
        arabic: "ar",
        hausa: "ha",
        ewe: "ee",
        ga: "gaa",
        dagbani: "dag",
        twi: "tw",
        akan: "ak",
        fante: "fat",
        mfantse: "fat",
        gonja: "gjn",
        kasem: "xsm",
        nzema: "nzi",
        dangme: "ada",
      };

    const knownCode =
      knownCodes[value];

    if (knownCode) {
      return knownCode;
    }

    const generatedCode =
      value
        .normalize("NFKD")
        .replace(
          /[\u0300-\u036f]/g,
          "",
        )
        .replace(
          /[^a-z]/g,
          "",
        )
        .slice(0, 3);

    if (!generatedCode) {
      throw new Error(
        `Unable to generate an ISO-style code for language "${languageName}".`,
      );
    }

    return generatedCode;
  }
}