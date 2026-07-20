import {
  ApprovalStatus,
  Prisma,
  PrismaClient,
} from "@prisma/client";

export interface UpsertApprovedTextbookInput {
  educationalEditionId: string;

  curriculumVersionId: string;

  approvalBodyId: string;

  approvalStatus?: ApprovalStatus;

  approvalReference?: string;

  approvalDate?: Date;

  expiryDate?: Date;

  notes?: string;
}

export class ApprovedTextbookService {
  constructor(
    private readonly prisma: PrismaClient | Prisma.TransactionClient,
  ) {}

  async upsert(input: UpsertApprovedTextbookInput) {
    return this.prisma.approvedTextbook.upsert({
      where: {
        educationalEditionId_curriculumVersionId_approvalBodyId: {
          educationalEditionId: input.educationalEditionId,

          curriculumVersionId: input.curriculumVersionId,

          approvalBodyId: input.approvalBodyId,
        },
      },

      create: {
        educationalEditionId: input.educationalEditionId,

        curriculumVersionId: input.curriculumVersionId,

        approvalBodyId: input.approvalBodyId,

        approvalStatus: input.approvalStatus ?? ApprovalStatus.PENDING,

        approvalReference: input.approvalReference,

        approvalDate: input.approvalDate,

        expiryDate: input.expiryDate,

        notes: input.notes,
      },

      update: {
        approvalStatus: input.approvalStatus ?? ApprovalStatus.PENDING,

        approvalReference: input.approvalReference,

        approvalDate: input.approvalDate,

        expiryDate: input.expiryDate,

        notes: input.notes,
      },
    });
  }
}