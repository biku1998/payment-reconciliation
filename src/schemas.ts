import { z } from "zod";

export const GatewayASchema = z.object({
  transactionId: z.string(),
  amount: z.number(),
  currency: z.string(),
  timestamp: z.string(),
  status: z.string(),
});

export const GatewayBSchema = z.object({
  id: z.string(),
  value: z.number(),
  time: z.number(),
  state: z.string(),
});

export const GatewayCSchema = z.object({
  uid: z.string(),
  totalAmount: z.string(),
  isoCurrency: z.string(),
  ts: z.string(),
  currentStatus: z.string(),
});

// Dynamic map
export const gatewaySchemas = {
  gateway_a: GatewayASchema,
  gateway_b: GatewayBSchema,
  gateway_c: GatewayCSchema,
} as const;

// For inference
export type GatewayId = keyof typeof gatewaySchemas;
