import "reflect-metadata";
import { createServer } from "./server";
import * as db from "@repo/database";
import { initViemClient } from "./viem";
import { initWebsocketServer } from "./websocketServer";

const run = async () => {
  const port = process.env.PORT || 3001;

  const server = createServer();

  initViemClient();

  await db.start();

  initWebsocketServer();

  server.listen(port, () => {
    console.log(`api running on ${port}`);
  });
};

run().then(() => {
  console.log("API started");
});
