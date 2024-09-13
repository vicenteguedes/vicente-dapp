"use client";

import { useClient } from "@/contexts/ClientProvider";
import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import ActivityDataTable from "./ActivityTable";
import AllowancesTable, { Allowance } from "./AllowancesTable";
import AccordionSection from "./AccordionSection";
import api, { ALLOWANCES_ENDPOINT, DAILY_VOLUME_ENDPOINT, TRANSACTIONS_ENDPOINT } from "@/api";
import { DailyVolume, Transaction } from "@repo/api-types";
import TransactionsChart from "./TransactionsChart";

export default function Activity() {
  const { account } = useClient();

  const [userAllowances, setUserAllowances] = useState<Allowance[]>([]);
  const [tokenTransactions, setTokenTransactions] = useState<Transaction[]>([]);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [dailyVolume, setDailyVolume] = useState<DailyVolume[]>([]);

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
          <TransactionsChart data={dailyVolume} />
        </AccordionSection>
      </Box>
    </Box>
  );
}
