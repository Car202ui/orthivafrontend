"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/shared/query/provider";
import type { Clinic, ClinicInput } from "./types";

export const clinicsKey = ["clinics"] as const;

export function useClinics() {
  const call = useApi();
  return useQuery({ queryKey: clinicsKey, queryFn: () => call<Clinic[]>("/api/clinics") });
}

export function useSaveClinic() {
  const call = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: ClinicInput }) =>
      id
        ? call<Clinic>(`/api/clinics/${id}`, { method: "PUT", body: JSON.stringify(input) })
        : call<Clinic>("/api/clinics", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clinicsKey }),
  });
}

export function useDeleteClinic() {
  const call = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => call<void>(`/api/clinics/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clinicsKey }),
  });
}
