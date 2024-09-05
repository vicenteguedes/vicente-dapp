import "../styles/global.css";
import { AppProps } from "next/app";
import { ClientProvider } from "@/contexts/ClientProvider";
import Head from "next/head";
import withAccount from "@/HOC/withAccount";
import { SnackbarProvider } from "notistack";

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
        </Head>
        <ComponentWithAccount {...pageProps} />
      </ClientProvider>
    </SnackbarProvider>
  );
}
