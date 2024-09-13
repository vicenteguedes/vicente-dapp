import { Block } from "@repo/database";
import { viemClient } from "./viem";
import { logger } from "@repo/logger";

export const synchronizeBlocks = async () => {
  // select all blocks without timestamp
  const blocks = await Block.createQueryBuilder().select().where("timestamp IS NULL").getMany();

  if (!blocks.length) {
    logger.info("No blocks to synchronize");
    return;
  }

  logger.info({ count: blocks.length }, "Synchronizing blocks");

  // process sequentially to avoid rate limiting
  for (const block of blocks) {
    try {
      logger.info({ blockNumber: block.number }, "Fetching block");
      const blockData = await viemClient.getBlock({ blockNumber: BigInt(block.number) });

      block.timestamp = new Date(Number(blockData.timestamp) * 1000);
      await block.save();

      // sleep for 100 ms to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      logger.error({ error, blockNumber: block.number }, "Error updating block");
    }
  }

  logger.info("Synchronized blocks");
};
