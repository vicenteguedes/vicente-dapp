import { ERC20_ABI, SEPOLIA_DATA } from "../../utils/constants";
import { viemClient } from "../../viem";
import { Transaction } from "@repo/database";
import { Request, Response } from "express";
import { formatEther, MulticallContracts } from "viem";

export const getAllowances = async (req: Request, res: Response) => {
  const account = req.query.account;

  if (!account) {
    res.send(422).json({ error: "Account is required" });
    return;
  }

  const userApprovals = await Transaction.getRepository()
    .createQueryBuilder("transaction")
    .select()
    .where("transaction.from = :account", { account })
    .andWhere("transaction.eventName = 'Approval'")
    .getMany();

  const userApprovalAddresses = userApprovals.reduce((acc, { to }) => {
    if (!to || acc.includes(to)) return acc;

    acc.push(to);

    return acc;
  }, [] as string[]);

  const baseContract = {
    address: SEPOLIA_DATA.tokens[0].address,
    abi: ERC20_ABI,
  };

  const contracts = userApprovalAddresses.map((spender) => ({
    ...baseContract,
    functionName: "allowance",
    args: [account, spender],
  })) as MulticallContracts<{ address: string; abi: any; functionName: string; args: any[] }[]>;

  const allowances = await viemClient.multicall({
    contracts,
    multicallAddress: SEPOLIA_DATA.multicallAddress,
    allowFailure: false,
  });

  const userAllowances = userApprovalAddresses
    .map((spender, i) => ({
      spender,
      value: formatEther(allowances[i] as bigint),
    }))
    .filter(({ value }) => value !== "0");

  console.log("userAllowances", userAllowances);

  res.json(userAllowances);
};
