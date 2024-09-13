import React from "react";
import { Box, CircularProgress, styled } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

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

function CircularProgressWithLabel() {
  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <CircularProgress variant="determinate" />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      ></Box>
    </Box>
  );
}

function CustomLoadingOverlay() {
  return (
    <StyledGridOverlay>
      <CircularProgressWithLabel />
      <Box sx={{ mt: 2 }}>Loading rows…</Box>
    </StyledGridOverlay>
  );
}

interface CustomDataTableProps<T> {
  rows: T[];
  columns: GridColDef[];
  loading?: boolean;
  getRowId: (row: T) => string;
  height?: number;
  minHeight?: number;
}

const CustomDataTable = <T,>({ rows, columns, loading, getRowId, minHeight, height }: CustomDataTableProps<T>) => {
  return (
    <Box mb={1}>
      <DataGrid
        sx={{
          height,
          minHeight,
          borderRadius: 2,
        }}
        slots={{
          loadingOverlay: () => <CustomLoadingOverlay />,
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
