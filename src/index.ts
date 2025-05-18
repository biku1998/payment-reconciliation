import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { validatePayload } from "./validator";
import { normalizeTransaction } from "./normalizer";
import { enqueue } from "./queue";
import { loadLedger, getLedgerEntry } from "./ledger";
import { logReconciliationResult } from "./logger";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Payment Reconciliation API" });
});

// Main webhook endpoint
app.post("/webhook/transaction", async (req: Request, res: Response) => {
  const { gatewayId, data } = req.body;

  if (!gatewayId || !data) {
    return res.status(400).json({ error: "Missing gatewayId or data" });
  }

  try {
    // ✅ Step 1: Validate and normalize
    const parsed = validatePayload(gatewayId, data);
    const normalized = normalizeTransaction(gatewayId, parsed);

    // ✅ Step 2: Lookup in internal ledger
    const ledgerEntry = getLedgerEntry(normalized.id);

    // ❌ Case: Transaction not found
    if (!ledgerEntry) {
      console.warn(`❌ MISSING: No match for transaction ${normalized.id}`);
      await logReconciliationResult(normalized, "MISSING");

      return res.status(404).json({
        status: "missing",
        message: "Transaction not found in internal ledger",
      });
    }

    // ✅ Step 3: Compare amounts
    const expectedAmount = parseFloat(ledgerEntry.amount.toString());
    const amountMatches = expectedAmount === normalized.amount;

    if (amountMatches) {
      console.log(`✅ RECONCILED: ${normalized.id}`);
      await logReconciliationResult(normalized, "RECONCILED");
    } else {
      console.warn(`⚠️ DISCREPANCY: Amount mismatch for ${normalized.id}`);
      console.warn(`Ledger: ${expectedAmount}, Incoming: ${normalized.amount}`);
      await logReconciliationResult(normalized, "DISCREPANCY");
    }

    // Step 4: Enqueue for future use (optional)
    enqueue(normalized);

    res.status(200).json({
      status: amountMatches ? "reconciled" : "discrepancy",
      transactionId: normalized.id,
    });
  } catch (err: any) {
    console.error("❌ Validation or normalization failed:", err.message);
    res.status(400).json({ error: err.message });
  }
});

// ✅ Bootstrap: Load ledger before starting server
(async () => {
  try {
    console.log("📦 Loading ledger...");
    await loadLedger();

    app.listen(port, () => {
      console.log(`⚡️ Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();
