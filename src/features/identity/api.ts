"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/shared/auth/provider";
import { useApi } from "@/shared/query/provider";
import type { Me, Person, PersonType, ProfileInput, StaffInput } from "./types";

export const meKey = ["me"] as const;
const staffKey = ["admin", "users"] as const;

/** Who the backend says I am; drives onboarding and role-based navigation. */
export function useMe() {
  const auth = useAuth();
  const call = useApi();
  return useQuery({
    queryKey: [...meKey, auth.user?.profile.sub],
    queryFn: () => call<Me>("/api/me"),
    enabled: auth.isAuthenticated,
  });
}

export function useOnboard() {
  const call = useApi();
  return useMutation({
    mutationFn: (body: { type: PersonType; profile: ProfileInput }) =>
      call<Person>("/api/me/onboarding", { method: "POST", body: JSON.stringify(body) }),
  });
}

export function useUpdateProfile() {
  const call = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfileInput) => call<Person>("/api/me/profile", { method: "PUT", body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: meKey }),
  });
}

export function useStaff(enabled: boolean) {
  const call = useApi();
  return useQuery({ queryKey: staffKey, queryFn: () => call<Person[]>("/api/admin/users"), enabled });
}

export function useCreateStaff() {
  const call = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StaffInput) => call<Person>("/api/admin/users", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: staffKey }),
  });
}
