import axios from "axios";
import fs from "fs";
import path from "path";
import csv from "csv-parser";

export async function pushTransaction(gatewayId: string, data: any) {
  try {
    await axios.post("http://localhost:4000/webhook/transaction", {
      gatewayId,
      data,
    });
    console.log(`[${gatewayId}] ✅ Pushed transaction:`, data);
  } catch (err: unknown) {
    const error = err as Error;
    console.error(`[${gatewayId}] ❌ Push failed:`, error.message);
  }
}

export function randomChance(percent: number): boolean {
  return Math.random() * 100 < percent;
}

export interface RawLedgerTxn {
  transaction_id: string;
  date: string;
  customer_id: string;
  amount: string;
  type: string;
  description: string;
  gateway_id: string;
}

export async function loadTransactionsForGateway(
  gatewayId: string
): Promise<RawLedgerTxn[]> {
  const filePath = path.join(
    __dirname,
    "../enrich-ledger/enriched_transactions.csv"
  );

  return new Promise((resolve, reject) => {
    const txns: RawLedgerTxn[] = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        if (row.gateway_id === gatewayId) {
          txns.push(row);
        }
      })
      .on("end", () => {
        console.log(`📦 Loaded ${txns.length} txns for ${gatewayId}`);
        resolve(txns);
      })
      .on("error", (err) => reject(err));
  });
}
