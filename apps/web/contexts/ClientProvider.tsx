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
import { ERC20_ABI, PAGE_SIZE, SEPOLIA_DATA, UNISWAP_V2_PAIR_ABI, ZERO_ADDRESS } from "@/utils/constants";
import { Transaction } from "@repo/api-types";
import useWebSocket from "react-use-websocket";
import { WS_URL } from "@/api";

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
  refreshData: () => Promise<void>;
  busdTotalSupply: string;
  tokenTransactions: Transaction[];
  setTokenTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  userTransactions: Transaction[];
  setUserTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  reserves: { [key: string]: bigint };
}

const ClientContext = createContext<ConnectClientContextProps | undefined>(undefined);

export const formatCurrency = (value: unknown, locale: string = "en-US") => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  }).format(Number(formatEther(value as bigint)) || 0);
};

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<Address | null>(null);
  const [client, setClient] = useState<(PublicActions & WalletActions) | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [balances, setBalances] = useState<Balances>({ ETH: "0", BUSD: "0", WBTC: "0" });
  const [busdTotalSupply, setBusdTotalSupply] = useState("0");
  const [tokenTransactions, setTokenTransactions] = useState<Transaction[]>([]);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [reserves, setReserves] = useState<{ [key: string]: bigint }>({});

  const mergeTransactions = (newTransactions: Transaction[], previousTransactions: Transaction[]) =>
    [...newTransactions, ...previousTransactions].slice(0, PAGE_SIZE);

  const handleNewTransactions = (transactions: Transaction[]) => {
    const newTransactions = transactions.map((log: Transaction) => ({
      ...log,
      timestamp: new Date().getTime(),
    }));

    const newUserTransactions = newTransactions.filter(
      (transaction: Transaction) =>
        transaction.from === account ||
        (transaction.to === account && transaction.eventName === "Transfer" && transaction.from === ZERO_ADDRESS)
    );

    const hasUserTransactions = newUserTransactions?.length;

    enqueueSnackbar(`${hasUserTransactions ? "New user activity detected!" : "New transaction detected!"} `, {
      variant: hasUserTransactions ? "success" : "info",
      anchorOrigin: {
        vertical: "top",
        horizontal: "right",
      },
    });

    setTokenTransactions((prev) => mergeTransactions(newTransactions, prev));
    setUserTransactions((prev) => mergeTransactions(newUserTransactions, prev));
  };

  useWebSocket(WS_URL, {
    onOpen: () => {
      console.log("WebSocket connection established.");
    },
    share: true,
    filter: () => false,
    retryOnError: true,
    shouldReconnect: () => true,
    onMessage: async (event) => {
      console.log("WebSocket message received:", event.data);

      const eventData = JSON.parse(event.data);

      const transactionLogs = eventData.filter((log: Transaction) => log.eventName === "Transfer");

      if (transactionLogs.length) {
        handleNewTransactions(transactionLogs);
      }

      const reserveLogs = eventData.filter((log: Transaction) => log.eventName === "Sync");

      if (!reserveLogs.length) {
        return;
      }

      const lastReserveLogs = reserveLogs[reserveLogs.length - 1];

      setReserves(() => ({
        BUSD: BigInt(lastReserveLogs.reserve0),
        WBTC: BigInt(lastReserveLogs.reserve1),
      }));
    },
    onClose: () => {
      console.log("WebSocket connection closed.");
    },
  });

  const fetchReserves = async () => {
    if (!client) {
      return;
    }

    try {
      const [token0Reserve, token1Reserve] = (await client.readContract({
        address: SEPOLIA_DATA.contracts["BUSD_WBTC"].address,
        abi: UNISWAP_V2_PAIR_ABI,
        functionName: "getReserves",
      })) as bigint[];

      setReserves({
        BUSD: token0Reserve,
        WBTC: token1Reserve,
      });
    } catch (error) {
      console.error("Error fetching reserves:", error);
    }
  };

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

    fetchReserves();
  };

  useEffect(() => {
    fetchReserves();
  }, [client]);

  const refreshData = async () => {
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
      await refreshData();
    }, 60000); // 60 seconds interval

    return () => clearInterval(interval);
  }, [refreshData]);

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
        refreshData,
        busdTotalSupply,
        tokenTransactions,
        setTokenTransactions,
        userTransactions,
        setUserTransactions,
        reserves,
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
