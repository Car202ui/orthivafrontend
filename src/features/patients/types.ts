import type { Gender } from "@/shared/api/common";

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

export type DoctorSummary = {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string | null;
  since: string;
};
