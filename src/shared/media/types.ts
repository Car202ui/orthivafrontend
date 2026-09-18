/** Mirrors the core's media_kind enum. */
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
