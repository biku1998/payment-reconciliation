import {
  loadTransactionsForGateway,
  pushTransaction,
  randomChance,
} from "./shared";

(async () => {
  const transactions = await loadTransactionsForGateway("gateway_a");
  let index = 0;

  setInterval(() => {
    const isValid = !randomChance(10); // 10% bad payloads
    const txn = transactions[index++ % transactions.length];

    if (!isValid) {
      pushTransaction("gateway_a", { bad: "data" });
      return;
    }

    let amount = parseFloat(txn.amount);
    let id = txn.transaction_id;

    // ⚠️ 20% chance to tamper amount
    if (randomChance(20)) {
      amount += Math.floor(Math.random() * 10) + 1;
      console.warn(`[gateway_a] ⚠️ Tampered amount for ${id}`);
    }

    // ❌ 10% chance to tamper ID
    if (randomChance(10)) {
      id += "_FAKE";
      console.warn(`[gateway_a] ❌ Tampered ID for MISSING simulation: ${id}`);
    }

    const transformed = {
      transactionId: id,
      amount,
      currency: "USD",
      timestamp: new Date(txn.date).toISOString(),
      status: "SUCCESS",
    };

    pushTransaction("gateway_a", transformed);
  }, Math.random() * 2000 + 3000);
})();
