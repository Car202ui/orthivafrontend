"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/shared/query/provider";
import type { Order, OrderInput, OrderStatus } from "./types";

export const ordersKey = ["orders"] as const;
export const orderKey = (id: string) => [...ordersKey, "one", id] as const;

export function useOrders(params: { status?: OrderStatus | null; patientId?: string } = {}) {
  const call = useApi();
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.patientId) qs.set("patientId", params.patientId);
  const suffix = qs.size ? `?${qs}` : "";
  return useQuery({ queryKey: [...ordersKey, "list", suffix], queryFn: () => call<Order[]>(`/api/orders${suffix}`) });
}

export function useOrder(id: string) {
  const call = useApi();
  return useQuery({ queryKey: orderKey(id), queryFn: () => call<Order>(`/api/orders/${id}`) });
}

function useOrderMutation<TVars>(fn: (call: ReturnType<typeof useApi>, vars: TVars) => Promise<Order>) {
  const call = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: TVars) => fn(call, vars),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ordersKey }),
  });
}

export const useCreateOrder = () =>
  useOrderMutation<OrderInput>((call, input) => call("/api/orders", { method: "POST", body: JSON.stringify(input) }));

export const useUpdateOrder = (id: string) =>
  useOrderMutation<OrderInput>((call, input) => call(`/api/orders/${id}`, { method: "PUT", body: JSON.stringify(input) }));

export const useSubmitOrder = (id: string) =>
  useOrderMutation<void>((call) => call(`/api/orders/${id}/submit`, { method: "POST" }));

export const useCancelOrder = (id: string) =>
  useOrderMutation<void>((call) => call(`/api/orders/${id}/cancel`, { method: "POST", body: JSON.stringify({}) }));
