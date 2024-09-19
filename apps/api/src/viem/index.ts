import { SEPOLIA_DATA } from "@repo/common";
import { logger } from "@repo/logger";
import { createPublicClient, parseAbi, parseAbiItem, PublicClient, webSocket } from "viem";
import { handleNewLogs, handleSync } from "../resources/websockets/utils";

export let viemClient: PublicClient;

export const initViemClient = () => {
  if (viemClient) {
    return viemClient;
  }

  let unwatchTransactionsFunction: (() => void) | null = null;
  let unwatchSyncFunction: (() => void) | null = null;

  const initClient = () => {
    viemClient = createPublicClient({
      transport: webSocket("wss://sepolia.drpc.org"),
    });

    // watch transaction events
    unwatchTransactionsFunction = viemClient.watchEvent({
      address: SEPOLIA_DATA.contracts["BUSD"].address,
      events: parseAbi([
        "event Approval(address indexed owner, address indexed spender, uint256 value)",
        "event Transfer(address indexed from, address indexed to, uint256 value)",
      ]),
      onLogs: handleNewLogs,
      onError: (error) => {
        logger.error({ error }, "Transactions websocket error");

        unwatchTransactionsFunction?.();
        unwatchSyncFunction?.();

        setTimeout(() => {
          initClient();
        }, 3000);
      },
    });

    // watch sync events
    unwatchSyncFunction = viemClient.watchEvent({
      address: SEPOLIA_DATA.contracts["BUSD_WBTC"].address,
      event: parseAbiItem("event Sync(uint112 reserve0, uint112 reserve1)"),
      onLogs: handleSync,
      onError: (error) => {
        logger.error({ error }, "Sync websocket error");
      },
    });
  };

  initClient();
};
