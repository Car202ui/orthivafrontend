"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ApiError } from "./client";

/**
 * Standard error toast for mutations: translated message when the core sent a
 * known `code`, raw detail otherwise. Typed as `Error` so it fits `mutate()` callbacks.
 */
export function useApiErrorToast() {
  const t = useTranslations();
  return (e: Error) => {
    const err = e as ApiError;
    toast.error(err.code ? t(`errors.${err.code}`) : err.message);
  };
}
