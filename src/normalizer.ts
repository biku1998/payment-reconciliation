import { ValidatedTransaction } from "./validator";

export interface NormalizedTransaction {
  id: string;
  gatewayId: string;
  amount: number;
  currency: string;
  timestamp: Date;
  status: "SUCCESS" | "FAILED";
  source: "gateway" | "ledger";
  raw: ValidatedTransaction;
}

export function normalizeTransaction(
  gatewayId: string,
  transaction: ValidatedTransaction
): NormalizedTransaction {
  return {
    id: transaction.transactionId,
    gatewayId,
    amount: transaction.amount,
    currency: transaction.currency.toUpperCase(),
    timestamp: new Date(transaction.timestamp),
    status: transaction.status === "PENDING" ? "FAILED" : transaction.status,
    source: "gateway",
    raw: transaction,
  };
}
