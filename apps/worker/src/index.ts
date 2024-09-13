import { initViemClient } from "./viem";
import * as db from "@repo/database";
import { config } from "./config";
import * as schedule from "node-schedule";
import { synchronizeTransactions } from "./transactions";
import { synchronizeBlocks } from "./blocks";
import { logger } from "@repo/logger";

const run = async () => {
  initViemClient();

  await db.start();

  const c = config.get("schedule");

  schedule.scheduleJob(c.synchronizeTransactions, synchronizeTransactions);

  logger.info(`Job synchronizeTransactions scheduled "${c.synchronizeTransactions}"`);

  schedule.scheduleJob(c.synchronizeBlocks, synchronizeBlocks);

  logger.info(`Job synchronizeBlocks scheduled "${c.synchronizeBlocks}"`);
};

run().then(() => {
  logger.info("Started scheduler");
});
