"use client";
import Wallet from "@/components/Wallet";
import NavBar from "@/components/Navbar";
import { Container } from "@mui/material";

export default function HomePage() {
  return (
    <>
      <NavBar />
      <Container>
        <Wallet />
      </Container>
    </>
  );
}
