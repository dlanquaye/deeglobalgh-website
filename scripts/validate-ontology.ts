import {
  productFamilies,
  subjects,
  curriculumCategories,
  languageCategories,
  integratedActivityCategories,
  schoolReadinessCategories,
} from "../prisma/knowledge";

const nodes = [
  ...productFamilies,
  ...subjects,
  ...curriculumCategories,
  ...languageCategories,
  ...integratedActivityCategories,
  ...schoolReadinessCategories,
];

const slugMap = new Map<string, string>();
const codeMap = new Map<string, string>();
const nameMap = new Map<string, string>();

let errors = 0;

for (const node of nodes) {
  if (slugMap.has(node.slug)) {
    console.error(
      `❌ Duplicate slug: ${node.slug}\n   ${slugMap.get(node.slug)}\n   ${node.code}`
    );
    errors++;
  } else {
    slugMap.set(node.slug, node.code);
  }

  if (codeMap.has(node.code)) {
    console.error(`❌ Duplicate code: ${node.code}`);
    errors++;
  } else {
    codeMap.set(node.code, node.slug);
  }

  const nameKey = node.name.trim().toLowerCase();

  if (nameMap.has(nameKey)) {
    console.error(
      `❌ Duplicate name: ${node.name}\n   ${nameMap.get(nameKey)}\n   ${node.code}`
    );
    errors++;
  } else {
    nameMap.set(nameKey, node.code);
  }
}

console.log("");

console.log(`Nodes: ${nodes.length}`);
console.log(`Errors: ${errors}`);

if (errors === 0) {
  console.log("✅ Ontology validation passed.");
} else {
  process.exit(1);
}