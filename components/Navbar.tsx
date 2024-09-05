import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import AdbIcon from "@mui/icons-material/Adb";
import Link from "next/link";
import { useClient } from "@/contexts/ClientProvider";

const CLIENT_PAGES = ["Transfer", "Operations", "Admin"];

function NavBar() {
  const { account } = useClient();

  return (
    <AppBar position="static" style={{ marginBottom: 10 }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <AdbIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
          <Link
            href={"/"}
            style={{
              textDecoration: "none",
            }}
          >
            <Button sx={{ my: 2, color: "white", display: "block" }}>
              DAPP
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
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default NavBar;
