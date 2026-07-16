export type EducationStage =
  | "PRESCHOOL"
  | "PRIMARY"
  | "JHS"
  | "SHS";

export interface EducationLevel {
  id: string;
  name: string;
  slug: string;
  stage: EducationStage;
  order: number;
  aliases?: string[];
}

export interface Subject {
  id: string;
  name: string;
  slug: string;
  stages: EducationStage[];
}

export interface SubjectResolution {
  subjectId: string;
  aliases: string[];
}

export interface BookSeries {
  id: string;
  name: string;
  slug: string;
  stages: EducationStage[];
}

export interface Publisher {
  id: string;
  name: string;
  slug: string;
}

export interface Author {
  id: string;
  name: string;
  aliases?: string[];
}