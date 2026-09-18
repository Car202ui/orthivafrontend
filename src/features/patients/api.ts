"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/shared/query/provider";
import type { DoctorSummary, Patient, PatientInput } from "./types";

export const patientsKey = ["patients"] as const;

export function usePatients(query = "") {
  const call = useApi();
  return useQuery({
    queryKey: [...patientsKey, query],
    queryFn: () => call<Patient[]>(`/api/patients${query ? `?q=${encodeURIComponent(query)}` : ""}`),
  });
}

export function usePatient(id: string) {
  const call = useApi();
  return useQuery({ queryKey: [...patientsKey, "one", id], queryFn: () => call<Patient>(`/api/patients/${id}`) });
}

export function useCreatePatient() {
  const call = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PatientInput) => call<Patient>("/api/patients", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: patientsKey }),
  });
}

export function useUpdatePatient(id: string) {
  const call = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PatientInput) => call<Patient>(`/api/patients/${id}`, { method: "PUT", body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: patientsKey }),
  });
}

/** Patient portal: the logged-in patient's care team. */
export function useMyDoctors() {
  const call = useApi();
  return useQuery({ queryKey: ["portal", "doctors"], queryFn: () => call<DoctorSummary[]>("/api/portal/doctors") });
}
