import fs from "fs";
import path from "path";
import csv from "csv-parser";

export interface LedgerEntry {
  transaction_id: string;
  date: string;
  customer_id: string;
  amount: number;
  type: string;
  description: string;
  gateway_id: string;
  status?: "PENDING" | "RECONCILED" | "FAILED"; // Optional for future use
}

const ledger = new Map<string, LedgerEntry>();

const filePath = path.join(
  __dirname,
  "./enrich-ledger/enriched_transactions.csv"
);

export function loadLedger(): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        const entry: LedgerEntry = {
          transaction_id: row.transaction_id,
          date: row.date,
          customer_id: row.customer_id,
          amount: parseFloat(row.amount),
          type: row.type,
          description: row.description,
          gateway_id: row.gateway_id,
          status: "PENDING",
        };

        ledger.set(entry.transaction_id, entry);
      })
      .on("end", () => {
        console.log(
          `📘 Loaded ${ledger.size} transactions into the in-memory ledger`
        );
        resolve();
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

// 🧭 Access Methods
export function getLedgerEntry(id: string): LedgerEntry | undefined {
  return ledger.get(id);
}

export function getAllLedgerEntries(): LedgerEntry[] {
  return Array.from(ledger.values());
}
