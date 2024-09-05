import React, { useState, useEffect } from "react";
import { Snackbar, Alert } from "@mui/material";

interface SnackbarProps {
  message: string;
  severity?: "error" | "warning" | "info" | "success";
}

const SnackbarComponent = ({
  message,
  severity = "warning",
}: SnackbarProps) => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(false);
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert severity={severity} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SnackbarComponent;
