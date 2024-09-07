"use client";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useClient } from "@/contexts/ClientProvider";
import { ERC20_ABI } from "@/utils/constants";
import { Address } from "viem";
import { useSnackbar } from "notistack";

export default function Admin() {
  const { account, client, chainData, isOwner } = useClient();
  const { enqueueSnackbar } = useSnackbar();

  const [toAddress, setToAddress] = useState<Address>();

  const transferOwnership = async () => {
    try {
      if (!account || !client) {
        console.log("Account or client not defined");
        return;
      }

      const data = await client.writeContract({
        account: account!,
        address: account,
        abi: ERC20_ABI,
        functionName: "transferOwnership",
        chain: chainData?.chain,
        args: [toAddress],
      });

      enqueueSnackbar(`Ownership transferred successfully: TX ${data}`, {
        variant: "success",
      });
    } catch (error) {
      enqueueSnackbar(`Failed to transfer ownership: ${error}`, {
        variant: "error",
      });
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
        abi: ERC20_ABI,
        functionName: "renounceOwnership",
        chain: chainData?.chain,
      });

      enqueueSnackbar(`Ownership renounced successfully: TX ${data}`, {
        variant: "success",
      });
    } catch (error) {
      enqueueSnackbar(`Failed to renounce ownership: ${error}`, {
        variant: "error",
      });
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom mt={2}>
        Admin dashboard
      </Typography>

      <Box component="form" noValidate autoComplete="off" mt={2}>
        <TextField
          fullWidth
          margin="normal"
          id="addressTo"
          label="Transfer ownership to address"
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
    </Box>
  );
}
