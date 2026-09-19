import type { Address, Gender } from "@/shared/api/common";

export type { Address, Gender };

export type PersonType =
  | "ADMIN"
  | "DOCTOR"
  | "PATIENT"
  | "LAB"
  | "PLANNER"
  | "PRODUCTION"
  | "ACCOUNTING"
  | "REPRESENTATIVE";

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
  hasLogin: boolean;
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
  tenant: { id: string; name: string; currency: string; diagnosisPrice: number; agreementText: string | null } | null;
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

export type StaffInput = {
  email: string;
  firstName: string;
  lastName: string;
  type: PersonType;
  temporaryPassword: string;
};

export const STAFF_TYPES: PersonType[] = ["LAB", "PLANNER", "PRODUCTION", "ACCOUNTING", "REPRESENTATIVE"];
