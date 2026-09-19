import type { Address } from "@/shared/api/common";
import type { KindGroup, Media } from "@/shared/media/types";

export type Stage = { id?: string; stageNumber: number; arch: "UPPER" | "LOWER"; description?: string | null; cost?: number | null };

export type PlanComment = { id: string; authorId: string; authorName: string | null; body: string; createdAt: string };

/** Snapshot taken when the doctor approved: shipping target + the agreement text accepted. */
export type PlanApproval = {
  id: string;
  approvedBy: string;
  approvedByName: string | null;
  shipToClinicName: string;
  shipAddress: Address;
  shippingInstructions: string | null;
  agreementText: string;
  approvedAt: string;
};

export type Plan = {
  id: string;
  orderId: string;
  version: number;
  sent: boolean;
  plannerId: string | null;
  plannerName: string | null;
  diagnosis: string | null;
  additionalInfo: string | null;
  upperStages: number | null;
  lowerStages: number | null;
  priceUpper: number | null;
  priceLower: number | null;
  priceTotal: number | null;
  currency: string;
  stlUploadedAt: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
  stages: Stage[];
  media: Media[];
  comments: PlanComment[];
  approval: PlanApproval | null;
};

export type PlanInput = {
  diagnosis?: string;
  additionalInfo?: string;
  upperStages?: number | null;
  lowerStages?: number | null;
  priceUpper?: number | null;
  priceLower?: number | null;
  priceTotal?: number | null;
  stages: Stage[];
};

export type ApprovalInput = {
  shipToClinicName: string;
  address: Address;
  shippingInstructions?: string;
  agreementAccepted: boolean;
};

/** File kinds the lab attaches to a plan, grouped for the uploader. */
export const PLAN_KINDS: KindGroup[] = [
  {
    group: "model3d",
    kinds: [
      "MODEL3D_BEFORE_LEFT",
      "MODEL3D_BEFORE_FRONTAL",
      "MODEL3D_BEFORE_RIGHT",
      "MODEL3D_AFTER_LEFT",
      "MODEL3D_AFTER_FRONTAL",
      "MODEL3D_AFTER_RIGHT",
    ],
  },
  { group: "arches", kinds: ["UPPER_BEFORE", "UPPER_AFTER", "UPPER_MOVEMENT", "LOWER_BEFORE", "LOWER_AFTER", "LOWER_MOVEMENT"] },
  { group: "other", kinds: ["PDF", "STL"] },
];
