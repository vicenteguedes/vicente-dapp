import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  CircularProgressProps,
  darken,
  lighten,
  styled,
  Theme,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef, GridRowIdGetter, GridRowModelUpdate, GridValidRowModel } from "@mui/x-data-grid";

const getBackgroundColor = (color: string, theme: Theme, coefficient: number) => ({
  backgroundColor: darken(color, coefficient),
  ...theme.applyStyles("light", {
    backgroundColor: lighten(color, coefficient),
  }),
});

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  "& .super-app-theme--new": {
    ...getBackgroundColor(theme.palette.success.main, theme, 0.7),
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
  getRowId: GridRowIdGetter<GridValidRowModel>;
  height?: number;
  minHeight?: number;
}

const CustomDataTable = <T extends GridValidRowModel>({
  rows,
  columns,
  getRowId,
  minHeight,
  height,
}: CustomDataTableProps<T>) => {
  const [currentRows, setCurrentRows] = useState(rows);

  useEffect(() => {
    const newRows = rows.filter((row) => row.status === "new");

    newRows.forEach((row) => {
      const timerId = setTimeout(() => {
        setCurrentRows((prevRows) => prevRows.map((r) => (r === row ? { ...r, status: "old" } : r)));
      }, 10000);

      return () => clearTimeout(timerId);
    });
  }, [currentRows]);

  useEffect(() => {
    setCurrentRows(rows);
  }, [rows]);

  console.log("currentRows: ", currentRows);

  return (
    <Box mb={1}>
      <StyledDataGrid
        sx={{
          height,
          minHeight,
          borderRadius: 2,
        }}
        hideFooterPagination={true}
        hideFooter={true}
        rows={currentRows}
        columns={columns}
        getRowId={getRowId}
        getRowClassName={(params) => `super-app-theme--${params.row.status}`}
      />
    </Box>
  );
};

export default CustomDataTable;
