"use client";

import { useClient } from "@/contexts/ClientProvider";
import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { ERC20_ABI, PAGE_SIZE, SEPOLIA_DATA, ZERO_ADDRESS } from "@/utils/constants";
import ActivityDataTable, { TransactionLog } from "./ActivityTable";
import { MulticallContracts, parseAbi } from "viem";
import AllowancesTable, { Allowance } from "./AllowancesTable";
import AccordionSection from "./AccordionSection";

const BATCH_SIZE = 1000;
const EARLIEST_BLOCK = 6684561n;

export default function Activity() {
  const { account, client } = useClient();

  const [initialBlockNumber, setInitialBlockNumber] = useState<bigint>(-1n);
  const [blockNumber, setBlockNumber] = useState<bigint>(-1n);
  const [tokenLogs, setTokenLogs] = useState<TransactionLog[]>([]);
  const [userLogs, setUserLogs] = useState<TransactionLog[]>([]);
  const [userApprovalAddresses, setUserApprovalAddresses] = useState<string[]>([]);
  const [userAllowances, setUserAllowances] = useState<Allowance[]>([]);

  // push logs until we reach PAGE_SIZE
  const mergeLogs = (previousLogs: TransactionLog[], newLogs: TransactionLog[]) => [
    ...previousLogs,
    ...newLogs.slice(0, PAGE_SIZE - newLogs.length - previousLogs.length),
  ];

  const loadBatchLogs = async (latestBlockNumber: bigint) => {
    if (!client) {
      return;
    }

    // do not let the block number go below EARLIEST_BLOCK
    const fromBlock = BigInt(Math.max(Number(latestBlockNumber) - BATCH_SIZE, Number(EARLIEST_BLOCK)));

    const logs = (await client.getLogs({
      address: SEPOLIA_DATA.tokens[0].address,
      events: parseAbi([
        "event Approval(address indexed owner, address indexed spender, uint256 value)",
        "event Transfer(address indexed from, address indexed to, uint256 value)",
      ]),
      fromBlock,
      toBlock: latestBlockNumber,
    })) as TransactionLog[];

    if (!logs.length) {
      return;
    }

    setTokenLogs((tokenLogs) => mergeLogs(tokenLogs, logs));
    setUserLogs((userLogs) =>
      mergeLogs(
        userLogs,
        logs.filter(
          (log) =>
            log.args?.from === account ||
            log.args?.owner === account ||
            // include minted tokens
            (log.eventName === "Transfer" && log.args?.from === ZERO_ADDRESS && log.args?.to === account)
        )
      )
    );

    // set unique approval addresses
    setUserApprovalAddresses((userApprovalAddresses) => {
      const newAddresses = logs
        .filter((log) => log.eventName === "Approval" && log.args?.owner === account)
        .map((log) => log.args.spender!);

      return Array.from(new Set([...userApprovalAddresses, ...newAddresses]));
    });
  };

  const processBlockNumber = async () => {
    if (!client || !account) {
      return;
    }

    if (blockNumber <= EARLIEST_BLOCK) {
      return processUserAllowances();
    }

    await loadBatchLogs(blockNumber);

    setBlockNumber((blockNumber) => BigInt(Math.max(Number(blockNumber - BigInt(BATCH_SIZE)), 0)));
  };

  const processUserAllowances = async () => {
    if (!client || !account) {
      return;
    }

    const baseContract = {
      address: SEPOLIA_DATA.tokens[0].address,
      abi: ERC20_ABI,
    };

    const contracts = userApprovalAddresses.map((spender) => ({
      ...baseContract,
      functionName: "allowance",
      args: [account, spender],
    })) as MulticallContracts<{ address: string; abi: any; functionName: string; args: any[] }[]>;

    const allowances = await client.multicall({
      contracts,
      multicallAddress: SEPOLIA_DATA.multicallAddress,
      allowFailure: false,
    });

    setUserAllowances(
      userApprovalAddresses.map((spender, i) => ({
        spender,
        amount: allowances[i] as string,
      }))
    );
  };

  useEffect(() => {
    if (client) {
      console.log("INITIEI");
      client.getBlockNumber().then((blockNumber) => {
        setBlockNumber(blockNumber);
        setInitialBlockNumber(blockNumber);
      });
    }
  }, [client]);

  useEffect(() => {
    if (client) {
      processBlockNumber();
    }
  }, [blockNumber]);

  // sleep for 5 seconds before processing user allowances

  // set interval to process logs
  useEffect(() => {
    const waitAndSet = async () => {
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const newTokenLog = {
        address: "0x6a7577c10cd3f595eb2dbb71331d7bf7223e1aac12321",
        args: {
          owner: "EUMESMOHhahahahahHAHAH",
          spender: "RODEI!",
          value: 33321000000000000000000n,
        },
        blockHash: "0xe87031970249af4eef1e120457323947ab9147b74e8561d0251120d4e6bb3b181232",
        blockNumber: 6684561n,
        data: "0x",
        eventName: "Approval",
        logIndex: 19,
        removed: false,
        topics: [
          "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
          "0x000000000000000000000000cfcd054380d4a2201b360241326029dec87e617b",
          "0x000000000000000000000000cfcd054380d4a2201b360241326029dec87e617b",
        ],
        transactionHash: "0x075516a0dd796c5e32147660523d2cb013d6a4dc59d6333c08e5f8cf5ec0e7e6123213",
        transactionIndex: 12117,
        status: "new",
      };

      console.log("SETEI");
      console.log("blockNumber: ", blockNumber);
      setTokenLogs((prev) => [newTokenLog, ...prev].slice(0, PAGE_SIZE));
    };
    waitAndSet();
  }, []);
  useEffect(() => {
    const waitAndSet = async () => {
      await new Promise((resolve) => setTimeout(resolve, 12000));

      const newTokenLog = {
        address: "0x123126a7577c10cd3f595eb2dbb71331d7bf7223e1aac12321",
        args: {
          owner: "NAOPODESER",
          spender: "CCAAAALARO QUE PODE!!!",
          value: 666n,
        },
        blockHash: "0xe87031970249af4eef1e120457323947ab9147b74e8561d0251120d4e6bb3b181232",
        blockNumber: 6684561n,
        data: "0x",
        eventName: "Approval",
        logIndex: 19,
        removed: false,
        topics: [
          "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
          "0x000000000000000000000000cfcd054380d4a2201b360241326029dec87e617b",
          "0x000000000000000000000000cfcd054380d4a2201b360241326029dec87e617b",
        ],
        transactionHash: "0x11211075516a0dd796c5e32147660523d2cb013d6a4dc59d6333c08e5f8cf5ec0e7e6123213",
        transactionIndex: 122117,
        status: "new",
      };

      console.log("SETEI");
      console.log("blockNumber: ", blockNumber);
      setTokenLogs((prev) => [newTokenLog, ...prev].slice(0, PAGE_SIZE));
    };
    waitAndSet();
  }, []);

  return (
    <Box>
      <Box mt={6}>
        <AccordionSection title="Token Activity">
          <ActivityDataTable rows={tokenLogs} />
        </AccordionSection>
      </Box>

      <Box mt={3}>
        <AccordionSection title="User Activity">
          <ActivityDataTable rows={userLogs} />
        </AccordionSection>
      </Box>

      <Box mt={3}>
        <AccordionSection title="User Allowances">
          <AllowancesTable rows={userAllowances} />
        </AccordionSection>
      </Box>
    </Box>
  );
}
