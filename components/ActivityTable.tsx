import * as React from "react";
import { GridColDef } from "@mui/x-data-grid";
import { ETH_DEAD_ADDRESS, PAGE_SIZE, ZERO_ADDRESS } from "@/utils/constants";
import { formatCurrency } from "@/contexts/ClientProvider";
import CustomDataTable from "./CustomDataTable";

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

interface DataTableProps {
  rows: TransactionLog[];
  batchCount: number;
  currentBatch: number;
}

const columns: GridColDef[] = [
  { field: "transactionHash", headerName: "Transaction Hash", width: 220 },
  {
    field: "eventName",
    headerName: "Event Name",
    width: 120,
    valueGetter: (_, row) =>
      row.eventName === "Transfer" && row.args?.from === ZERO_ADDRESS
        ? "Mint"
        : row.eventName === "Transfer" && row.args?.to === ETH_DEAD_ADDRESS
        ? "Burn"
        : row.eventName,
  },
  {
    field: "blockNumber",
    headerName: "Block Number",
    width: 150,
    valueGetter: (value: bigint) => value?.toString(),
  },
  {
    field: "from",
    headerName: "From",
    width: 220,
    valueGetter: (_, row) => row.args?.from || row.args?.owner,
  },
  {
    field: "to",
    headerName: "To",
    width: 220,
    valueGetter: (_, row) => row.args?.to || row.args?.spender,
  },
  {
    field: "value",
    headerName: "Value",
    width: 150,
    valueGetter: (_, row) => formatCurrency(row?.args?.value || 0),
  },
];

export default function ActivityDataTable({
  rows,
  currentBatch,
  batchCount,
}: DataTableProps) {
  return (
    <CustomDataTable
      rows={rows}
      columns={columns}
      loading={rows.length < PAGE_SIZE && currentBatch < batchCount}
      getRowId={(row) => `${row.transactionHash}_${row.logIndex}`}
      height={600}
      progress={
        100 * Math.max(rows.length / PAGE_SIZE, currentBatch / batchCount)
      }
    />
  );
}
