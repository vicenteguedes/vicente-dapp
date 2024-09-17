"use client";

import { useClient } from "@/contexts/ClientProvider";
import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import ActivityDataTable from "./ActivityTable";
import AllowancesTable, { Allowance } from "./AllowancesTable";
import AccordionSection from "./AccordionSection";
import api, { ALLOWANCES_ENDPOINT, DAILY_VOLUME_ENDPOINT, TRANSACTIONS_ENDPOINT, WS_URL } from "@/api";
import { DailyVolume, Transaction } from "@repo/api-types";
import DailyVolumeChart from "./DailyVolumeChart";
import useWebSocket from "react-use-websocket";
import { PAGE_SIZE, ZERO_ADDRESS } from "@/utils/constants";
import { useSnackbar } from "notistack";

export default function Activity() {
  const { account } = useClient();

  const [userAllowances, setUserAllowances] = useState<Allowance[]>([]);
  const [tokenTransactions, setTokenTransactions] = useState<Transaction[]>([]);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [dailyVolume, setDailyVolume] = useState<DailyVolume[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  // push logs until we reach PAGE_SIZE
  const mergeTransactions = (newTransactions: Transaction[], previousTransactions: Transaction[]) =>
    [...newTransactions, ...previousTransactions].slice(0, PAGE_SIZE);

  useWebSocket(WS_URL, {
    onOpen: () => {
      console.log("WebSocket connection established.");
    },
    share: true,
    filter: () => false,
    retryOnError: true,
    shouldReconnect: () => true,
    onMessage: (event) => {
      console.log("WebSocket message received:", event.data);

      const newTransactions = JSON.parse(event.data).map((log: Transaction) => ({
        ...log,
        timestamp: new Date().getTime(),
      }));

      const newUserTransactions = newTransactions.filter(
        (transaction: Transaction) =>
          transaction.from === account ||
          (transaction.to === account && transaction.eventName === "Transfer" && transaction.from === ZERO_ADDRESS)
      );

      const hasUserTransactions = newUserTransactions?.length;

      enqueueSnackbar(`${hasUserTransactions ? "New user activity detected!" : "New transaction detected!"} `, {
        variant: hasUserTransactions ? "success" : "info",
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      });

      setTokenTransactions((prev) => mergeTransactions(newTransactions, prev));
      setUserTransactions((prev) => mergeTransactions(newUserTransactions, prev));
    },
    onClose: () => {
      console.log("WebSocket connection closed.");
    },
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      Promise.all([
        api.get(`${TRANSACTIONS_ENDPOINT}`).then(({ data }) => {
          setTokenTransactions(data);
        }),

        api.get(`${TRANSACTIONS_ENDPOINT}?account=${account}`).then(({ data }) => {
          setUserTransactions(data);
        }),

        api.get(`${ALLOWANCES_ENDPOINT}?account=${account}`).then(({ data }) => {
          setUserAllowances(data);
        }),
      ]);
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    api.get(DAILY_VOLUME_ENDPOINT).then(({ data }) => {
      setDailyVolume(data);
    });
  }, []);

  return (
    <Box>
      <Box mt={6}>
        <AccordionSection title="Token Activity">
          <ActivityDataTable rows={tokenTransactions} />
        </AccordionSection>
      </Box>

      <Box mt={3}>
        <AccordionSection title="User Activity">
          <ActivityDataTable rows={userTransactions} />
        </AccordionSection>
      </Box>

      <Box mt={3}>
        <AccordionSection title="User Allowances">
          <AllowancesTable rows={userAllowances} />
        </AccordionSection>
      </Box>
      <Box mt={3}>
        <AccordionSection title="Daily volume">
          <DailyVolumeChart data={dailyVolume} />
        </AccordionSection>
      </Box>
    </Box>
  );
}
