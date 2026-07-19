import { EducationalCache } from "../../cache/EducationalCache";
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
    };
  }
}