import "viem/window";
import { Box, Button, Typography } from "@mui/material";
import { useClient } from "@/contexts/ClientProvider";

export default function HomePage() {
  const { account, connect, balances, busdTotalSupply } = useClient();

  if (!account) {
    return (
      <Box mt={6}>
        <Button variant="contained" onClick={connect}>
          Connect Wallet
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom mt={2} mb={4}>
        Dashboard
      </Typography>
      <Box
        borderRadius="4px"
        border="1px solid lightgray"
        padding={2}
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        mt={2}
      >
        <Box>
          <Typography mb={1} variant="body1">
            ETH Balance: {balances.eth} ETH
          </Typography>
          <Typography mb={1} variant="body1">
            BUSD Balance: {balances.busd} BUSD
          </Typography>
          <Typography variant="body1">
            BUSD total supply: {busdTotalSupply}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
