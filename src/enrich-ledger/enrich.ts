import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { createObjectCsvWriter } from "csv-writer";

const inputFile = path.join(__dirname, "financial_transactions.csv");
const outputFile = path.join(__dirname, "enriched_transactions.csv");

const gatewayIds = ["gateway_a", "gateway_b", "gateway_c"];

interface RawTransaction {
  transaction_id: string;
  date: string;
  customer_id: string;
  amount: string;
  type: string;
  description: string;
}

interface EnrichedTransaction extends RawTransaction {
  gateway_id: string;
}

const enrichedRows: EnrichedTransaction[] = [];

let count = 0;
fs.createReadStream(inputFile)
  .pipe(csv())
  .on("data", (row: RawTransaction) => {
    const gateway_id = gatewayIds[count % gatewayIds.length]; // round-robin
    enrichedRows.push({ ...row, gateway_id });
    count++;
  })
  .on("end", async () => {
    console.log(
      `✅ Finished reading ${count} transactions. Writing enriched file...`
    );

    const csvWriter = createObjectCsvWriter({
      path: outputFile,
      header: [
        { id: "transaction_id", title: "transaction_id" },
        { id: "date", title: "date" },
        { id: "customer_id", title: "customer_id" },
        { id: "amount", title: "amount" },
        { id: "type", title: "type" },
        { id: "description", title: "description" },
        { id: "gateway_id", title: "gateway_id" },
      ],
    });

    await csvWriter.writeRecords(enrichedRows);

    console.log(`📁 Enriched file saved as ${outputFile}`);
  })
  .on("error", (err) => {
    console.error(`❌ Failed to process file: ${err.message}`);
  });
