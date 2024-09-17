import { SEPOLIA_DATA } from "@repo/common";
import { createPublicClient, parseAbi, PublicClient, webSocket } from "viem";
import { handleNewLogs } from "../resources/logs/utils";
import { logger } from "@repo/logger";

export let viemClient: PublicClient;

export const initViemClient = () => {
  if (viemClient) {
    return viemClient;
  }

  viemClient = createPublicClient({
    transport: webSocket("wss://sepolia.drpc.org"),
  });

  viemClient.watchEvent({
    address: SEPOLIA_DATA.tokens[0].address,
    events: parseAbi([
      "event Approval(address indexed owner, address indexed spender, uint256 value)",
      "event Transfer(address indexed from, address indexed to, uint256 value)",
    ]),
    onLogs: handleNewLogs,
    onError: (error) => {
      logger.error({ error }, "Websocket error");
    },
  });
};
