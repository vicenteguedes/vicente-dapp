import { parseAbi } from "viem";
import { viemClient } from "./viem";
import { Block, Contract, Transaction } from "@repo/database";
import { logger } from "@repo/logger";
import { BATCH_SIZE, EARLIEST_BLOCK, SEPOLIA_DATA } from "@repo/common";

interface TransactionLog {
  address: string;
  args: {
    from?: string;
    to?: string;
    owner?: string;
    spender?: string;
    value: bigint;
  };
  blockHash: string;
  blockNumber: bigint;
  data: string;
  eventName: string;
  logIndex: number;
  removed: boolean;
  topics: string[];
  transactionHash: string;
  transactionIndex: number;
}

export const loadBatchLogs = async (fromBlock: bigint, toBlock: bigint): Promise<TransactionLog[]> =>
  viemClient.getLogs({
    address: SEPOLIA_DATA.tokens[0].address,
    events: parseAbi([
      "event Approval(address indexed owner, address indexed spender, uint256 value)",
      "event Transfer(address indexed from, address indexed to, uint256 value)",
    ]),
    fromBlock,
    toBlock,
  }) as unknown as TransactionLog[];

// insert empty blocks to fetch the timestamp later
const insertBlocks = async (logs: TransactionLog[]) => {
  const uniqueBlockNumbers = Array.from(new Set(logs.map((log) => Number(log.blockNumber))));
  if (!uniqueBlockNumbers.length) return;

  try {
    // try to bulk insert
    await Block.insert(uniqueBlockNumbers.map(formatBlock));
  } catch (error) {
    // if bulk insert fails, insert one by one
    await Promise.all(
      uniqueBlockNumbers.map((blockNumber) => Block.insert(formatBlock(blockNumber)).catch(() => undefined))
    );
  }
};

const insertTransactions = async (logs: TransactionLog[]) => {
  try {
    // try to bulk insert
    await Transaction.insert(logs.map(formatLog));
  } catch (error) {
    // if bulk insert fails, insert one by one
    logger.error({ error }, "Error inserting transactions");

    await Promise.all(
      logs.map((log) =>
        Transaction.insert(formatLog(log)).catch((error) => {
          logger.error({ error, log }, "Error inserting transaction");
        })
      )
    );
  }
};

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

      await insertBlocks(logs);
      await insertTransactions(logs);

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

const formatBlock = (blockNumber: number) => ({
  number: blockNumber,
});

const formatLog = (log: TransactionLog) => ({
  blockNumber: Number(log.blockNumber),
  transactionHash: log.transactionHash,
  contractAddress: log.address,
  eventName: log.eventName,
  from: log.args.from || log.args.owner,
  to: log.args.to || log.args.spender,
  value: log.args.value,
  logIndex: log.logIndex,
});
