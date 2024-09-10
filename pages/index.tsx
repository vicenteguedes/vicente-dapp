import "viem/window";
import { Box, Button, Paper, Typography } from "@mui/material";
import { useClient } from "@/contexts/ClientProvider";
import Activity from "@/components/Activity";

export default function HomePage() {
  const { account, connect, balances, busdTotalSupply } = useClient();

  if (!account) {
    return (
      <Box mt={6}>
        <Button
          variant="contained"
          onClick={connect}
          style={{ borderRadius: 6 }}
        >
          Connect Wallet
        </Button>
      </Box>
    );
  }

  function CurrenciesInfo() {
    return (
      <Box>
        <Typography variant="h4" mt={2} fontWeight={"bold"}>
          Dashboard
        </Typography>
        <Box
          sx={{
            borderRadius: 2,
            border: 1,
            borderColor: "divider",
            p: 3,
            display: "inline-block",
            marginTop: 4,
            minWidth: 552,
            maxWidth: 1200,
          }}
        >
          <Box display="flex" justifyContent="space-between" gap={2}>
            <Paper
              sx={{
                flex: 1,
                p: 2,
                display: "flex",
                flexDirection: "column",
                gap: 1,
                boxShadow: "none",
                minWidth: 130,
              }}
            >
              <Typography variant="body2" color="textSecondary">
                ETH Balance
              </Typography>
              <Typography variant="h3">{balances.eth}</Typography>
            </Paper>

            <Paper
              sx={{
                flex: 1,
                p: 2,
                display: "flex",
                flexDirection: "column",
                gap: 1,
                boxShadow: "none",
              }}
            >
              <Typography variant="body2" color="textSecondary">
                BUSD Balance
              </Typography>
              <Typography variant="h3">{balances.busd}</Typography>
            </Paper>
          </Box>

          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 1,
              boxShadow: "none",
              minWidth: 130,
              alignSelf: "flex-end",
            }}
          >
            <Typography variant="body2" color="textSecondary">
              BUSD Total Supply
            </Typography>
            <Typography variant="h4">{busdTotalSupply}</Typography>
          </Paper>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <CurrenciesInfo />
      <Activity />
    </Box>
  );
}
