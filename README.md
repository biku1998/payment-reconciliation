# 🧾 Real-Time Payment Reconciliation System

> A fully simulated, real-time transaction ingestion and reconciliation pipeline — built in TypeScript.

---

## 🎯 Problem Statement

Build a secure, scalable system that **ingests real-time transactions from multiple payment gateways**, and **reconciles** them against an internal ledger to ensure data integrity.

In the real world, **banks, payment service providers (PSPs)**, and other financial systems often send **webhooks or streaming data** for each transaction. Your system (like a fintech company) must:

- ✅ Ingest those transactions
- ✅ Reconcile them against your expected internal records (ledger)
- ✅ Detect mismatches, duplicates, or missing records
- ✅ Log and expose reconciliation results

---

## 🏗️ System Architecture

Here's a simplified view of how everything fits together:

                    +---------------------+
                    | Enriched Ledger CSV |
                    | (internal source of |
                    | truth, expected txns)|
                    +----------+----------+
                               |
                 ┌────────────▼────────────┐
                 │   Gateway Simulators    │
                 │  (A, B, C - push model) │
                 └────────────┬────────────┘
                              │
                              ▼
                 +-----------------------------+
                 |  Webhook Receiver (Express) |
                 |  - Validates payload        |
                 |  - Normalizes data          |
                 |  - Reconciles w/ ledger     |
                 |  - Logs result to CSV       |
                 +-----------------------------+
                              │
                              ▼
                   +-----------------------+
                   | reconciliation_results.csv |
                   +-----------------------+

---

## 📦 Key Features

### ✅ 1. Ingestion via Webhook (Push Model)

Instead of polling fake APIs, the system simulates **webhooks**, which is how most real gateways like Stripe or Razorpay behave.

### ✅ 2. Mock Payment Gateway Simulators

We created **3 gateway simulators** (`gateway_a`, `gateway_b`, `gateway_c`) in TypeScript:

- Each one mimics a unique payload schema
- Sends transactions to the webhook in different patterns:
  - Gateway A: single txn every few seconds
  - Gateway B: batches of 5–10 txns every 10s
  - Gateway C: burst mode followed by steady stream

They also simulate **real-world inconsistencies**:

- ❌ Randomly tamper with `transactionId` → triggers `MISSING`
- ⚠️ Randomly tamper with `amount` → triggers `DISCREPANCY`
- 🚫 Send bad payloads → triggers validation errors

---

## 📊 3. Reconciliation Logic

Every transaction received at the webhook is:

1. ✅ **Validated** using Zod schemas
2. 🔁 **Normalized** into a common format
3. 🧾 **Matched** against the internal ledger (loaded from enriched CSV)
4. ⚖️ **Compared** for exact match:
   - `RECONCILED`: transaction exists & matches
   - `DISCREPANCY`: exists but fields (e.g., amount) differ
   - `MISSING`: doesn't exist in ledger
5. 📝 **Logged** into `reconciliation_results.csv`

---

## 💾 4. Internal Ledger (Simulated)

We use a **realistic transaction dataset** from Kaggle and enrich it by:

- Adding a `gateway_id` (randomly assigning each txn to one of the gateways)
- Loading it into memory at server startup
- Using it as our **"source of truth" ledger**

> This mirrors what a real fintech backend would do with database entries for initiated transactions.

---

## 🧪 Example Reconciliation Outcomes

transaction_id amount gateway_id reconciliation_result
txn_12345 100.00 gateway_a RECONCILED
txn_777_FAKE 100.00 gateway_b MISSING
txn_54321 125.00 gateway_c DISCREPANCY

---

## 🔧 Tech Stack

| Layer          | Technology                           |
| -------------- | ------------------------------------ |
| Language       | TypeScript                           |
| Server         | Express                              |
| Validation     | Zod                                  |
| Gateway Sim    | Node.js Scripts                      |
| File I/O       | csv-parser, csv-writer               |
| Queue          | In-memory (for now)                  |
| Ledger Storage | CSV-based mock ledger                |
| Logging        | CSV export of reconciliation results |

---

## 🚀 Running the Project

### 1. Install dependencies

    npm install

### 2. Enrich the ledger dataset

    ts-node enrich-ledger/enrich.ts

This creates `enriched_transactions.csv` with gateway assignments.

### 3. Start the webhook server

    ts-node src/index.ts

This loads the ledger and waits for webhook pushes.

### 4. Run all gateways

    npm run gateways

## 📁 Project Structure

    PAYMENT-RECONCILIATION/
    ├── dist/
    ├── logs/
    │ └── reconciliation_results.csv
    ├── src/
    │ ├── enrich-ledger/
    │ │ ├── enrich.ts
    │ │ ├── enriched_transactions.csv
    │ │ └── financial_transactions.csv
    │ ├── payment-gateways/
    │ │ ├── gateway-a.ts
    │ │ ├── gateway-b.ts
    │ │ ├── gateway-c.ts
    │ │ ├── index.ts
    │ │ └── shared.ts
    │ ├── index.ts
    │ ├── ledger.ts
    │ ├── logger.ts
    │ ├── normalizer.ts
    │ ├── queue.ts
    │ ├── schemas.ts
    │ ├── types.ts
    │ └── validator.ts
    ├── .gitignore
    ├── package-lock.json
    ├── package.json
    ├── README.md
    └── tsconfig.json

## 📈 What This Project Teaches

This project is an excellent intro to real-world backend systems involving:

- Event-driven ingestion

- API/webhook design

- Data normalization and validation

- Reconciliation strategies in fintech

- Observability and audit trail generation

- Designing for scalability, resilience, and data integrity
