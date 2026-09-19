"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/shared/api/client";
import { useApi } from "@/shared/query/provider";
import type { CheckoutSession, Payment } from "./types";

export const paymentsKey = (orderId: string) => ["payments", orderId] as const;
export const paymentKey = (id: string) => ["payments", "one", id] as const;

export function usePayments(orderId: string) {
  const call = useApi();
  return useQuery({ queryKey: paymentsKey(orderId), queryFn: () => call<Payment[]>(`/api/payments?orderId=${orderId}`) });
}

/** One payment; with `poll` the return page keeps asking until the provider's webhook lands. */
export function usePayment(id: string, options: { poll?: boolean } = {}) {
  const call = useApi();
  return useQuery({
    queryKey: paymentKey(id),
    queryFn: () => call<Payment>(`/api/payments/${id}`),
    refetchInterval: options.poll ? (query) => (query.state.data?.status === "PENDING" ? 2000 : false) : false,
  });
}

/** Opens a checkout at the active gateway (Wompi, or the dev Mock page) and returns the URL to redirect to. */
export function useCheckout() {
  const call = useApi();
  return useMutation({
    mutationFn: ({ paymentId, returnUrl }: { paymentId: string; returnUrl: string }) =>
      call<CheckoutSession>(`/api/payments/${paymentId}/checkout`, { method: "POST", body: JSON.stringify({ returnUrl }) }),
  });
}

/** Dev Mock gateway page: reports the tester's decision to the core. Public endpoint, no token. */
export function useMockWebhook() {
  return useMutation({
    mutationFn: ({ reference, status }: { reference: string; status: "APPROVED" | "DECLINED" }) =>
      api<{ status: string }>("/api/payments/webhooks/mock", undefined, { method: "POST", body: JSON.stringify({ reference, status }) }),
  });
}
