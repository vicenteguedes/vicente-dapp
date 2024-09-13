import { createPublicClient, http, PublicClient } from "viem";

export let viemClient: PublicClient;

export const initViemClient = () => {
  if (viemClient) {
    return viemClient;
  }

  viemClient = createPublicClient({
    transport: http("https://sepolia.drpc.org"),
  });
};
