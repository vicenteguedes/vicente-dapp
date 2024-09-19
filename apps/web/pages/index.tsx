import "viem/window";
import { Box, Button, Typography } from "@mui/material";
import { useClient } from "@/contexts/ClientProvider";
import Activity from "@/components/Activity";
import CurrenciesInfo from "@/components/CurrenciesInfo";
import SwapModule from "@/components/SwapModule";

export default function HomePage() {
  const { account, connect } = useClient();

  if (!account) {
    return (
      <Box mt={6}>
        <Button variant="contained" onClick={connect} style={{ borderRadius: 6 }}>
          Connect Wallet
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" mt={2} fontWeight={"bold"}>
        Dashboard
      </Typography>
      <Box display="flex" justifyContent="flex-start" gap={2}>
        <CurrenciesInfo />
        <Box flex="1" display="flex" justifyContent="flex-end">
          <SwapModule />
        </Box>
      </Box>
      <Activity />
    </Box>
  );
}
