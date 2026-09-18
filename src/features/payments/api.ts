"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/shared/query/provider";
import type { Payment } from "./types";

export const paymentsKey = (orderId: string) => ["payments", orderId] as const;

export function usePayments(orderId: string) {
  const call = useApi();
  return useQuery({ queryKey: paymentsKey(orderId), queryFn: () => call<Payment[]>(`/api/payments?orderId=${orderId}`) });
}

/** Dev mock gateway until 1.6 wires Wompi. Invalidates the order too (its status advances). */
export function useMockPay(orderId: string) {
  const call = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: string) => call<Payment>(`/api/payments/${paymentId}/mock-approve`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentsKey(orderId) });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
