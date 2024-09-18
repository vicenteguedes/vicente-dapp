import { SEPOLIA_DATA } from "@repo/common";
import { logger } from "@repo/logger";
import { createPublicClient, parseAbi, PublicClient, webSocket } from "viem";
import { handleNewLogs } from "../resources/logs/utils";

export let viemClient: PublicClient;

export const initViemClient = () => {
  if (viemClient) {
    return viemClient;
  }

  let unwatchFunction: (() => void) | null = null;

  const initClient = () => {
    viemClient = createPublicClient({
      transport: webSocket("wss://ethereum-sepolia-rpc.publicnode.com"),
    });

    if (unwatchFunction) {
      unwatchFunction();
    }

    unwatchFunction = viemClient.watchEvent({
      address: SEPOLIA_DATA.tokens[0].address,
      events: parseAbi([
        "event Approval(address indexed owner, address indexed spender, uint256 value)",
        "event Transfer(address indexed from, address indexed to, uint256 value)",
      ]),
      onLogs: handleNewLogs,
      onError: (error) => {
        logger.error({ error }, "Websocket error");

        unwatchFunction?.();

        unwatchFunction = null;

        // delay slightly before restarting to avoid immediate reconnection loops
        setTimeout(() => initClient(), 2000);
      },
    });
  };

  initClient();
};
