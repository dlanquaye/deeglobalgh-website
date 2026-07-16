import { knowledgeRepository } from "./repository";
import {
  CreateKnowledgeNodeInput,
  CreateKnowledgeRelationshipInput,
} from "./types";

export class KnowledgeService {
  async createNode(data: CreateKnowledgeNodeInput) {
    return knowledgeRepository.createNode(data);
  }

  async createRelationship(data: CreateKnowledgeRelationshipInput) {
    return knowledgeRepository.createRelationship(data);
  }

  async getNode(id: string) {
    return knowledgeRepository.getNodeById(id);
  }

  async getNodeByCode(code: string) {
    return knowledgeRepository.getNodeByCode(code);
  }

  async getNodeBySlug(slug: string) {
    return knowledgeRepository.getNodeBySlug(slug);
  }

  async listNodes() {
    return knowledgeRepository.listNodes();
  }

  async getRecommendations(nodeId: string) {
    return knowledgeRepository.getOutgoingRelationships(nodeId);
  }
}

export const knowledgeService = new KnowledgeService();