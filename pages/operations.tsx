"use client";

import { Box, Button, MenuItem, Select, Typography } from "@mui/material";
import { useState } from "react";
import { Address, formatEther, parseEther } from "viem";
import { useClient } from "@/contexts/ClientProvider";
import { ERC20_ABI, ETH_DEAD_ADDRESS, SEPOLIA_DATA } from "@/utils/constants";
import { useSnackbar } from "notistack";
import CustomTextField from "@/components/CustomTextField";

export default function Operations() {
  const { account, client } = useClient();

  const [fromAddress, setFromAddress] = useState<Address>();
  const [toAddress, setToAddress] = useState<Address>();
  const [tokenAmount, setTokenAmount] = useState<string>();
  const { enqueueSnackbar } = useSnackbar();

  const [operation, setOperation] = useState<string>("");

  const isExecuteDisabled = () => {
    if (!operation) {
      return true;
    }

    if (operation !== "burn" && operation !== "mint" && !toAddress) {
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
    if (!client || !toAddress) {
      return;
    }

    try {
      const data = await client.writeContract({
        account: fromAddress || account!,
        address: SEPOLIA_DATA.tokens[0].address,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [toAddress, parseEther(tokenAmount!)],
        chain: SEPOLIA_DATA?.chain,
      });

      enqueueSnackbar(`Approve operation executed successfully: TX ${data}`, {
        variant: "success",
      });
    } catch (error) {
      enqueueSnackbar(`Failed to execute approve operation: ${error}`, {
        variant: "error",
      });
    }
  };

  const burnTokens = async () => {
    if (!client || !tokenAmount) {
      return;
    }

    // transfer to dead address
    const hash = await client.writeContract({
      address: SEPOLIA_DATA.tokens[0].address,
      chain: SEPOLIA_DATA.chain,
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
    if (!client) {
      return;
    }

    await client.writeContract({
      address: SEPOLIA_DATA.tokens[0].address,
      abi: ERC20_ABI,
      functionName: "mint",
      account: account!,
      chain: SEPOLIA_DATA?.chain,
      args: [parseEther(tokenAmount!)],
    });

    enqueueSnackbar(`Tokens minted successfully`, {
      variant: "success",
    });
  };

  const checkAllowance = async () => {
    if (!client || !toAddress) {
      return;
    }

    const data = await client.readContract({
      account: fromAddress || account!,
      address: SEPOLIA_DATA.tokens[0].address,
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

  const renderFields = () => {
    switch (operation) {
      case "approve":
        return (
          <>
            <CustomTextField
              fullWidth
              margin="normal"
              id="addressTo"
              label="To Address"
              variant="outlined"
              value={toAddress || ""}
              onChange={(e) => setToAddress(e.target.value as Address)}
            />
            <CustomTextField
              fullWidth
              margin="normal"
              id="amountTo"
              label="Amount (BUSD)"
              variant="outlined"
              value={tokenAmount || ""}
              onChange={(e) => setTokenAmount(e.target.value)}
            />
          </>
        );
      case "burn":
        return (
          <CustomTextField
            fullWidth
            margin="normal"
            id="amountTo"
            label="Amount (BUSD)"
            variant="outlined"
            value={tokenAmount || ""}
            onChange={(e) => setTokenAmount(e.target.value)}
          />
        );
      case "mint":
        return (
          <CustomTextField
            fullWidth
            margin="normal"
            id="amountTo"
            label="Amount (BUSD)"
            variant="outlined"
            value={tokenAmount || ""}
            onChange={(e) => setTokenAmount(e.target.value)}
          />
        );
      case "allowance":
        return (
          <>
            <CustomTextField
              fullWidth
              margin="normal"
              id="addressFrom"
              label="Owner Address"
              variant="outlined"
              value={fromAddress || ""}
              onChange={(e) => setFromAddress(e.target.value as Address)}
            />
            <CustomTextField
              fullWidth
              margin="normal"
              id="addressTo"
              label="Spender Address"
              variant="outlined"
              value={toAddress || ""}
              onChange={(e) => setToAddress(e.target.value as Address)}
            />
          </>
        );
      default:
        return null;
    }
  };

  const getExecuteOperationText = () => {
    switch (operation) {
      case "approve":
        return "Approve";
      case "burn":
        return "Burn";
      case "mint":
        return "Mint";
      case "allowance":
        return "Check Allowance";
      default:
        return "Execute";
    }
  };

  return (
    <Box>
      <Typography variant="h4" mt={2} mb={4} fontWeight={"bold"}>
        Operations
      </Typography>
      <Box
        component="form"
        noValidate
        autoComplete="off"
        mt={2}
        textAlign={"left"}
      >
        <Select
          sx={{ borderRadius: 2 }}
          fullWidth
          value={operation}
          onChange={(e) => setOperation(e.target.value as string)}
          displayEmpty
          renderValue={(selected) => {
            if (!selected) {
              return (
                <Typography color="textSecondary" variant="body1">
                  Select operation...
                </Typography>
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
            {renderFields()}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              onClick={() => handleExecuteOperation()}
              style={{ marginTop: "16px", borderRadius: 6 }}
              disabled={isExecuteDisabled()}
            >
              {getExecuteOperationText()}
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}
