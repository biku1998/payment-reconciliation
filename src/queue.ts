import { NormalizedTransaction } from "./normalizer";

// Simple in-memory queue for demonstration
const queue: NormalizedTransaction[] = [];

export function enqueue(transaction: NormalizedTransaction): void {
  queue.push(transaction);
  console.log("📥 Transaction queued:", {
    id: transaction.id,
    gatewayId: transaction.gatewayId,
    amount: `${transaction.amount} ${transaction.currency}`,
    status: transaction.status,
    timestamp: transaction.timestamp.toISOString(),
  });
}

// Export queue for testing/monitoring
export function getQueue(): NormalizedTransaction[] {
  return [...queue];
}
