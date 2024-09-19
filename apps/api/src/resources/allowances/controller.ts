import { viemClient } from "../../viem";
import { Transaction } from "@repo/database";
import { ERC20_ABI, SEPOLIA_DATA } from "@repo/common";
import { Request, Response } from "express";
import { MulticallContracts } from "viem";

export const getAllowances = async (req: Request, res: Response) => {
  const account = req.query.account;

  if (!account) {
    res.status(422).json({ error: "Account is required" });
    return;
  }

  const userApprovals = await Transaction.getRepository()
    .createQueryBuilder("transaction")
    .select()
    .where("transaction.from = :account", { account })
    .andWhere("transaction.eventName = 'Approval'")
    .getMany();

  const userApprovalAddresses = Array.from(new Set(userApprovals.map(({ to }) => to)));

  const baseContract = {
    address: SEPOLIA_DATA.contracts["BUSD"].address,
    abi: ERC20_ABI,
  };

  const contracts = userApprovalAddresses.map((spender) => ({
    ...baseContract,
    functionName: "allowance",
    args: [account, spender],
  })) as MulticallContracts<{ address: string; abi: any; functionName: string; args: any[] }[]>;

  const allowances = (await viemClient.multicall({
    contracts,
    multicallAddress: SEPOLIA_DATA.multicallAddress,
    allowFailure: false,
  })) as bigint[];

  const userAllowances = userApprovalAddresses
    .map((spender, i) => ({
      spender,
      value: allowances[i].toString(),
    }))
    .filter((allowance) => Number(allowance.value));
  res.json(userAllowances);
};
