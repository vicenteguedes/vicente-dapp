import { initViemClient } from "./viem";
import * as db from "@repo/database";
import { config } from "./config";
import * as schedule from "node-schedule";
import { synchronizeTransactions } from "./transactions";

const run = async () => {
  initViemClient();

  await db.start();

  const c = config.get("schedule");

  // schedule local cron job
  schedule.scheduleJob(c.synchronizeTransactions, synchronizeTransactions);

  console.log(`Job fetchBlockchainData scheduled "${c.synchronizeTransactions}"`);
};

run().then(() => {
  console.log("Started scheduler");
});
