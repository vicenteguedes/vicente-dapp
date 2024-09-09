"use client";

import { parseAbi, parseAbiItem } from "viem";
import { useClient } from "@/contexts/ClientProvider";
import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { PAGE_SIZE, SEPOLIA_DATA } from "@/utils/constants";
import DataTable, { TransactionLog } from "./ActivityDataTable";

const BATCH_SIZE = 1000;

export default function Activity() {
  const { account, client } = useClient();

  const [initialBlockNumber, setInitialBlockNumber] = useState<bigint>(-1n);
  const [blockNumber, setBlockNumber] = useState<bigint>(-1n);
  const [tokenLogs, setTokenLogs] = useState<TransactionLog[]>([]);
  const [userLogs, setUserLogs] = useState<TransactionLog[]>([]);
  const [userApprovalLogs, setUserApprovalLogs] = useState<TransactionLog[]>(
    []
  );

  // push logs until we reach PAGE_SIZE
  const mergeLogs = (
    previousLogs: TransactionLog[],
    newLogs: TransactionLog[]
  ) => [
    ...previousLogs,
    ...newLogs.slice(0, PAGE_SIZE - newLogs.length - previousLogs.length),
  ];

  const updateUserLogs = async (latestBlockNumber: bigint) => {
    if (!client) {
      return;
    }

    // stop fetching transfer logs if we have enough
    const [transferLogs, approvalLogs] = await Promise.all([
      (userLogs.length < PAGE_SIZE
        ? client.getLogs({
            address: SEPOLIA_DATA.tokens[0].address,
            event: parseAbiItem(
              "event Transfer(address indexed from, address indexed to, uint256 value)"
            ),
            args: {
              from: account,
            },
            fromBlock: latestBlockNumber - BigInt(BATCH_SIZE),
            toBlock: latestBlockNumber,
          })
        : []) as TransactionLog[],

      client.getLogs({
        address: SEPOLIA_DATA.tokens[0].address,
        event: parseAbiItem(
          "event Approval(address indexed owner, address indexed spender, uint256 value)"
        ),
        args: {
          owner: account,
        },
        fromBlock: latestBlockNumber - BigInt(BATCH_SIZE),
        toBlock: latestBlockNumber,
      }) as unknown as TransactionLog[],
    ]);

    setUserLogs((prev) => mergeLogs(prev, [...transferLogs, ...approvalLogs]));
    setUserApprovalLogs((prev) => [...prev, ...approvalLogs]);
  };

  const updateTokenLogs = async (latestBlockNumber: bigint) => {
    if (!client || tokenLogs.length >= PAGE_SIZE) {
      return;
    }

    const blockTokenLogs = (await client.getLogs({
      address: SEPOLIA_DATA.tokens[0].address,
      events: parseAbi([
        "event Approval(address indexed owner, address indexed spender, uint256 value)",
        "event Transfer(address indexed from, address indexed to, uint256 value)",
      ]),
      fromBlock: latestBlockNumber - BigInt(BATCH_SIZE),
      toBlock: latestBlockNumber,
    })) as TransactionLog[];

    setTokenLogs((prev) => mergeLogs(prev, blockTokenLogs));
  };

  const loadBatchLogs = async (latestBlockNumber: bigint) => {
    if (!client || blockNumber < 0n) {
      return;
    }

    await Promise.all([
      updateTokenLogs(latestBlockNumber),
      updateUserLogs(latestBlockNumber),
    ]);
  };

  const getBlockLogs = async () => {
    if (!client || !account) {
      return;
    }

    if (
      blockNumber === 0n ||
      (tokenLogs.length >= PAGE_SIZE && userLogs.length >= PAGE_SIZE)
    ) {
      return;
    }

    await loadBatchLogs(blockNumber);

    setBlockNumber((blockNumber) =>
      BigInt(Math.max(Number(blockNumber - BigInt(BATCH_SIZE)), 0))
    );
  };

  useEffect(() => {
    if (client) {
      client.getBlockNumber().then((blockNumber) => {
        setBlockNumber(blockNumber);
        setInitialBlockNumber(blockNumber);
      });
    }
  }, [client]);

  useEffect(() => {
    if (client) {
      getBlockLogs();
    }
  }, [blockNumber]);

  return (
    <Box>
      <Typography variant="h5" mt={6}>
        Token activity
      </Typography>
      <Box mt={2}>
        <DataTable
          rows={tokenLogs}
          batchCount={Math.ceil(Number(initialBlockNumber) / BATCH_SIZE)}
          currentBatch={Math.ceil(
            Number(initialBlockNumber - blockNumber) / BATCH_SIZE
          )}
        />
      </Box>
      <Box mt={2}>
        <Typography variant="h5" mt={6}>
          User activity
        </Typography>
        <Box mt={2}>
          <DataTable
            rows={userLogs}
            batchCount={Math.ceil(Number(initialBlockNumber) / BATCH_SIZE)}
            currentBatch={Math.ceil(
              Number(initialBlockNumber - blockNumber) / BATCH_SIZE
            )}
          />
        </Box>
      </Box>
    </Box>
  );
}
