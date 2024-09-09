import * as React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress, {
  CircularProgressProps,
} from "@mui/material/CircularProgress";
import { ETH_DEAD_ADDRESS, PAGE_SIZE, ZERO_ADDRESS } from "@/utils/constants";
import { formatCurrency } from "@/contexts/ClientProvider";

const StyledGridOverlay = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  backgroundColor: "rgba(18, 18, 18, 0.9)",
  ...theme.applyStyles("light", {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  }),
}));

export interface TransactionLog {
  address: string;
  args: { from: string; to: string; value: bigint };
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

interface CustomLoadingOverlayProps {
  progress: number;
}

function CircularProgressWithLabel(
  props: CircularProgressProps & { value: number }
) {
  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <CircularProgress variant="determinate" {...props} />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="caption"
          component="div"
          color="text.primary"
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

function CustomLoadingOverlay({ progress }: CustomLoadingOverlayProps) {
  return (
    <StyledGridOverlay>
      <CircularProgressWithLabel value={progress} />
      <Box sx={{ mt: 2 }}>Loading rows…</Box>
    </StyledGridOverlay>
  );
}

const columns: GridColDef[] = [
  { field: "transactionHash", headerName: "Transaction Hash", width: 340 },
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
    width: 340,
    valueGetter: (_, row) => row.args?.from || row.args.owner,
  },
  {
    field: "to",
    headerName: "To",
    width: 340,
    valueGetter: (_, row) => row.args?.to || row.args.spender,
  },
  {
    field: "value",
    headerName: "Value",
    width: 150,
    valueGetter: (_, row) => formatCurrency(row?.args?.value || 0),
  },
];

export default function DataTable({ rows }: DataTableProps) {
  return (
    <Box mb={6}>
      <DataGrid
        sx={{
          height: 600,
          borderRadius: 2,
        }}
        slots={{
          loadingOverlay: () => (
            <CustomLoadingOverlay progress={100 * (rows.length / PAGE_SIZE)} />
          ),
        }}
        hideFooterPagination={true}
        hideFooter={true}
        loading={rows.length < PAGE_SIZE}
        rows={rows}
        columns={columns}
        getRowId={(row) => `${row.transactionHash}_${row.logIndex}`}
      />
    </Box>
  );
}
