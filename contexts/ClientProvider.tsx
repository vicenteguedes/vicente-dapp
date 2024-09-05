"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { useSyncProviders } from "@/hooks/useSyncProviders";
import {
  Address,
  createWalletClient,
  custom,
  publicActions,
  PublicActions,
  WalletActions,
} from "viem";
import * as chains from "viem/chains";
import { BUSD_ADDRESS, BUSD_TOKEN_ABI } from "@/utils/constants";

interface ConnectClientContextProps {
  connect: () => Promise<void>;
  client: (PublicActions & WalletActions) | null;
  account: Address | null;
  providers: EIP6963ProviderDetail[];
  getClient: () => PublicActions & WalletActions;
  chain: chains.Chain | null;
  isOwner: boolean;
}

const ClientContext = createContext<ConnectClientContextProps | undefined>(
  undefined
);

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [account, setAccount] = useState<Address | null>(null);
  const [client, setClient] = useState<(PublicActions & WalletActions) | null>(
    null
  );
  const [chain, setChain] = useState<chains.Chain | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);

  const providers = useSyncProviders();

  const getClient = () => {
    if (client) {
      return client;
    }

    let transport;

    if (typeof window === "undefined") {
      throw new Error("This function must be called in the browser.");
    }

    if (window.ethereum) {
      transport = custom(window.ethereum);
    } else {
      const errorMessage =
        "MetaMask or another web3 wallet is not installed. Please install one to proceed.";
      throw new Error(errorMessage);
    }

    const newClient = createWalletClient({
      transport,
    }).extend(publicActions);

    setClient(newClient);
    return newClient;
  };

  const connect = async () => {
    const client = getClient();
    const [address] = await client.requestAddresses();
    setAccount(address);

    const chainId = await client.getChainId();

    const chain = Object.values(chains).find((x) => x.id === chainId);

    if (chain) {
      await client.switchChain({ id: chainId });
      setChain(chain);
    }

    const owner = await client
      .readContract({
        address: BUSD_ADDRESS,
        abi: BUSD_TOKEN_ABI,
        functionName: "getOwner",
      })
      .catch(() => {
        return undefined;
      });

    setIsOwner(owner === address);
  };

  useEffect(() => {
    if (client && providers.length) {
      providers[0].provider.on("chainChanged", async () => {
        window.location.reload();
      });
    }
  }, [client, providers]);

  return (
    <ClientContext.Provider
      value={{
        account,
        connect,
        client,
        providers,
        getClient,
        chain,
        isOwner,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
};

export const useClient = () => {
  const context = useContext(ClientContext);

  if (context === undefined) {
    throw new Error("useClient must be used within a ClientProvider");
  }
  return context;
};
