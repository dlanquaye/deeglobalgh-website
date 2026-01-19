import fs from "fs";
import path from "path";

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// CSV parser supporting quoted fields
function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }

    cur += ch;
  }

  out.push(cur);
  return out.map((s) => s.trim());
}

function parseCsv(content) {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const headers = parseCsvLine(lines[0]);

  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? "";
    });
    return row;
  });

  return rows;
}

function normalizePrice(value) {
  const n = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function normalizeImagePath(imagePath, imageFile) {
  let p = String(imagePath || "").trim();

  // if ImagePath is missing, use imageFile
  if (!p) {
    const f = String(imageFile || "").trim();
    if (f) p = `/products/${f}`;
  }

  if (!p) return "/products/placeholder.webp";

  // ✅ convert Windows slashes to web slashes
  p = p.replace(/\\/g, "/");

  // ✅ ensure it starts with /
  if (!p.startsWith("/")) p = `/${p}`;

  return p;
}


function normalizeLevelSlugs(LevelSlugs, Level1, Level2, Level3) {
  const existing = String(LevelSlugs || "").trim();
  if (existing) {
    return existing
      .split("|")
      .map((x) => x.trim())
      .filter(Boolean)
      .map((x) => slugify(x));
  }

  return [Level1, Level2, Level3]
    .map((x) => slugify(x))
    .filter(Boolean);
}

function normalizeTags(category, brand, levelSlugs) {
  const tags = new Set();

  if (category) tags.add(String(category).toLowerCase());
  if (brand) tags.add(String(brand).toLowerCase());
  if (Array.isArray(levelSlugs)) {
    levelSlugs.forEach((l) => tags.add(String(l).toLowerCase()));
  }

  return Array.from(tags)
    .map((t) => t.replace(/\s+/g, "-"))
    .filter(Boolean);
}

// MAIN
const csvPath = path.join(process.cwd(), "products.csv");

if (!fs.existsSync(csvPath)) {
  console.error("❌ products.csv not found in your project root.");
  console.error("✅ Put products.csv here:", csvPath);
  process.exit(1);
}

const csv = fs.readFileSync(csvPath, "utf8");
const rows = parseCsv(csv);

const products = rows.map((r) => {
  const id = String(r.id || "").trim();
  const name = String(r.ProductName || "").trim();

  const brand = String(r.Brand || "").trim() || "DeeglobalGh";
  const price = normalizePrice(r.OnlinePriceGHS);

  const categorySlug =
    String(r.CategorySlug || "").trim() || slugify(r.Category) || "textbooks";

  const levelSlugs = normalizeLevelSlugs(r.LevelSlugs, r.Level1, r.Level2, r.Level3);

  const imageSrc = normalizeImagePath(r.ImagePath, r.imageFile);

  const imageAlt =
    String(r.AltText || "").trim() || (name ? `${name} product image` : "DeeglobalGh product");

  const slug = slugify(name) || slugify(id);

  const tags = normalizeTags(r.Category, brand, levelSlugs);

  const shopSearchText = String(r.ShopSearchText || "").trim();

  return {
    id,
    slug,
    name,
    price,
    categorySlug,
    levelSlugs,
    image: {
      src: imageSrc,
      alt: imageAlt,
      title: name || "Product image",
      caption: "",
      description: "",
    },
    seo: {
      focusKeyphrase: name ? `${name} in Ghana` : "",
      metaTitle: name ? `${name} | DeeglobalGh` : "DeeglobalGh Product",
      metaDescription: name
        ? `Buy ${name} in Ghana from DeeglobalGh. Available for delivery.`
        : "Buy school items in Ghana from DeeglobalGh.",
      socialTitle: name ? `${name} | DeeglobalGh` : "DeeglobalGh",
      socialDescription: name
        ? `Order ${name} online for delivery in Kasoa and nearby areas.`
        : "Order online for delivery in Kasoa and nearby areas.",
      shortSummary: shopSearchText || "",
      fullDescription: "",
      tags,
      brand,
    },
  };
});

// Remove bad rows
const cleaned = products.filter((p) => p.id && p.name && p.slug);

const output = `import type { Product } from "@/app/lib/products";

export const generatedProducts: Product[] = ${JSON.stringify(cleaned, null, 2)};
`;

const outPath = path.join(process.cwd(), "scripts", "products.generated.ts");
fs.writeFileSync(outPath, output, "utf8");

console.log(`✅ Done. Generated ${cleaned.length} products.`);
console.log("📄 Output:", outPath);
