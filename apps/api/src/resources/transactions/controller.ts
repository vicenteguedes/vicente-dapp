import { SEPOLIA_DATA, ZERO_ADDRESS } from "../../utils/constants";
import { DailyVolume, Transaction } from "@repo/api-types";
import { Block, Contract, db, Transaction as TransactionEntity } from "@repo/database";
import { logger } from "@repo/logger";
import { Request, Response } from "express";
import { formatEther } from "viem";

const prepareTransaction = (transaction: TransactionEntity): Transaction => ({
  id: transaction.id,
  blockNumber: transaction.blockNumber,
  transactionHash: transaction.transactionHash,
  address: transaction.contractAddress,
  eventName: transaction.eventName,
  from: transaction.from,
  to: transaction.to,
  value: transaction.value,
});

const prepareDailyVolume = (transactions: TransactionEntity[]): DailyVolume[] => {
  // get sum of daily transactions
  const dailyTransactions = transactions.reduce(
    (acc, transaction) => {
      const day = transaction.block.timestamp.toISOString().split("T")[0];
      if (!acc[day]) {
        acc[day] = 0;
      }
      acc[day] += Number(transaction.value);
      return acc;
    },
    {} as Record<string, number>
  );

  return Object.entries(dailyTransactions).map(([day, value]) => ({
    day,
    value: Number(formatEther(BigInt(value))),
  }));
};

export const getTransactions = async (req: Request, res: Response) => {
  const account = req.query.account;

  const queryBuilder = TransactionEntity.getRepository().createQueryBuilder("transaction").select();

  if (account) {
    queryBuilder.where(
      `(transaction.from = :account 
      OR (transaction.to = :account AND transaction.eventName = 'Transfer' AND transaction.from = :zeroAddress))`,
      { account, zeroAddress: ZERO_ADDRESS }
    );
  }

  const transactions = await queryBuilder.orderBy("transaction.blockNumber", "DESC").limit(10).getMany();
  res.json(transactions.map(prepareTransaction));
};

export const getDailyVolume = async (_: Request, res: Response) => {
  const queryBuilder = TransactionEntity.getRepository()
    .createQueryBuilder("transaction")
    .addSelect("block.timestamp")
    .innerJoin("transaction.block", "block", "block.timestamp IS NOT NULL")
    .where("transaction.eventName = :eventName", { eventName: "Transfer" });

  const transactions = await queryBuilder.orderBy("block.timestamp").getMany();

  res.json(prepareDailyVolume(transactions));
};

export const deleteTransactions = async (_: Request, res: Response) => {
  const contract = await Contract.findOneOrFail({ where: { networkId: SEPOLIA_DATA.networkId } });

  if (contract.isSyncing) {
    res.status(409).send("Contract is syncing, please try again later.");
    return;
  }

  try {
    await db.transaction(async (manager) => {
      await manager.delete(TransactionEntity, {});
      await manager.delete(Block, {});
      await manager.getRepository(Contract).createQueryBuilder().update().set({ isSynced: false }).execute();
    });

    res.sendStatus(204);
  } catch (error) {
    logger.error({ error }, "Error deleting transactions");
    res.sendStatus(500);
  }
};
