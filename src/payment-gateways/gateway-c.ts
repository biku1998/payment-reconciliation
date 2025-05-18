import {
  loadTransactionsForGateway,
  pushTransaction,
  randomChance,
} from "./shared";

(async () => {
  const transactions = await loadTransactionsForGateway("gateway_c");
  let index = 0;

  function buildTransaction(txn: any) {
    let amount = parseFloat(txn.amount);
    let id = txn.transaction_id;

    // ⚠️ Tamper amount
    if (randomChance(20)) {
      amount += Math.random() * 25;
      console.warn(`[gateway_c] ⚠️ Tampered totalAmount for ${id}`);
    }

    // ❌ Tamper ID
    if (randomChance(10)) {
      id = `txn-c-${Math.floor(Math.random() * 9999)}-X`;
      console.warn(`[gateway_c] ❌ Tampered ID for MISSING simulation: ${id}`);
    }

    return {
      uid: id,
      totalAmount: amount.toFixed(2),
      isoCurrency: "INR",
      ts: new Date(txn.date).toISOString(),
      currentStatus: "SUCCESS",
    };
  }

  function burstSend(count: number) {
    for (let i = 0; i < count; i++) {
      const txn = transactions[index++ % transactions.length];

      if (randomChance(10)) {
        pushTransaction("gateway_c", { corrupted: true });
        continue;
      }

      pushTransaction("gateway_c", buildTransaction(txn));
    }
  }

  function startConstantStream() {
    setInterval(() => {
      const txn = transactions[index++ % transactions.length];

      if (randomChance(10)) {
        pushTransaction("gateway_c", { invalid: true });
        return;
      }

      pushTransaction("gateway_c", buildTransaction(txn));
    }, 2000);
  }

  burstSend(50);
  setTimeout(startConstantStream, 5000);
})();
