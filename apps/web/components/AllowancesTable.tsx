import * as React from "react";
import { GridColDef } from "@mui/x-data-grid";
import CustomDataTable from "./CustomDataTable";
import { formatCurrency } from "@/contexts/ClientProvider";

export interface Allowance {
  spender: string;
  amount: string;
}

interface DataTableProps {
  rows: Allowance[];
  loading?: boolean;
}

const columns: GridColDef[] = [
  {
    field: "spender",
    headerName: "Spender",
    width: 500,
    valueGetter: (_, row) => row.spender,
  },
  {
    field: "value",
    headerName: "Value",
    width: 150,
    valueGetter: (_, row) => formatCurrency(row.value),
  },
];

const AllowancesTable: React.FC<DataTableProps> = ({ rows, loading }) => {
  return (
    <CustomDataTable rows={rows} columns={columns} loading={loading} getRowId={(row) => row.spender} minHeight={200} />
  );
};

export default AllowancesTable;
