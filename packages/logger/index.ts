import pino from "pino";

import { Logger } from "pino";

export const logger: Logger = pino({
  level: process.env.PINO_LOG_LEVEL || "info",

  redact: [], // prevent logging of sensitive data
});
