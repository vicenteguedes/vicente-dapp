"use client";

import NavBar from "@/components/Navbar";
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
import { Address, parseEther } from "viem";
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
    if (!client || !tokenAmount) {
      return;
    }

    // transfer to dead address
    const hash = await client.sendTransaction({
      account: (fromAddress || account) as Address,
      to: ETH_DEAD_ADDRESS,
      value: parseEther(tokenAmount),
      chain: chainData?.chain,
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

  return (
    <>
      <NavBar />
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
                      onChange={(e) =>
                        setFromAddress(e.target.value as Address)
                      }
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

              <TextField
                fullWidth
                margin="normal"
                id="amountTo"
                label="Amount (ETH)"
                variant="outlined"
                value={tokenAmount || ""}
                onChange={(e) => setTokenAmount(e.target.value)}
              />

              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                onClick={() => handleExecuteOperation()}
                style={{ marginTop: "16px" }}
                disabled={!tokenAmount || !operation}
              >
                Execute operation
              </Button>
            </>
          )}
        </Box>
      </Container>
    </>
  );
}
