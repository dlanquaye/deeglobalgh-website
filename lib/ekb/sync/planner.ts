import {
  ResolutionAction,
  ResolutionResult,
} from "./resolution";
import {
  PlannedRecord,
  SyncPlan,
} from "./syncPlan";
import { SyncPreview } from "./types";
import { PlanningResolverFactory } from "./resolvers/PlanningResolverFactory";

type PlanningResolvers = ReturnType<
  PlanningResolverFactory["create"]
>;

function keep(
  entity: string,
  message: string,
): ResolutionResult {
  return {
    entity,
    action: ResolutionAction.KEEP,
    message,
  };
}

function error(
  entity: string,
  message: string,
): ResolutionResult {
  return {
    entity,
    action: ResolutionAction.ERROR,
    message,
  };
}

function countResult(
  result: ResolutionResult,
  totals: {
    creates: number;
    updates: number;
    keeps: number;
    errors: number;
  },
): void {
  switch (result.action) {
    case ResolutionAction.CREATE:
      totals.creates++;
      break;

    case ResolutionAction.UPDATE:
      totals.updates++;
      break;

    case ResolutionAction.KEEP:
      totals.keeps++;
      break;

    case ResolutionAction.ERROR:
      totals.errors++;
      break;
  }
}

export function buildSyncPlan(
  preview: SyncPreview,
  resolvers: PlanningResolvers,
): SyncPlan {
  const records: PlannedRecord[] = [];

  const totals = {
    creates: 0,
    updates: 0,
    keeps: 0,
    errors: 0,
  };

  for (const staged of preview.records) {
    const record = staged.record;

    const validationMessage =
      staged.errors.join("; ");

    const publisher = staged.valid
      ? resolvers.publisher.resolve(
          record.publisher,
        )
      : error(
          "Publisher",
          validationMessage,
        );

    const subject = staged.valid
      ? resolvers.subject.resolve(
          record.subject,
        )
      : error(
          "Subject",
          validationMessage,
        );

    const level = staged.valid
      ? resolvers.level.resolve(
          record.level,
        )
      : error(
          "Level",
          validationMessage,
        );

    const resourceType = staged.valid
      ? resolvers.resourceType.resolve(
          record.resourceType,
        )
      : error(
          "ResourceType",
          validationMessage,
        );

    const language =
      !staged.valid
        ? error(
            "Language",
            validationMessage,
          )
        : record.language?.trim()
          ? resolvers.language.resolve(
              record.language,
            )
          : keep(
              "Language",
              "No language supplied",
            );

    const curriculum =
      !staged.valid
        ? error(
            "Curriculum",
            validationMessage,
          )
        : record.curriculum?.trim()
          ? resolvers.curriculum.resolve(
              record.curriculum,
            )
          : keep(
              "Curriculum",
              "No curriculum supplied",
            );

    const bookLine =
      !staged.valid
        ? error(
            "BookLine",
            validationMessage,
          )
        : record.bookLine?.trim()
          ? resolvers.bookLine.resolve({
              name: record.bookLine,
              publisherId:
                publisher.existingId,
            })
          : keep(
              "BookLine",
              "No book line supplied",
            );

    const author: ResolutionResult[] =
      staged.valid
        ? resolvers.author.resolve(
            record.authors,
          )
        : [
            error(
              "Author",
              validationMessage,
            ),
          ];

    const book = staged.valid
      ? resolvers.book.resolve({
          title: record.title,
          bookLineId:
            bookLine.existingId,
          isbn: record.isbn,
        })
      : error(
          "Book",
          validationMessage,
        );

    const results = [
      publisher,
      subject,
      level,
      resourceType,
      language,
      curriculum,
      bookLine,
      ...author,
      book,
    ];

    for (const result of results) {
      countResult(result, totals);
    }

    records.push({
      staged,
      publisher,
      subject,
      level,
      resourceType,
      language,
      curriculum,
      author,
      bookLine,
      book,
    });
  }

  return {
    totalRecords: records.length,
    plannedCreates: totals.creates,
    plannedUpdates: totals.updates,
    plannedKeeps: totals.keeps,
    plannedErrors: totals.errors,
    records,
  };
}