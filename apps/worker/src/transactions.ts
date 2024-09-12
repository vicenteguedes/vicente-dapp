import { formatEther, parseAbi } from "viem";
import { BATCH_SIZE, EARLIEST_BLOCK, SEPOLIA_DATA } from "./utils/constants";
import { viemClient } from "./viem";
import { Transaction } from "@repo/database";

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

export const synchronizeTransactions = async () => {
  let blockNumber = await viemClient.getBlockNumber();

  const { earliestBlock: databaseEarliestBlockNumber } = await Transaction.getRepository()
    .createQueryBuilder()
    .select("MIN(block_number)", "earliestBlock")
    .getRawOne();

  if (databaseEarliestBlockNumber && databaseEarliestBlockNumber > EARLIEST_BLOCK) {
    console.log("Database is still performing initial sync");
    return;
  }

  const { latestBlock: databaseLatestBlockNumber } = await Transaction.getRepository()
    .createQueryBuilder()
    .select("MAX(block_number)", "latestBlock")
    .getRawOne();

  const synchronizeUntilBlockNumber = databaseLatestBlockNumber
    ? BigInt(databaseLatestBlockNumber + 1)
    : EARLIEST_BLOCK;

  console.log({ blockNumber, synchronizeUntilBlockNumber: synchronizeUntilBlockNumber }, "Syncronizing blockchain");

  while (blockNumber > synchronizeUntilBlockNumber) {
    const fromBlock = BigInt(Math.max(Number(blockNumber) - BATCH_SIZE, Number(synchronizeUntilBlockNumber)));

    console.log({ fromBlock, toBlock: blockNumber, synchronizeUntilBlockNumber }, "Fetching blocks");

    const logs = await loadBatchLogs(fromBlock, blockNumber);

    console.log({ fromBlock, toBlock: blockNumber, logs }, "Fetched blocks");

    try {
      // try to bulk insert
      await Transaction.insert(logs.map(formatLog));
    } catch (error) {
      // if bulk insert fails, insert one by one
      console.error("Error while inserting logs", error);
      await Promise.all(
        logs.map((log) =>
          Transaction.insert(formatLog(log)).catch((error) => {
            console.error("Error while inserting log", error);
          })
        )
      );
    }

    blockNumber = BigInt(Math.max(Number(blockNumber) - BATCH_SIZE - 1, Number(synchronizeUntilBlockNumber)));
  }
};

const formatLog = (log: TransactionLog) => ({
  blockNumber: Number(log.blockNumber),
  transactionHash: log.transactionHash,
  address: log.address,
  eventName: log.eventName,
  from: log.args.from || log.args.owner,
  to: log.args.to || log.args.spender,
  value: Number(formatEther(log.args.value)),
  logIndex: log.logIndex,
});
