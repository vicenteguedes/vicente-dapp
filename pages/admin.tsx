"use client";
import NavBar from "@/components/Navbar";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { useState } from "react";
import SnackbarComponent from "@/components/SnackBar";
import { useClient } from "@/contexts/ClientProvider";
import { BUSD_TOKEN_ABI } from "@/utils/constants";
import { Address } from "viem";

export default function Admin() {
  const { account, client, chain, isOwner } = useClient();
  const [snackbar, setSnackbar] = useState<React.ReactNode>(null);
  const [toAddress, setToAddress] = useState<Address>();

  const showSnackbar = (
    message: string,
    severity?: "error" | "warning" | "info" | "success"
  ) => {
    setSnackbar(<SnackbarComponent message={message} severity={severity} />);
    // Clear the snackbar after 3 seconds
    setTimeout(() => setSnackbar(null), 3000);
  };

  const transferOwnership = async () => {
    try {
      if (!account || !client) {
        console.log("Account or client not defined");
        return;
      }

      const data = await client.writeContract({
        account: account!,
        address: account,
        abi: BUSD_TOKEN_ABI,
        functionName: "transferOwnership",
        chain,
        args: [toAddress],
      });

      showSnackbar(`Ownership transferred successfully: TX ${data}`, "success");
    } catch (error) {
      showSnackbar(`Failed to send transaction: ${error}`);
    }
  };

  const renounceOwnership = async () => {
    try {
      if (!account || !client) {
        console.log("Account or client not defined");
        return;
      }

      const data = await client.writeContract({
        account: account!,
        address: account,
        abi: BUSD_TOKEN_ABI,
        functionName: "renounceOwnership",
        chain,
      });

      showSnackbar(`Ownership renounced successfully: TX ${data}`, "success");
    } catch (error) {
      showSnackbar(`Failed to send transaction: ${error}`);
    }
  };

  return (
    <>
      <NavBar />
      <Container>
        <Typography variant="h4" component="h1" gutterBottom mt={2}>
          Admin dashboard
        </Typography>

        <Box component="form" noValidate autoComplete="off" mt={2}>
          <TextField
            fullWidth
            margin="normal"
            id="addressTo"
            label="Transfer to Address"
            variant="outlined"
            value={toAddress || ""}
            onChange={(e) => setToAddress(e.target.value as Address)}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={() => transferOwnership()}
            style={{ marginTop: "16px" }}
            disabled={!isOwner || !toAddress}
          >
            Transfer ownership
          </Button>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={() => renounceOwnership()}
            style={{ marginTop: "16px" }}
            disabled={!isOwner}
          >
            Renounce ownership
          </Button>
        </Box>
      </Container>
      {snackbar}
    </>
  );
}
