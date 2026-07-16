import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  CreateKnowledgeNodeInput,
  CreateKnowledgeRelationshipInput,
} from "./types";

export class KnowledgeRepository {
  async createNode(data: CreateKnowledgeNodeInput) {
    return prisma.knowledgeNode.create({
      data,
    });
  }

  async getNodeById(id: string) {
    return prisma.knowledgeNode.findUnique({
      where: { id },
    });
  }

  async getNodeByCode(code: string) {
    return prisma.knowledgeNode.findUnique({
      where: { code },
    });
  }

  async getNodeBySlug(slug: string) {
    return prisma.knowledgeNode.findUnique({
      where: { slug },
    });
  }

  async listNodes() {
    return prisma.knowledgeNode.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }

  async createRelationship(data: CreateKnowledgeRelationshipInput) {
    return prisma.knowledgeRelationship.create({
      data,
    });
  }

  async getOutgoingRelationships(nodeId: string) {
    return prisma.knowledgeRelationship.findMany({
      where: {
        sourceId: nodeId,
      },
      include: {
        target: true,
      },
    });
  }

  async getIncomingRelationships(nodeId: string) {
    return prisma.knowledgeRelationship.findMany({
      where: {
        targetId: nodeId,
      },
      include: {
        source: true,
      },
    });
  }

  async deleteNode(id: string) {
    return prisma.knowledgeNode.delete({
      where: { id },
    });
  }
}

export const knowledgeRepository = new KnowledgeRepository();