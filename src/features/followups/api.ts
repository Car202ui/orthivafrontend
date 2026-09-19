"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/shared/query/provider";
import type { FollowUp, FollowUpInput } from "./types";

export const followUpsKey = (orderId: string) => ["follow-ups", orderId] as const;

export function useFollowUps(orderId: string) {
  const call = useApi();
  return useQuery({ queryKey: followUpsKey(orderId), queryFn: () => call<FollowUp[]>(`/api/orders/${orderId}/follow-ups`) });
}

/** Mutations invalidate the list and the order (the first check-up changes its status). */
function useFollowUpMutation<TVars, TResult>(orderId: string, fn: (call: ReturnType<typeof useApi>, vars: TVars) => Promise<TResult>) {
  const call = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: TVars) => fn(call, vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: followUpsKey(orderId) });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export const useCreateFollowUp = (orderId: string) =>
  useFollowUpMutation<FollowUpInput, FollowUp>(orderId, (call, input) =>
    call(`/api/orders/${orderId}/follow-ups`, { method: "POST", body: JSON.stringify(input) }),
  );

export const useUpdateFollowUp = (orderId: string) =>
  useFollowUpMutation<{ id: string; input: FollowUpInput }, FollowUp>(orderId, (call, { id, input }) =>
    call(`/api/follow-ups/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  );

export const useDeleteFollowUp = (orderId: string) =>
  useFollowUpMutation<string, void>(orderId, (call, id) => call(`/api/follow-ups/${id}`, { method: "DELETE" }));
