export interface NormalizedTransaction {
  id: string;
  gatewayId: string;
  amount: number;
  currency: string;
  status: "SUCCESS" | "FAILED";
  timestamp: Date;
  source: "gateway" | "ledger";
  raw?: unknown;
}
