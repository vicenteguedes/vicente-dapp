import { wsServer } from "../../websocketServer";
import { formatTransaction, insertEmptyBlocks, tryBulkInsert } from "@repo/common";
import { Transaction } from "@repo/database";
import { logger } from "@repo/logger";

export const handleNewLogs = async (logs: any[]) => {
  logger.info({ logs }, "Received new logs");

  const data = JSON.stringify(
    logs.map((log) => ({
      ...formatTransaction(log),
      value: log.args?.value?.toString(),
      id: `${log.transactionHash}_${log.logIndex}`,
    }))
  );

  wsServer.clients.forEach((client) => {
    if ((client as any)._readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });

  await insertEmptyBlocks(logs);
  await tryBulkInsert(Transaction.getRepository(), logs.map(formatTransaction));
};
