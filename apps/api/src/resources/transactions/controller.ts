import { ZERO_ADDRESS } from "../../utils/constants";
import { Transaction } from "@repo/api-types";
import { Transaction as TransactionEntity } from "@repo/database";
import { Request, Response } from "express";

const prepareLog = (transaction: TransactionEntity): Transaction => ({
  id: transaction.id,
  blockNumber: transaction.blockNumber,
  transactionHash: transaction.transactionHash,
  address: transaction.address,
  eventName: transaction.eventName,
  from: transaction.from,
  to: transaction.to,
  value: transaction.value,
});

export const getTransactions = async (req: Request, res: Response) => {
  const account = req.query.account;

  const queryBuilder = TransactionEntity.getRepository().createQueryBuilder("transaction").select();

  if (account) {
    queryBuilder.where(
      `transaction.from = :account 
      OR (transaction.to = :account AND transaction.eventName = 'Transfer' AND transaction.from = :zeroAddress)`,
      { account, zeroAddress: ZERO_ADDRESS }
    );
  }

  const transactions = await queryBuilder.orderBy("transaction.blockNumber", "DESC").limit(10).getMany();
  res.json(transactions.map(prepareLog));
};
