import "viem/window";
import { Box, Button, Typography } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useClient } from "@/contexts/ClientProvider";
import { useEffect, useState } from "react";
import { formatEther, PublicActions } from "viem";
import { ERC20_ABI } from "@/utils/constants";

export default function Wallet() {
  const { account, connect, providers, getClient, chainData } = useClient();
  const [balances, setBalances] = useState({ eth: "0", busd: "0" });
  const [busdTotalSupply, setBusdTotalSupply] = useState("0");

  const formatCurrency = (value: unknown) => {
    return Number(formatEther(value as bigint)).toFixed(6);
  };

  const getBUSDBalance = async (client: PublicActions) => {
    if (!chainData) {
      return 0;
    }

    const busdBalance = await client.readContract({
      address: chainData.tokens[0].address,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [account],
    });

    return formatCurrency(busdBalance);
  };

  const getBalances = async () => {
    try {
      if (!account) {
        return;
      }
      const client = getClient();

      const ethBalance = await client.getBalance({
        address: account,
      });

      const busdBalance = await getBUSDBalance(client);

      setBalances({
        eth: formatCurrency(ethBalance).toString(),
        busd: busdBalance.toString(),
      });
    } catch (error) {
      console.error("Failed to get balances:", error);
    }
  };

  const getTotalSupply = async () => {
    try {
      if (!account || !chainData) {
        return;
      }
      const client = getClient();

      const busdSupply = await client.readContract({
        address: chainData.tokens[0].address,
        abi: ERC20_ABI,
        functionName: "totalSupply",
      });

      setBusdTotalSupply(formatCurrency(busdSupply));
    } catch (error) {
      console.error("Failed to get supply:", error);
    }
  };

  useEffect(() => {
    if (account) {
      getBalances();
      getTotalSupply();
    }
  }, [account, chainData]);

  useEffect(() => {
    const interval = setInterval(async () => {
      await getBalances();
    }, 60000); // 60 seconds interval

    return () => clearInterval(interval);
  }, [getBalances]);

  if (!account) {
    return (
      <Box className="App" mt={6}>
        <Button variant="contained" onClick={connect}>
          Connect Wallet
        </Button>
      </Box>
    );
  }

  return (
    <Box className="App">
      <Typography variant="h5" mt={2}>
        Wallets Detected:
      </Typography>
      <Box>
        {providers.length > 0 ? (
          providers?.map((provider: EIP6963ProviderDetail) => (
            <Box key={provider.info.name} display={"flex"}>
              <img src={provider.info.icon} alt={provider.info.name} />
              <Typography variant="h6" m={2}>
                {provider.info.name}
              </Typography>
            </Box>
          ))
        ) : (
          <Box>No Wallet Providers</Box>
        )}

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={getBalances}
        >
          Refresh
        </Button>

        <Typography mt={2} mb={1} variant="body1">
          ETH Balance {balances.eth} ETH
        </Typography>
        <Typography mb={1} variant="body1">
          BUSD Balance: {balances.busd} BUSD
        </Typography>

        <Box>
          <Typography variant="body1">{`BUSD total supply: ${busdTotalSupply}`}</Typography>
        </Box>
      </Box>
    </Box>
  );
}
