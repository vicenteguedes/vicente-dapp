import * as React from "react";
import { GridColDef } from "@mui/x-data-grid";
import { formatCurrency } from "@/contexts/ClientProvider";
import CustomDataTable from "./CustomDataTable";
import { Transaction } from "@repo/api-types";
import { ETH_DEAD_ADDRESS, ZERO_ADDRESS } from "@/utils/constants";

interface DataTableProps {
  rows: Transaction[];
  loading?: boolean;
}

const columns: GridColDef[] = [
  { field: "transactionHash", headerName: "Transaction Hash", width: 220 },
  {
    field: "eventName",
    headerName: "Event Name",
    width: 120,
    valueGetter: (_, row) =>
      row.eventName === "Transfer" && row.from === ZERO_ADDRESS
        ? "Mint"
        : row.eventName === "Transfer" && row.to.toLowerCase() === ETH_DEAD_ADDRESS
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
    valueGetter: (_, row) => row.from,
  },
  {
    field: "to",
    headerName: "To",
    width: 220,
    valueGetter: (_, row) => row.to,
  },
  {
    field: "value",
    headerName: "Value",
    width: 150,
    valueGetter: (_, row) => formatCurrency(row.value || 0),
  },
];

export default function ActivityDataTable({ rows, loading }: DataTableProps) {
  return <CustomDataTable rows={rows} columns={columns} loading={loading} getRowId={(row) => row.id} height={600} />;
}
