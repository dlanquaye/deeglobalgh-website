import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ReferenceCache {
  private publishers = new Map<string, string>();

  private subjects = new Map<string, string>();

  private levels = new Map<string, string>();

  private resourceTypes = new Map<string, string>();

  private languages = new Map<string, string>();

  private curricula = new Map<string, string>();

  async load() {
    await Promise.all([
      this.loadPublishers(),
      this.loadSubjects(),
      this.loadLevels(),
      this.loadResourceTypes(),
      this.loadLanguages(),
      this.loadCurricula(),
    ]);
  }

  private async loadPublishers() {
    const rows = await prisma.publisher.findMany();

    this.publishers.clear();

    for (const row of rows) {
      this.publishers.set(
        row.name.toLowerCase(),
        row.id,
      );
    }
  }

  private async loadSubjects() {
    const rows = await prisma.subject.findMany();

    this.subjects.clear();

    for (const row of rows) {
      this.subjects.set(
        row.name.toLowerCase(),
        row.id,
      );
    }
  }

  private async loadLevels() {
    const rows = await prisma.level.findMany();

    this.levels.clear();

    for (const row of rows) {
      this.levels.set(
        row.name.toLowerCase(),
        row.id,
      );
    }
  }

  private async loadResourceTypes() {
    const rows =
      await prisma.resourceType.findMany();

    this.resourceTypes.clear();

    for (const row of rows) {
      this.resourceTypes.set(
        row.name.toLowerCase(),
        row.id,
      );
    }
  }

  private async loadLanguages() {
    const rows = await prisma.language.findMany();

    this.languages.clear();

    for (const row of rows) {
      this.languages.set(
        row.name.toLowerCase(),
        row.id,
      );
    }
  }

  private async loadCurricula() {
    const rows =
      await prisma.curriculum.findMany();

    this.curricula.clear();

    for (const row of rows) {
      this.curricula.set(
        row.name.toLowerCase(),
        row.id,
      );
    }
  }

  getPublisherId(name: string) {
    return this.publishers.get(
      name.trim().toLowerCase(),
    );
  }

  getSubjectId(name: string) {
    return this.subjects.get(
      name.trim().toLowerCase(),
    );
  }

  getLevelId(name: string) {
    return this.levels.get(
      name.trim().toLowerCase(),
    );
  }

  getResourceTypeId(name: string) {
    return this.resourceTypes.get(
      name.trim().toLowerCase(),
    );
  }

  getLanguageId(name: string) {
    return this.languages.get(
      name.trim().toLowerCase(),
    );
  }

  getCurriculumId(name: string) {
    return this.curricula.get(
      name.trim().toLowerCase(),
    );
  }

  getStats() {
    return {
      publishers: this.publishers.size,
      subjects: this.subjects.size,
      levels: this.levels.size,
      resourceTypes: this.resourceTypes.size,
      languages: this.languages.size,
      curricula: this.curricula.size,
    };
  }
}