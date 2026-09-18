/** Value types shared by several features (mirror the core's shared enums/records). */
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
