import * as React from "react";
import { GridColDef } from "@mui/x-data-grid";
import { formatEther } from "viem";
import CustomDataTable from "./CustomDataTable";

export interface Allowance {
  spender: string;
  amount: string;
}

interface DataTableProps {
  rows: Allowance[];
}

const columns: GridColDef[] = [
  {
    field: "spender",
    headerName: "Spender",
    width: 500,
    valueGetter: (_, row) => row.spender,
  },
  {
    field: "amount",
    headerName: "Amount",
    width: 150,
    valueGetter: (_, row) => formatEther(row.amount),
  },
];

const AllowancesTable: React.FC<DataTableProps> = ({ rows }) => {
  return <CustomDataTable rows={rows} columns={columns} getRowId={(row) => row.spender} minHeight={200} />;
};

export default AllowancesTable;
