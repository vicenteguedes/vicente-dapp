"use client";
import { Box, Button, TextField, Tooltip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Address, Hash, parseEther } from "viem";
import { useClient } from "@/contexts/ClientProvider";
import { useSnackbar } from "notistack";
import {
  ERC20_ABI,
  SEPOLIA_DATA,
  SEPOLIA_TX_BASE_URL,
} from "@/utils/constants";
import CircularProgress from "@mui/material/CircularProgress";

export default function Transfer() {
  const { account, client } = useClient();

  const [fromAddress, setFromAddress] = useState<Address>();
  const [toAddress, setToAddress] = useState<Address>();
  const [ethAmount, setEthAmount] = useState<string>();
  const { enqueueSnackbar } = useSnackbar();
  const [hash, setHash] = useState<Hash>();

  const transferTokens = async () => {
    try {
      if (!account || !client) {
        console.log("Account or client not defined");
        return;
      }

      if (ethAmount === undefined) {
        console.log("Invalid parameters");
        return;
      }

      const hash = await client.writeContract({
        address: SEPOLIA_DATA.tokens[0].address,
        chain: SEPOLIA_DATA.chain,
        account: fromAddress || account,
        abi: ERC20_ABI,
        functionName: fromAddress ? "transferFrom" : "transfer",
        args: [fromAddress, toAddress, parseEther(ethAmount)].filter(Boolean),
      });

      setHash(hash);
      enqueueSnackbar(`Your transaction is being processed: TX ${hash}`, {
        variant: "info",
      });
    } catch (error) {
      enqueueSnackbar(`Failed to send transaction: ${error}`, {
        variant: "error",
      });
    }
  };

  useEffect(() => {
    if (client && hash) {
      client.waitForTransactionReceipt({ hash }).then((receipt) => {
        console.log(receipt);
        enqueueSnackbar(
          `Transaction sent successfully! ${SEPOLIA_TX_BASE_URL}/${receipt.transactionHash}`,
          { variant: "success", autoHideDuration: 10000 }
        );

        setHash(undefined);
      });
    }
  }, [hash]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom mt={2}>
        Transfer tokens
      </Typography>
      <Box component="form" noValidate autoComplete="off" mt={2}>
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
        <TextField
          fullWidth
          margin="normal"
          id="addressTo"
          label="To Address"
          variant="outlined"
          value={toAddress || ""}
          onChange={(e) => setToAddress(e.target.value as Address)}
        />
        <TextField
          fullWidth
          margin="normal"
          id="amountTo"
          label="Amount (BUSD)"
          variant="outlined"
          value={ethAmount || ""}
          onChange={(e) => setEthAmount(e.target.value)}
        />
        {hash && (
          <Tooltip title="Transaction being confirmed...">
            <CircularProgress />
          </Tooltip>
        )}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={() => transferTokens()}
          style={{ marginTop: "16px" }}
          disabled={!toAddress || !ethAmount}
        >
          Transfer tokens
        </Button>
      </Box>
    </Box>
  );
}
