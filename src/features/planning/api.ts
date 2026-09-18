"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/shared/query/provider";
import type { Plan, PlanInput } from "./types";

export const plansKey = (orderId: string) => ["plans", orderId] as const;

export function usePlans(orderId: string) {
  const call = useApi();
  return useQuery({ queryKey: plansKey(orderId), queryFn: () => call<Plan[]>(`/api/orders/${orderId}/plans`) });
}

/** Mutations on an order's plans; invalidates the plans list and the order (status changes). */
function usePlanMutation<TVars>(orderId: string, fn: (call: ReturnType<typeof useApi>, vars: TVars) => Promise<Plan>) {
  const call = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: TVars) => fn(call, vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: plansKey(orderId) });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export const useStartPlanning = (orderId: string) =>
  usePlanMutation<void>(orderId, (call) => call(`/api/orders/${orderId}/plans`, { method: "POST" }));

export const useSavePlan = (orderId: string) =>
  usePlanMutation<{ planId: string; input: PlanInput }>(orderId, (call, { planId, input }) =>
    call(`/api/plans/${planId}`, { method: "PUT", body: JSON.stringify(input) }),
  );

export const useSendPlan = (orderId: string) =>
  usePlanMutation<string>(orderId, (call, planId) => call(`/api/plans/${planId}/send`, { method: "POST" }));
