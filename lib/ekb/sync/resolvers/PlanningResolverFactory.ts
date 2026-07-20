import { EducationalCache } from "../../cache/EducationalCache";
import { AuthorPlanningResolver } from "./AuthorPlanningResolver";
import { BookLinePlanningResolver } from "./BookLinePlanningResolver";
import { BookPlanningResolver } from "./BookPlanningResolver";
import { ReferencePlanningResolver } from "./ReferencePlanningResolver";

export class PlanningResolverFactory {
  constructor(
    private readonly cache: EducationalCache,
  ) {}

  create() {
    return {
      publisher: new ReferencePlanningResolver(
        "Publisher",
        this.cache.publishers,
      ),

      subject: new ReferencePlanningResolver(
        "Subject",
        this.cache.subjects,
      ),

      level: new ReferencePlanningResolver(
        "Level",
        this.cache.levels,
      ),

      language: new ReferencePlanningResolver(
        "Language",
        this.cache.languages,
      ),

      curriculum: new ReferencePlanningResolver(
        "Curriculum",
        this.cache.curricula,
      ),

      resourceType:
        new ReferencePlanningResolver(
          "ResourceType",
          this.cache.resourceTypes,
        ),

      bookLine: new BookLinePlanningResolver(
        this.cache.bookLines,
      ),

      author: new AuthorPlanningResolver(
        this.cache.authors,
      ),

      book: new BookPlanningResolver(
        this.cache.books,
      ),
    };
  }
}