"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { useSyncProviders } from "@/hooks/useSyncProviders";
import {
  Address,
  createWalletClient,
  custom,
  formatEther,
  publicActions,
  PublicActions,
  WalletActions,
} from "viem";
import { ChainData, SEPOLIA_DATA, ERC20_ABI } from "@/utils/constants";

interface ConnectClientContextProps {
  connect: () => Promise<void>;
  client: (PublicActions & WalletActions) | null;
  account: Address | null;
  providerInfo: EIP6963ProviderInfo;
  getClient: () => PublicActions & WalletActions;
  isOwner: boolean;
  balances: { eth: string; busd: string };
  refreshBalances: () => Promise<void>;
  busdTotalSupply: string;
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
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [balances, setBalances] = useState({ eth: "0", busd: "0" });
  const [busdTotalSupply, setBusdTotalSupply] = useState("0");

  const formatCurrency = (value: unknown) => {
    return Number(formatEther(value as bigint)).toFixed(6);
  };

  const getBUSDBalance = async (client: PublicActions) => {
    const busdBalance = await client.readContract({
      address: SEPOLIA_DATA.tokens[0].address,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [account],
    });

    return formatCurrency(busdBalance);
  };

  const refreshBalances = async () => {
    try {
      if (!account) {
        return;
      }
      const client = getClient();

      const ethBalance = await client.getBalance({
        address: account,
      });

      const busdBalance = await getBUSDBalance(client);

      setBalances({
        eth: formatCurrency(ethBalance).toString(),
        busd: busdBalance.toString(),
      });
    } catch (error) {
      console.error("Failed to get balances:", error);
    }
  };

  const getTotalSupply = async () => {
    try {
      if (!account) {
        return;
      }
      const client = getClient();

      const busdSupply = await client.readContract({
        address: SEPOLIA_DATA.tokens[0].address,
        abi: ERC20_ABI,
        functionName: "totalSupply",
      });

      setBusdTotalSupply(formatCurrency(busdSupply));
    } catch (error) {
      console.error("Failed to get supply:", error);
    }
  };

  useEffect(() => {
    if (account) {
      refreshBalances();
      getTotalSupply();
    }
  }, [account]);

  useEffect(() => {
    const interval = setInterval(async () => {
      await refreshBalances();
    }, 60000); // 60 seconds interval

    return () => clearInterval(interval);
  }, [refreshBalances]);

  const [providerWithDetail] = useSyncProviders();

  const getClient = (forceRefresh?: boolean) => {
    if (client && !forceRefresh) {
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
        "Neither MetaMask nor any other web3 wallet is installed. Please install one to proceed.";
      throw new Error(errorMessage);
    }

    const newClient = createWalletClient({
      transport,
    }).extend(publicActions);

    setClient(newClient);

    return newClient;
  };

  const connect = async (forceRefresh?: boolean) => {
    const client = getClient(forceRefresh);
    const chainId = await client.getChainId();

    if (chainId !== SEPOLIA_DATA.chainId) {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [
          {
            chainId: SEPOLIA_DATA.hexChainId,
          },
        ],
      });
    }

    const [address] = await client.requestAddresses();
    setAccount(address);

    const owner = await client
      .readContract({
        address: SEPOLIA_DATA.tokens[0].address,
        abi: ERC20_ABI,
        functionName: "getOwner",
      })
      .catch((error) => {
        console.error("Failed to get owner:", error);
        return undefined;
      });

    setIsOwner(owner === address);
  };

  useEffect(() => {
    if (client && providerWithDetail) {
      providerWithDetail.provider.on("chainChanged", async () => {
        const chainId = await client.getChainId();

        if (chainId === SEPOLIA_DATA.chainId) {
          return;
        }

        setClient(null);
        setAccount(null);

        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [
            {
              chainId: SEPOLIA_DATA.hexChainId,
            },
          ],
        });

        await connect(true);
      });
      providerWithDetail.provider.on("accountsChanged", async () => {
        await connect(true);
      });
    }
  }, [client, providerWithDetail]);

  return (
    <ClientContext.Provider
      value={{
        account,
        connect,
        client,
        providerInfo: providerWithDetail?.info,
        getClient,
        isOwner,
        balances,
        refreshBalances,
        busdTotalSupply,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
};

export const useClient: () => ConnectClientContextProps = () => {
  const context = useContext(ClientContext);

  if (context === undefined) {
    throw new Error("useClient must be used within a ClientProvider");
  }
  return context;
};
