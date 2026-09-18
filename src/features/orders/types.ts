import type { KindGroup, Media } from "@/shared/media/types";

export type OrderStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "DIAGNOSIS_PAID"
  | "IN_PLANNING"
  | "PLAN_SENT"
  | "CHANGES_REQUESTED"
  | "APPROVED"
  | "TREATMENT_PAID"
  | "IN_PRODUCTION"
  | "SHIPPED"
  | "IN_FOLLOW_UP"
  | "CLOSED"
  | "REJECTED"
  | "CANCELLED";

export const ORDER_STATUSES: OrderStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "DIAGNOSIS_PAID",
  "IN_PLANNING",
  "PLAN_SENT",
  "CHANGES_REQUESTED",
  "APPROVED",
  "TREATMENT_PAID",
  "IN_PRODUCTION",
  "SHIPPED",
  "IN_FOLLOW_UP",
  "CLOSED",
  "REJECTED",
  "CANCELLED",
];

export type Arch = "UPPER" | "LOWER" | "BOTH";

/** File kinds a doctor attaches to a prescription, grouped for the uploader. */
export const PRESCRIPTION_KINDS: KindGroup[] = [
  {
    group: "photos",
    kinds: [
      "PHOTO_FRONTAL",
      "PHOTO_PROFILE",
      "PHOTO_SMILE",
      "PHOTO_INTRAORAL_UPPER",
      "PHOTO_INTRAORAL_LOWER",
      "PHOTO_INTRAORAL_RIGHT",
      "PHOTO_INTRAORAL_LEFT",
      "PHOTO_INTRAORAL_FRONTAL",
    ],
  },
  { group: "xrays", kinds: ["XRAY_PANORAMIC", "XRAY_LATERAL"] },
  { group: "other", kinds: ["STL", "VIDEO", "PDF", "OTHER"] },
];

export type Movement = {
  id?: string;
  toothFdi: number | null;
  torque?: string | null;
  rotation?: string | null;
  buccolingual?: string | null;
  mesiodistal?: string | null;
  intrusionExtrusion?: string | null;
  notes?: string | null;
};

export type OrderHistory = {
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  changedBy: string | null;
  changedByName: string | null;
  note: string | null;
  changedAt: string;
};

export type Order = {
  id: string;
  orderNumber: number;
  status: OrderStatus;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  clinicId: string | null;
  arch: Arch;
  firstTime: boolean;
  reevaluation: boolean;
  treatmentGoal: string | null;
  diagnosisPrice: number | null;
  currency: string | null;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  movements: Movement[];
  media: Media[];
  history: OrderHistory[];
};

export type OrderInput = {
  patientId: string;
  clinicId?: string | null;
  arch: Arch;
  firstTime: boolean;
  reevaluation: boolean;
  treatmentGoal?: string;
  movements: Movement[];
};
