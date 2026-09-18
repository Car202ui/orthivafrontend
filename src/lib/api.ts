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
  tenant: { id: string; name: string; currency: string } | null;
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
