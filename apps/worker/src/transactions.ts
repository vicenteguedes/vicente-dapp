import { parseAbi } from "viem";
import { viemClient } from "./viem";
import { Contract, Transaction } from "@repo/database";
import { logger } from "@repo/logger";
import { BATCH_SIZE, EARLIEST_BLOCK, SEPOLIA_DATA } from "@repo/common";
import { formatTransaction, insertEmptyBlocks, TransactionLog, tryBulkInsert } from "@repo/common";

export const loadBatchLogs = async (fromBlock: bigint, toBlock: bigint) =>
  viemClient.getLogs({
    address: SEPOLIA_DATA.tokens[0].address,
    events: parseAbi([
      "event Approval(address indexed owner, address indexed spender, uint256 value)",
      "event Transfer(address indexed from, address indexed to, uint256 value)",
    ]),
    fromBlock,
    toBlock,
  }) as Promise<TransactionLog[]>;

const getEarliestBlockToSync = async (contract: Contract) => {
  if (!contract.isSynced) {
    return BigInt(EARLIEST_BLOCK);
  }

  const { latestBlock: databaseLatestBlockNumber } = await Transaction.getRepository()
    .createQueryBuilder()
    .select("MAX(block_number)", "latestBlock")
    .getRawOne();

  return databaseLatestBlockNumber ? BigInt(databaseLatestBlockNumber + 1) : EARLIEST_BLOCK;
};

export const synchronizeTransactions = async () => {
  const contract = await Contract.findOneOrFail({ where: { networkId: SEPOLIA_DATA.networkId } });

  if (contract.isSyncing) {
    logger.info({ contract }, "Contract sync is in progress");
    return;
  }

  try {
    logger.info("Synchronizing transactions");

    let blockNumber = await viemClient.getBlockNumber();

    contract.isSyncing = true;
    await contract.save();

    const synchronizeUntilBlockNumber = await getEarliestBlockToSync(contract);

    logger.info({ blockNumber, synchronizeUntilBlockNumber: synchronizeUntilBlockNumber }, "Syncronizing blockchain");

    while (blockNumber > synchronizeUntilBlockNumber) {
      const fromBlock = BigInt(Math.max(Number(blockNumber) - BATCH_SIZE, Number(synchronizeUntilBlockNumber)));

      logger.info({ fromBlock, toBlock: blockNumber, synchronizeUntilBlockNumber }, "Fetching transactions");

      const logs = await loadBatchLogs(fromBlock, blockNumber);

      logger.info({ fromBlock, toBlock: blockNumber, logs }, "Fetched transactions");

      await insertEmptyBlocks(logs);
      const transactions = logs.map(formatTransaction);

      await tryBulkInsert(Transaction.getRepository(), transactions);

      blockNumber = BigInt(Math.max(Number(blockNumber) - BATCH_SIZE - 1, Number(synchronizeUntilBlockNumber)));
    }
    contract.isSynced = true;

    logger.info("Successfully finished synchronizing transactions");
  } catch (error) {
    logger.error({ error }, "Error synchronizing transactions");
  } finally {
    contract.isSyncing = false;
    await contract.save();
  }
};
