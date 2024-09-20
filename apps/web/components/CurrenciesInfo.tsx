import { useClient } from "@/contexts/ClientProvider";
import { Box, Paper, Typography } from "@mui/material";
import { formatEther } from "viem";

export default function CurrenciesInfo() {
  const { balances, busdTotalSupply } = useClient();

  return (
    <Box>
      <Box
        sx={{
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
          p: 3,
          display: "inline-block",
          marginTop: 4,
        }}
      >
        <Paper
          sx={{
            flex: 1,
            p: 1,
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
          <Typography variant="h4">{balances.ETH}</Typography>
        </Paper>

        <Paper
          sx={{
            flex: 1,
            p: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            boxShadow: "none",
          }}
        >
          <Typography variant="body2" color="textSecondary">
            BUSD Balance
          </Typography>
          <Typography variant="h4">
            {balances.BUSD ? Number(formatEther(BigInt(balances.BUSD))).toExponential(4) : 0}
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 1,
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
          <Typography variant="h4">{Number(formatEther(BigInt(busdTotalSupply))).toExponential(1)}</Typography>
        </Paper>
      </Box>
    </Box>
  );
}
