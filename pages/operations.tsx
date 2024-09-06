"use client";

import {
  Box,
  Button,
  Container,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Address, formatEther, parseEther } from "viem";
import { useClient } from "@/contexts/ClientProvider";
import { ERC20_ABI, ETH_DEAD_ADDRESS } from "@/utils/constants";
import { useSnackbar } from "notistack";

export default function Operations() {
  const { account, client, chainData } = useClient();

  const [fromAddress, setFromAddress] = useState<Address>();
  const [toAddress, setToAddress] = useState<Address>();
  const [tokenAmount, setTokenAmount] = useState<string>();
  const { enqueueSnackbar } = useSnackbar();

  const [operation, setOperation] = useState<string>("");

  const isDisabled = () => {
    if (!operation) {
      return true;
    }

    if (operation !== "burn" && !toAddress) {
      return true;
    }

    if (operation !== "allowance" && !tokenAmount) {
      return true;
    }

    return false;
  };

  const handleExecuteOperation = () => {
    switch (operation) {
      case "approve":
        approveTokens();
        break;
      case "burn":
        burnTokens();
        break;
      case "mint":
        mintTokens();
        break;
      case "allowance":
        checkAllowance();
        break;
      default:
        console.log("Invalid operation selected");
    }
  };

  const approveTokens = async () => {
    if (!client || !chainData || !toAddress) {
      return;
    }

    const data = await client.writeContract({
      account: fromAddress || account!,
      address: chainData.tokens[0].address,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [toAddress, parseEther(tokenAmount!)],
      chain: chainData?.chain,
    });

    enqueueSnackbar(`Approve operation executed successfully: TX ${data}`, {
      variant: "success",
    });
  };

  const burnTokens = async () => {
    if (!client || !tokenAmount || !chainData) {
      return;
    }

    // transfer to dead address
    const hash = await client.writeContract({
      address: chainData.tokens[0].address,
      chain: chainData.chain,
      account: account!,
      abi: ERC20_ABI,
      functionName: "transfer",
      args: [ETH_DEAD_ADDRESS, parseEther(tokenAmount)],
    });

    enqueueSnackbar(`Tokens burned successfully: ${hash}`, {
      variant: "success",
    });
  };

  const mintTokens = async () => {
    if (!client || !chainData) {
      return;
    }

    await client.writeContract({
      address: chainData.tokens[0].address,
      abi: ERC20_ABI,
      functionName: "mint",
      account: account!,
      chain: chainData?.chain,
      args: [parseEther(tokenAmount!)],
    });

    enqueueSnackbar(`Tokens minted successfully`, {
      variant: "success",
    });
  };

  const checkAllowance = async () => {
    if (!client || !chainData || !toAddress) {
      return;
    }

    const data = await client.readContract({
      account: fromAddress || account!,
      address: chainData.tokens[0].address,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: [fromAddress || account, toAddress],
    });

    enqueueSnackbar(
      `Allowance from owner to spender: ${formatEther(data as bigint)} BUSD`,
      {
        variant: "success",
      }
    );
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom mt={2} mb={4}>
        Operations
      </Typography>
      <Box component="form" noValidate autoComplete="off" mt={2}>
        <Select
          fullWidth
          value={operation}
          onChange={(e) => setOperation(e.target.value as string)}
          displayEmpty
          renderValue={(selected) => {
            if (!selected) {
              return (
                <Typography variant="body1">Select operation...</Typography>
              );
            }

            return selected.charAt(0).toUpperCase() + selected.slice(1);
          }}
        >
          <MenuItem value="approve">Approve</MenuItem>
          <MenuItem value="burn">Burn</MenuItem>
          <MenuItem value="mint">Mint</MenuItem>
          <MenuItem value="allowance">Allowance</MenuItem>
        </Select>
        {operation && (
          <>
            {operation !== "burn" && (
              <>
                {operation !== "mint" && (
                  <TextField
                    fullWidth
                    margin="normal"
                    id="addressFrom"
                    label="From Address (leave empty to use your account)"
                    variant="outlined"
                    value={fromAddress || ""}
                    placeholder={account || ""}
                    onChange={(e) => setFromAddress(e.target.value as Address)}
                  />
                )}
                <TextField
                  fullWidth
                  margin="normal"
                  id="addressTo"
                  label="To Address"
                  variant="outlined"
                  value={toAddress || ""}
                  onChange={(e) => setToAddress(e.target.value as Address)}
                />
              </>
            )}

            {operation !== "allowance" && (
              <TextField
                fullWidth
                margin="normal"
                id="amountTo"
                label="Amount (BUSD)"
                variant="outlined"
                value={tokenAmount || ""}
                onChange={(e) => setTokenAmount(e.target.value)}
              />
            )}

            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              onClick={() => handleExecuteOperation()}
              style={{ marginTop: "16px" }}
              disabled={isDisabled()}
            >
              Execute operation
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
}
