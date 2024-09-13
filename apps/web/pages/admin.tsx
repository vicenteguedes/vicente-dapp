"use client";
import { Box, Button, Typography } from "@mui/material";
import { useState } from "react";
import { useClient } from "@/contexts/ClientProvider";
import { Address } from "viem";
import { useSnackbar } from "notistack";
import CustomTextField from "@/components/CustomTextField";
import { ERC20_ABI, SEPOLIA_DATA } from "@repo/common";

export default function Admin() {
  const { account, client, isOwner } = useClient();
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
        chain: SEPOLIA_DATA.chain,
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
        chain: SEPOLIA_DATA.chain,
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
      <Typography variant="h4" mt={2} fontWeight={"bold"}>
        Admin dashboard
      </Typography>

      <Box component="form" noValidate autoComplete="off" mt={2}>
        <CustomTextField
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
          style={{ marginTop: "16px", borderRadius: 6 }}
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
          style={{ marginTop: "16px", borderRadius: 6 }}
          disabled={!isOwner}
        >
          Renounce ownership
        </Button>
      </Box>
    </Box>
  );
}
