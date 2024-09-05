"use client";
import NavBar from "@/components/Navbar";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Address, Hash, parseEther, stringify, TransactionReceipt } from "viem";
import SnackbarComponent from "@/components/SnackBar";
import { useClient } from "@/contexts/ClientProvider";

export default function Transfer() {
  const { account, client, chain } = useClient();

  const [fromAddress, setFromAddress] = useState<Address>();
  const [toAddress, setToAddress] = useState<Address>();
  const [ethAmount, setEthAmount] = useState<string>();
  const [snackbar, setSnackbar] = useState<React.ReactNode>(null);
  const [receipt, setReceipt] = useState<TransactionReceipt>();
  const [hash, setHash] = useState<Hash>();

  const showSnackbar = (
    message: string,
    severity?: "error" | "warning" | "info" | "success"
  ) => {
    setSnackbar(<SnackbarComponent message={message} severity={severity} />);
    // Clear the snackbar after 3 seconds
    setTimeout(() => setSnackbar(null), 3000);
  };

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

      showSnackbar(`Transaction sent successfully: ${hash}`, "success");
    } catch (error) {
      showSnackbar(`Failed to send transaction: ${error}`);
    }
  };

  useEffect(() => {
    (async () => {
      if (hash) {
        const receipt = await client!.waitForTransactionReceipt({ hash });
        setReceipt(receipt);
      }
    })();
  }, [hash]);

  const handleTransfer = () => {
    // Ensure toAddress is not an empty string and amount is not zero
    if (toAddress) {
      transferTokens();
    } else {
      console.warn("Invalid input values");
    }
  };

  return (
    <>
      <NavBar />
      <Container>
        <Typography variant="h4" component="h1" gutterBottom mt={2}>
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
            onClick={() => handleTransfer()}
            style={{ marginTop: "16px" }}
            disabled={!toAddress || !ethAmount}
          >
            Transfer tokens
          </Button>
          {receipt && (
            <div>
              Receipt:{" "}
              <pre>
                <code>{stringify(receipt, null, 2)}</code>
              </pre>
            </div>
          )}
        </Box>
      </Container>
      {snackbar}
    </>
  );
}
