import { z } from "zod";

// Base transaction schema that all gateways must conform to after normalization
const BaseTransactionSchema = z.object({
  transactionId: z.string(),
  amount: z.number().positive(),
  currency: z.string().length(3),
  timestamp: z.string().datetime(),
  status: z.enum(["SUCCESS", "FAILED", "PENDING"]),
});

// Gateway-specific schemas matching their actual formats
const gatewaySchemas = {
  gateway_a: BaseTransactionSchema,
  gateway_b: z.object({
    id: z.string(),
    value: z.number(),
    time: z.number(),
    state: z.enum(["completed", "failed"]),
  }),
  gateway_c: z.object({
    uid: z.string(),
    totalAmount: z.string().transform((val) => parseFloat(val)),
    isoCurrency: z.string(),
    ts: z.string(),
    currentStatus: z.enum(["SUCCESS", "FAILED"]),
  }),
};

export type ValidatedTransaction = z.infer<typeof BaseTransactionSchema>;

type GatewayBTransaction = z.infer<typeof gatewaySchemas.gateway_b>;
type GatewayCTransaction = z.infer<typeof gatewaySchemas.gateway_c>;

function normalizeGatewayB(tx: GatewayBTransaction): ValidatedTransaction {
  return {
    transactionId: tx.id,
    amount: tx.value,
    currency: "USD", // Default currency for gateway B
    timestamp: new Date(tx.time * 1000).toISOString(),
    status: tx.state === "completed" ? "SUCCESS" : "FAILED",
  };
}

function normalizeGatewayC(tx: GatewayCTransaction): ValidatedTransaction {
  return {
    transactionId: tx.uid,
    amount: tx.totalAmount,
    currency: tx.isoCurrency,
    timestamp: tx.ts,
    status: tx.currentStatus,
  };
}

export function validatePayload(
  gatewayId: string,
  data: unknown
): ValidatedTransaction {
  const schema = gatewaySchemas[gatewayId as keyof typeof gatewaySchemas];

  if (!schema) {
    throw new Error(`Unknown gateway: ${gatewayId}`);
  }

  const validated = schema.parse(data);

  // Normalize to base schema if needed
  if (gatewayId === "gateway_b") {
    return normalizeGatewayB(validated as GatewayBTransaction);
  }
  if (gatewayId === "gateway_c") {
    return normalizeGatewayC(validated as GatewayCTransaction);
  }

  return validated as ValidatedTransaction;
}
