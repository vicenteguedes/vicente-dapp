import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import CurrencyExchange from "@mui/icons-material/CurrencyExchange";
import Link from "next/link";
import { useClient } from "@/contexts/ClientProvider";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import RefreshIcon from "@mui/icons-material/Refresh";
import { IconButton, Tooltip } from "@mui/material";

const CLIENT_PAGES = ["Transfer", "Operations", "Admin"];

function NavBar() {
  const { account, refreshBalances, providerInfo } = useClient();

  return (
    <AppBar position="static" style={{ marginBottom: 10 }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <CurrencyExchange
            sx={{ display: { xs: "none", md: "flex" }, mr: 1 }}
          />
          <Link
            href={"/"}
            style={{
              textDecoration: "none",
            }}
          >
            <Button
              sx={{
                my: 2,
                color: "white",
                display: "block",
              }}
            >
              Home
            </Button>
          </Link>

          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {account &&
              CLIENT_PAGES.map((page) => (
                <Link
                  href={`/${page.toLowerCase()}`}
                  style={{
                    textDecoration: "none",
                  }}
                  key={page}
                >
                  <Button
                    key={page}
                    sx={{ my: 2, color: "white", display: "block" }}
                  >
                    {page}
                  </Button>
                </Link>
              ))}
          </Box>

          {account && (
            <Box
              sx={{ display: "flex", justifyContent: "flex-end" }}
              alignItems={"center"}
            >
              <Tooltip title={`Provider: ${providerInfo.name}`}>
                <img
                  src={providerInfo.icon}
                  alt={providerInfo.name}
                  style={{ width: 20, height: 20, marginRight: 10 }}
                />
              </Tooltip>

              <Tooltip title="Refresh information">
                <IconButton
                  onClick={refreshBalances}
                  sx={{
                    display: { xs: "none", md: "flex", color: "white" },
                    mr: 1,
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <AccountBalanceWalletIcon
                sx={{ display: { xs: "none", md: "flex" } }}
              />
              <Tooltip title="Click to copy">
                <Button
                  sx={{
                    my: 2,
                    color: "white",
                    display: "block",
                    textTransform: "none",
                  }}
                  onClick={() => navigator.clipboard.writeText(account)}
                >
                  {account.slice(0, 6) + "..." + account.slice(-4)}
                </Button>
              </Tooltip>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default NavBar;
