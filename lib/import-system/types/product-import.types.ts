export interface ProductImportRow {
  sku: string;
  name: string;
  slug: string;

  categorySlug: string;
  subcategorySlug: string;
  levelSlugs?: string[];

  brand?: string;

  retailPrice: number;
  wholesalePrice?: number;
  distributorPrice?: number;

  stockQuantity: number;

  imageSrc: string;
  imageAlt?: string;

  shortSummary?: string;
  fullDescription?: string;

  focusKeyphrase?: string;
  metaTitle?: string;
  metaDescription?: string;

  tags?: string[];

  isActive?: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ProductValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ImportReport {
  totalRows: number;

  successfulImports: number;
  failedImports: number;

  duplicateSKUs: number;
  duplicateSlugs: number;

  missingFields: number;

  invalidCategories: number;
  invalidSubcategories: number;

  validationFailures: number;
}