import { Block, Transaction } from "@repo/database";
import { logger } from "@repo/logger";
import { ObjectLiteral } from "typeorm";
import { Repository } from "typeorm/repository/Repository";

export interface TransactionLog {
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

/**
 * Attempts a bulk insert of data into the specified entity using TypeORM.
 * If the bulk insert fails, it falls back to inserting each entry individually.
 *
 * @param entityRepository - The TypeORM repository for the target entity.
 * @param data - An array of data to be inserted.
 * @param formatFunc - A function that formats each item before insertion.
 * @typeparam T - The type of the entity being inserted.
 */
export const tryBulkInsert = async <T extends ObjectLiteral>(
  entityRepository: Repository<T>,
  data: T[]
): Promise<void> => {
  try {
    // Attempt to bulk insert
    await entityRepository.insert(data);
  } catch (error) {
    // If bulk insert fails, insert one by one
    logger.error({ error, data }, "Error bulk inserting data");

    await Promise.all(
      data.map((item) =>
        entityRepository.insert(item).catch((error) => {
          logger.error({ error, item }, "Error inserting data");
        })
      )
    );
  }
};

// insert empty blocks to fetch the timestamp later
export const insertEmptyBlocks = async (logs: TransactionLog[]) => {
  const uniqueBlockNumbers = Array.from(new Set(logs.map((log) => Number(log.blockNumber))));
  if (!uniqueBlockNumbers.length) return;

  await tryBulkInsert(Block.getRepository(), uniqueBlockNumbers.map(formatBlock));
};

const formatBlock = (blockNumber: number) => ({
  number: blockNumber,
});

export const formatTransaction = (log: TransactionLog): Transaction =>
  ({
    blockNumber: Number(log.blockNumber),
    transactionHash: log.transactionHash,
    contractAddress: log.address,
    eventName: log.eventName,
    from: log.args.from || log.args.owner,
    to: log.args.to || log.args.spender,
    value: log.args.value,
    logIndex: log.logIndex,
  }) as Transaction;
