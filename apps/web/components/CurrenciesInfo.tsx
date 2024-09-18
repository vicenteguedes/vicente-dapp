import { useClient } from "@/contexts/ClientProvider";
import { Box, Paper, Typography } from "@mui/material";

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
            <Typography variant="h4">{balances.ETH}</Typography>
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
            <Typography variant="h4">{Number(balances.BUSD).toExponential(1)}</Typography>
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
          <Typography variant="h4">{Number(busdTotalSupply).toExponential(1)}</Typography>
        </Paper>
      </Box>
    </Box>
  );
}
