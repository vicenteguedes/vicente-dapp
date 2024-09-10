import React from "react";
import {
  Box,
  CircularProgress,
  CircularProgressProps,
  styled,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface CustomLoadingOverlayProps {
  progress: number;
}

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

interface CustomDataTableProps<T> {
  rows: T[];
  columns: GridColDef[];
  loading: boolean;
  getRowId: (row: T) => string;
  height?: number;
  minHeight?: number;
  progress: number;
}

const CustomDataTable = <T,>({
  rows,
  columns,
  loading,
  getRowId,
  minHeight,
  height,
  progress,
}: CustomDataTableProps<T>) => {
  return (
    <Box mb={1}>
      <DataGrid
        sx={{
          height,
          minHeight,
          borderRadius: 2,
        }}
        slots={{
          loadingOverlay: () => <CustomLoadingOverlay progress={progress} />,
        }}
        hideFooterPagination={true}
        hideFooter={true}
        loading={loading}
        rows={rows}
        columns={columns}
        getRowId={getRowId}
      />
    </Box>
  );
};

export default CustomDataTable;
