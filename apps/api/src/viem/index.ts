import { SEPOLIA_DATA } from "@repo/common";
import { createPublicClient, parseAbi, PublicClient, webSocket } from "viem";

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
    onLogs: (logs) => console.log(logs),
  });
};
