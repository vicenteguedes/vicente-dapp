import { formatTransaction, insertEmptyBlocks, tryBulkInsert } from "@repo/common";
import { Transaction } from "@repo/database";
import { logger } from "@repo/logger";
import { wsServer } from "../../websocketServer";

export const handleNewLogs = async (logs: any[]) => {
  logger.info({ logs }, "Received new transaction logs");

  const data = JSON.stringify(
    logs.map((log) => ({
      ...formatTransaction(log),
      value: log.args?.value?.toString(),
      id: `${log.transactionHash}_${log.logIndex}`,
    }))
  );

  wsServer.clients.forEach((client) => {
    if ((client as any)._readyState === 1) {
      client.send(data);
    }
  });

  await insertEmptyBlocks(logs);
  await tryBulkInsert(Transaction.getRepository(), logs.map(formatTransaction));
};

export const handleSync = async (logs: any[]) => {
  logger.info({ logs }, "Received new sync logs");

  const data = JSON.stringify(
    logs.map((log) => ({
      reserve0: log.args.reserve0.toString(),
      reserve1: log.args.reserve1.toString(),
      eventName: log.eventName,
    }))
  );

  wsServer.clients.forEach((client) => {
    if ((client as any)._readyState === 1) {
      client.send(data);
    }
  });
};
