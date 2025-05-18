import {
  loadTransactionsForGateway,
  pushTransaction,
  randomChance,
} from "./shared";

(async () => {
  const transactions = await loadTransactionsForGateway("gateway_b");
  let index = 0;

  setInterval(() => {
    const batchSize = Math.floor(Math.random() * 6) + 5;

    for (let i = 0; i < batchSize; i++) {
      const txn = transactions[index++ % transactions.length];

      if (randomChance(5)) {
        pushTransaction("gateway_b", { junk: "corrupted" });
        continue;
      }

      let value = parseFloat(txn.amount);
      let id = txn.transaction_id;

      // ⚠️ Tamper value
      if (randomChance(20)) {
        value += Math.floor(Math.random() * 15) + 5;
        console.warn(`[gateway_b] ⚠️ Tampered value for ${id}`);
      }

      // ❌ Tamper ID
      if (randomChance(10)) {
        id = `b-fake-${Math.floor(Math.random() * 9999)}`;
        console.warn(
          `[gateway_b] ❌ Tampered ID for MISSING simulation: ${id}`
        );
      }

      const transformed = {
        id,
        value,
        time: Math.floor(new Date(txn.date).getTime() / 1000),
        state: "completed",
      };

      pushTransaction("gateway_b", transformed);
    }
  }, 10000);
})();
