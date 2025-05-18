import path from "path";
import fs from "fs";
import { createObjectCsvWriter } from "csv-writer";
import { NormalizedTransaction } from "./types";

const logsDir = path.join(__dirname, "../logs");
const filePath = path.join(logsDir, "reconciliation_results.csv");

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create a fresh CSV file with headers
if (fs.existsSync(filePath)) {
  fs.unlinkSync(filePath); // Remove existing file to ensure headers are written
}

const csvWriter = createObjectCsvWriter({
  path: filePath,
  header: [
    { id: "id", title: "Transaction ID" },
    { id: "gatewayId", title: "Gateway ID" },
    { id: "amount", title: "Amount" },
    { id: "currency", title: "Currency" },
    { id: "status", title: "Status" },
    { id: "timestamp", title: "Timestamp" },
    { id: "source", title: "Source" },
    { id: "reconciliation_result", title: "Reconciliation Result" },
  ],
});

export async function logReconciliationResult(
  txn: NormalizedTransaction,
  reconciliation_result: "RECONCILED" | "DISCREPANCY" | "MISSING"
) {
  const record = {
    id: txn.id,
    gatewayId: txn.gatewayId,
    amount: txn.amount,
    currency: txn.currency,
    status: txn.status,
    timestamp: txn.timestamp.toISOString(),
    source: txn.source,
    reconciliation_result,
  };

  await csvWriter.writeRecords([record]);
}
