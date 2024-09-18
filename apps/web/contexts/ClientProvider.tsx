"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { useSyncProviders } from "@/hooks/useSyncProviders";
import {
  Address,
  createWalletClient,
  custom,
  CustomTransport,
  formatEther,
  publicActions,
  PublicActions,
  WalletActions,
} from "viem";
import { enqueueSnackbar } from "notistack";
import { ERC20_ABI, SEPOLIA_DATA } from "@/utils/constants";

interface Balances {
  ETH: string;
  BUSD: string;
  WBTC: string;
}

interface ConnectClientContextProps {
  connect: () => Promise<void>;
  client: (PublicActions & WalletActions) | null;
  account: Address | null;
  providerInfo: EIP6963ProviderInfo;
  getClient: () => PublicActions & WalletActions;
  isOwner: boolean;
  balances: Balances;
  refreshBalances: () => Promise<void>;
  busdTotalSupply: string;
}

const ClientContext = createContext<ConnectClientContextProps | undefined>(undefined);

export const formatCurrency = (value: unknown, locale: string = "en-US") => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(Number(formatEther(value as bigint)) || 0);
};

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<Address | null>(null);
  const [client, setClient] = useState<(PublicActions & WalletActions) | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [balances, setBalances] = useState<Balances>({ ETH: "0", BUSD: "0", WBTC: "0" });
  const [busdTotalSupply, setBusdTotalSupply] = useState("0");

  const getHomeInfo = async () => {
    if (!client || !account) {
      return;
    }

    const baseContract = {
      address: SEPOLIA_DATA.contracts["BUSD"].address,
      abi: ERC20_ABI,
    };

    const [totalSupply, owner, busdBalance, wbtcBalance] = await client.multicall({
      contracts: [
        {
          ...baseContract,
          functionName: "totalSupply",
        },
        {
          ...baseContract,
          functionName: "owner",
        },
        {
          ...baseContract,
          functionName: "balanceOf",
          args: [account],
        },
        {
          address: SEPOLIA_DATA.contracts["WBTC"].address,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [account],
        },
      ],
      multicallAddress: SEPOLIA_DATA.multicallAddress,
      allowFailure: false,
    });

    setBusdTotalSupply(totalSupply as string);
    setIsOwner(owner === account);

    const ethBalance = await client.getBalance({
      address: account,
    });

    setBalances({
      ETH: formatCurrency(ethBalance.toString()),
      BUSD: busdBalance as string,
      WBTC: wbtcBalance as string,
    });
  };

  const refreshBalances = async () => {
    try {
      if (!account) {
        return;
      }
      await getHomeInfo();
    } catch (error) {
      console.error("Failed to get balances:", error);
    }
  };

  useEffect(() => {
    if (account) {
      getHomeInfo();
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

    let transport: CustomTransport;

    if (typeof window === "undefined") {
      throw new Error("This function must be called in the browser.");
    }

    if (window.ethereum) {
      transport = custom(window.ethereum);
    } else {
      const errorMessage = "Neither MetaMask nor any other web3 wallet is installed. Please install one to proceed.";
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

    if (chainId !== SEPOLIA_DATA.networkId) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [
            {
              chainId: SEPOLIA_DATA.hexChainId,
            },
          ],
        });
      } catch (error) {
        enqueueSnackbar(`You need to connect to Sepolia network to access this app`, {
          variant: "error",
          autoHideDuration: 6000,
        });
        return;
      }
    }

    const [address] = await client.requestAddresses();
    setAccount(address);
  };

  useEffect(() => {
    if (client && providerWithDetail) {
      providerWithDetail.provider.on("chainChanged", async () => {
        const chainId = await client.getChainId();

        if (chainId === SEPOLIA_DATA.networkId) {
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

  if (!context) {
    throw new Error("useClient must be used within a ClientProvider");
  }

  return context;
};
