export class EducationStageNameResolver {
  resolve(
    levelName: string,
  ): string {
    const value =
      levelName
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
      return "Early Childhood";
    }

    if (
      value.includes("jhs") ||
      value.includes("junior high") ||
      value.includes("junior secondary")
    ) {
      return "Junior High School";
    }

    if (
      value.includes("shs") ||
      value.includes("senior high") ||
      value.includes("senior secondary")
    ) {
      return "Senior High School";
    }

    if (
      value.includes("tvet") ||
      value.includes("technical") ||
      value.includes("vocational")
    ) {
      return "Technical and Vocational Education";
    }

    if (
      value.includes("tertiary") ||
      value.includes("university") ||
      value.includes("polytechnic") ||
      value.includes("college")
    ) {
      return "Tertiary Education";
    }

    return "Primary Education";
  }
}