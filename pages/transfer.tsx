"use client";
import NavBar from "@/components/Navbar";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Address, Hash, parseEther } from "viem";
import { useClient } from "@/contexts/ClientProvider";
import { useSnackbar } from "notistack";

const SEPOLIA_TX_BASE_URL = "https://sepolia.etherscan.io/tx/";

export default function Transfer() {
  const { account, client, chain } = useClient();

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

      const hash = await client.sendTransaction({
        account: fromAddress || account,
        to: toAddress,
        value: parseEther(ethAmount),
        chain,
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
    (async () => {
      if (hash) {
        const receipt = await client!.waitForTransactionReceipt({ hash });

        enqueueSnackbar(
          `Transaction sent successfully! ${SEPOLIA_TX_BASE_URL}/${receipt.transactionHash}`,
          { variant: "success", autoHideDuration: 10000 }
        );
      }
    })();
  }, [hash]);

  return (
    <>
      <NavBar />
      <Container>
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
            label="Amount (ETH)"
            variant="outlined"
            value={ethAmount || ""}
            onChange={(e) => setEthAmount(e.target.value)}
          />
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
      </Container>
    </>
  );
}
