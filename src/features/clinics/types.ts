import type { Address } from "@/shared/api/common";

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
