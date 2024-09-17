import React, { useEffect, useState } from "react";
import { Box, darken, lighten, styled, Theme } from "@mui/material";
import { DataGrid, GridColDef, GridRowIdGetter, GridValidRowModel } from "@mui/x-data-grid";

const getBackgroundColor = (color: string, theme: Theme, coefficient: number) => ({
  backgroundColor: darken(color, coefficient),
  ...theme.applyStyles("light", {
    backgroundColor: lighten(color, coefficient),
  }),
});

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  "& .super-app-theme--new": {
    ...getBackgroundColor(theme.palette.success.main, theme, 0.3),
    "&:hover": {
      ...getBackgroundColor(theme.palette.success.main, theme, 0.6),
    },
    "&.Mui-selected": {
      ...getBackgroundColor(theme.palette.success.main, theme, 0.5),
      "&:hover": {
        ...getBackgroundColor(theme.palette.success.main, theme, 0.4),
      },
    },
  },
}));

interface CustomDataTableProps<T> {
  rows: T[];
  columns: GridColDef[];
  loading?: boolean;
  getRowId: GridRowIdGetter<GridValidRowModel>;
  height?: number;
  minHeight?: number;
}

const CustomDataTable = <T extends GridValidRowModel>({
  rows,
  columns,
  loading,
  getRowId,
  minHeight,
  height,
}: CustomDataTableProps<T>) => {
  const [currentRows, setCurrentRows] = useState(rows);

  const isNew = (row: T) => row.timestamp > new Date().getTime() - 3000;

  useEffect(() => {
    // timestamp is newer than 3 seconds
    const newRows = rows.filter(isNew);

    newRows.forEach((row) => {
      const timerId = setTimeout(() => {
        setCurrentRows((prevRows) => prevRows.map((r) => (r.id === row.id ? { ...r, status: "old" } : r)));
      }, 3000);

      return () => clearTimeout(timerId);
    });
  }, [currentRows]);

  useEffect(() => {
    setCurrentRows(rows.map((row) => ({ ...row, status: isNew(row) ? "new" : "old" })));
  }, [rows]);

  return (
    <Box mb={1}>
      <StyledDataGrid
        sx={{
          height,
          minHeight,
          borderRadius: 2,
        }}
        hideFooterPagination
        hideFooter
        loading={loading}
        rows={currentRows}
        columns={columns}
        getRowId={getRowId}
        getRowClassName={(params) => `super-app-theme--${params.row.status}`}
      />
    </Box>
  );
};

export default CustomDataTable;
