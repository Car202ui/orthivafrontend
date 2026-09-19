"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/shared/query/provider";
import type { ApprovalInput, Plan, PlanInput } from "./types";

export const plansKey = (orderId: string) => ["plans", orderId] as const;

export function usePlans(orderId: string) {
  const call = useApi();
  return useQuery({ queryKey: plansKey(orderId), queryFn: () => call<Plan[]>(`/api/orders/${orderId}/plans`) });
}

/** Mutations on an order's plans; invalidates the plans list, the order (status changes) and its payments. */
function usePlanMutation<TVars>(orderId: string, fn: (call: ReturnType<typeof useApi>, vars: TVars) => Promise<Plan>) {
  const call = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: TVars) => fn(call, vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: plansKey(orderId) });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["payments", orderId] });
    },
  });
}

// ---- laboratory ---------------------------------------------------------------------

export const useStartPlanning = (orderId: string) =>
  usePlanMutation<void>(orderId, (call) => call(`/api/orders/${orderId}/plans`, { method: "POST" }));

export const useSavePlan = (orderId: string) =>
  usePlanMutation<{ planId: string; input: PlanInput }>(orderId, (call, { planId, input }) =>
    call(`/api/plans/${planId}`, { method: "PUT", body: JSON.stringify(input) }),
  );

export const useSendPlan = (orderId: string) =>
  usePlanMutation<string>(orderId, (call, planId) => call(`/api/plans/${planId}/send`, { method: "POST" }));

// ---- doctor review (lab may also reply in the thread) ----------------------------------

/** Doctor's comment on the plan under review moves the order to CHANGES_REQUESTED. */
export const useCommentPlan = (orderId: string) =>
  usePlanMutation<{ planId: string; body: string }>(orderId, (call, { planId, body }) =>
    call(`/api/plans/${planId}/comments`, { method: "POST", body: JSON.stringify({ body }) }),
  );

export const useApprovePlan = (orderId: string) =>
  usePlanMutation<{ planId: string; input: ApprovalInput }>(orderId, (call, { planId, input }) =>
    call(`/api/plans/${planId}/approve`, { method: "POST", body: JSON.stringify(input) }),
  );

export const useRejectPlan = (orderId: string) =>
  usePlanMutation<{ planId: string; reason: string }>(orderId, (call, { planId, reason }) =>
    call(`/api/plans/${planId}/reject`, { method: "POST", body: JSON.stringify({ body: reason }) }),
  );
