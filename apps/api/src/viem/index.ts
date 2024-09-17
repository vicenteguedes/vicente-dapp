import { SEPOLIA_DATA } from "@repo/common";
import { createPublicClient, parseAbi, PublicClient, webSocket } from "viem";
import { handleNewLogs } from "../resources/logs/utils";
import { logger } from "@repo/logger";

export let viemClient: PublicClient;

export const initViemClient = () => {
  if (viemClient) {
    return viemClient;
  }

  let unwatchFunction: () => void;

  const initClient = () => {
    viemClient = createPublicClient({
      transport: webSocket("wss://sepolia.drpc.org"),
    });

    unwatchFunction = viemClient.watchEvent({
      address: SEPOLIA_DATA.tokens[0].address,
      events: parseAbi([
        "event Approval(address indexed owner, address indexed spender, uint256 value)",
        "event Transfer(address indexed from, address indexed to, uint256 value)",
      ]),
      onLogs: handleNewLogs,
      onError: (error) => {
        logger.error({ error }, "Websocket error");

        unwatchFunction();

        // delay slightly before restarting to avoid immediate reconnection loops
        setTimeout(() => initClient(), 1000);
      },
    });
  };

  initClient();
};
