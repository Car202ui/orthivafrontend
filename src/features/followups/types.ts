import type { KindGroup, Media } from "@/shared/media/types";

export type FollowUp = {
  id: string;
  orderId: string;
  visitDate: string;
  treatmentMonth: number;
  notes: string | null;
  recordedBy: string | null;
  recordedByName: string | null;
  createdAt: string;
  media: Media[];
};

export type FollowUpInput = { visitDate: string; treatmentMonth: number; notes?: string };

/** Only photos and X-rays may document a check-up. */
export const FOLLOW_UP_KINDS: KindGroup[] = [
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
];
