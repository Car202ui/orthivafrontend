const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

/** Error shape of the core's problem+json responses (see GlobalExceptionHandler). */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public errors?: string[],
  ) {
    super(message);
  }
}

/** Thin fetch wrapper for the core API: JSON in/out, bearer token, problem+json errors. */
export async function api<T>(path: string, accessToken: string | undefined, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    let detail = res.statusText;
    let code: string | undefined;
    let errors: string[] | undefined;
    try {
      const problem = await res.json();
      detail = problem.detail ?? problem.title ?? detail;
      code = problem.code;
      errors = problem.errors;
    } catch {
      /* not JSON */
    }
    throw new ApiError(res.status, detail, code, errors);
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

// ---------------------------------------------------------------- types (mirror core DTOs)

export type PersonType =
  | "ADMIN"
  | "DOCTOR"
  | "PATIENT"
  | "LAB"
  | "PLANNER"
  | "PRODUCTION"
  | "ACCOUNTING"
  | "REPRESENTATIVE";

export type Gender = "F" | "M" | "X";

export type Address = {
  id?: string;
  country: string;
  stateProvince?: string | null;
  city: string;
  postalCode?: string | null;
  line1: string;
  line2?: string | null;
  reference?: string | null;
};

export type Person = {
  id: string;
  tenantId: string | null;
  type: PersonType;
  firstName: string;
  lastName: string;
  email: string | null;
  phoneCountry: string | null;
  phoneNumber: string | null;
  locale: string;
  gender: Gender | null;
  documentId: string | null;
  birthDate: string | null;
  specialty: string | null;
  licenseNumber: string | null;
  licenseCountry: string | null;
  verifiedAt: string | null;
  profileCompleted: boolean;
  active: boolean;
  address: Address | null;
};

export type Me = {
  subject: string;
  username: string;
  email: string;
  name: string | null;
  roles: string[];
  onboardingRequired: boolean;
  person: Person | null;
  tenant: { id: string; name: string; currency: string; diagnosisPrice: number } | null;
};

export type Clinic = {
  id: string;
  name: string;
  website: string | null;
  phoneCountry: string | null;
  phoneNumber: string | null;
  address: Address | null;
};

export type ClinicInput = {
  name: string;
  website?: string;
  phoneCountry?: string;
  phoneNumber?: string;
  address: Address;
};

export type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  documentId: string | null;
  birthDate: string | null;
  gender: Gender | null;
  phoneCountry: string | null;
  phoneNumber: string | null;
  hasLogin: boolean;
  active: boolean;
};

export type PatientInput = {
  firstName: string;
  lastName: string;
  email?: string;
  documentId?: string;
  birthDate?: string | null;
  gender?: Gender | null;
  phoneCountry?: string;
  phoneNumber?: string;
};

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

export type MediaKind =
  | "PHOTO_FRONTAL"
  | "PHOTO_PROFILE"
  | "PHOTO_SMILE"
  | "PHOTO_INTRAORAL_UPPER"
  | "PHOTO_INTRAORAL_LOWER"
  | "PHOTO_INTRAORAL_RIGHT"
  | "PHOTO_INTRAORAL_LEFT"
  | "PHOTO_INTRAORAL_FRONTAL"
  | "XRAY_PANORAMIC"
  | "XRAY_LATERAL"
  | "VIDEO"
  | "STL"
  | "PDF"
  | "MODEL3D_BEFORE_LEFT"
  | "MODEL3D_BEFORE_FRONTAL"
  | "MODEL3D_BEFORE_RIGHT"
  | "MODEL3D_AFTER_LEFT"
  | "MODEL3D_AFTER_FRONTAL"
  | "MODEL3D_AFTER_RIGHT"
  | "UPPER_BEFORE"
  | "UPPER_AFTER"
  | "UPPER_MOVEMENT"
  | "LOWER_BEFORE"
  | "LOWER_AFTER"
  | "LOWER_MOVEMENT"
  | "FOLLOW_UP_PHOTO"
  | "OTHER";

export type KindGroup = { group: string; kinds: MediaKind[] };

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

export type Stage = { id?: string; stageNumber: number; arch: "UPPER" | "LOWER"; description?: string | null; cost?: number | null };

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

export const PRESCRIPTION_KINDS: { group: "photos" | "xrays" | "other"; kinds: MediaKind[] }[] = [
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

export type Media = {
  id: string;
  kind: MediaKind;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  widthPx: number | null;
  heightPx: number | null;
  url: string;
  thumbnailUrl: string | null;
  createdAt: string;
};

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

export type Payment = {
  id: string;
  orderId: string;
  planId: string | null;
  purpose: "DIAGNOSIS" | "TREATMENT";
  status: "PENDING" | "APPROVED" | "DECLINED" | "REFUNDED" | "ERROR";
  amount: number;
  currency: string;
  gateway: string;
  gatewayReference: string | null;
  paidAt: string | null;
  createdAt: string;
};

export type DoctorSummary = {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string | null;
  since: string;
};

export type ProfileInput = {
  firstName: string;
  lastName: string;
  phoneCountry?: string;
  phoneNumber?: string;
  locale?: string;
  gender?: Gender | null;
  documentId?: string;
  birthDate?: string | null;
  specialty?: string;
  licenseNumber?: string;
  licenseCountry?: string;
  address?: Address | null;
};
