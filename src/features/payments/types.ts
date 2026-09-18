export type Payment = {
  id: string;
  orderId: string;
  planId: string | null;
  purpose: "DIAGNOSIS" | "TREATMENT";
  status: "PENDING" | "APPROVED" | "DECLINED" | "REFUNDED" | "ERROR";
  amount: number;
  currency: string;
  gateway: string;
  gatewayReference: string | null;
  paidAt: string | null;
  createdAt: string;
};
