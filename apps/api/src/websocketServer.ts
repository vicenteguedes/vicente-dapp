import { logger } from "@repo/logger";
import * as http from "http";
import { WebSocketServer } from "ws";

export let wsServer: WebSocketServer;

export const initWebsocketServer = () => {
  const server = http.createServer();
  wsServer = new WebSocketServer({ server });

  const port = 8000;

  server.listen(port, () => {
    logger.info(`WebSocket server is running on port ${port}`);
  });

  wsServer.on("connection", function connection(ws) {
    ws.on("error", logger.error);
  });

  wsServer.on("close", function close() {
    logger.info("disconnected");
  });
};
