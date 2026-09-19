export type PaymentStatus = "PENDING" | "APPROVED" | "DECLINED" | "REFUNDED" | "ERROR";

export type Payment = {
  id: string;
  orderId: string;
  planId: string | null;
  purpose: "DIAGNOSIS" | "TREATMENT";
  status: PaymentStatus;
  amount: number;
  currency: string;
  gateway: string;
  gatewayReference: string | null;
  paidAt: string | null;
  createdAt: string;
};

/** Where the core sends the payer after POST /api/payments/{id}/checkout. */
export type CheckoutSession = { paymentId: string; gateway: string; reference: string; checkoutUrl: string };
