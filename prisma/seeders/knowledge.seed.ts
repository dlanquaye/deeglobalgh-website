import { PrismaClient } from "@prisma/client";
import {
  productFamilies,
  subjects,
  curriculumCategories,
  languageCategories,
  integratedActivityCategories,
  schoolReadinessCategories,
} from "../knowledge";




const prisma = new PrismaClient();

const nodes = [
  ...productFamilies,
  ...subjects,
  ...curriculumCategories,
  ...languageCategories,
  ...integratedActivityCategories,
  ...schoolReadinessCategories,
];

import { knowledgeRelationships } from "../knowledge";

export async function seedKnowledge() {
  console.log("🌱 Seeding Knowledge Graph...");

  for (const node of nodes) {
  console.log(`Seeding: ${node.slug}`);

  await prisma.knowledgeNode.upsert({
      where: {
        code: node.code,
      },
      update: {},
      create: node,
    });
  }

  console.log(`✅ Seeded ${nodes.length} knowledge nodes`);
  for (const relationship of knowledgeRelationships) {
  const source = await prisma.knowledgeNode.findUnique({
    where: {
      code: relationship.sourceCode,
    },
  });

  const target = await prisma.knowledgeNode.findUnique({
    where: {
      code: relationship.targetCode,
    },
  });

  if (!source || !target) {
    continue;
  }

  await prisma.knowledgeRelationship.upsert({
    where: {
      sourceId_targetId_relationshipType: {
        sourceId: source.id,
        targetId: target.id,
        relationshipType: relationship.relationshipType,
      },
    },
    update: {
      weight: relationship.weight,
    },
    create: {
      sourceId: source.id,
      targetId: target.id,
      relationshipType: relationship.relationshipType,
      weight: relationship.weight,
    },
  });
}

console.log(
  `✅ Seeded ${knowledgeRelationships.length} relationships`
);
}