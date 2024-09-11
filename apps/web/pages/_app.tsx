import "../styles/global.css";
import { AppProps } from "next/app";
import { ClientProvider } from "@/contexts/ClientProvider";
import Head from "next/head";
import withAccount from "@/HOC/withAccount";
import { SnackbarProvider } from "notistack";
import NavBar from "@/components/Navbar";
import { Container } from "@mui/material";

export default function App({ Component, pageProps }: AppProps) {
  const ComponentWithAccount = withAccount(Component);

  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
    >
      <ClientProvider>
        <Head>
          <title>Awesome Dapp</title>
          <link
            rel="icon"
            href="https://sepolia.dev/wp-content/uploads/2022/04/FAVICON.png"
            type="image/png"
            sizes="16x16"
          />
        </Head>
        <NavBar />
        <Container style={{ marginTop: 40 }} maxWidth="lg">
          <ComponentWithAccount {...pageProps} />
        </Container>
      </ClientProvider>
    </SnackbarProvider>
  );
}
