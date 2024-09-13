"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const viem_1 = require("./viem");
const db = __importStar(require("@repo/database"));
const config_1 = require("./config");
const schedule = __importStar(require("node-schedule"));
const transactions_1 = require("./transactions");
const blocks_1 = require("./blocks");
const logger_1 = require("@repo/logger");
const run = async () => {
    (0, viem_1.initViemClient)();
    await db.start();
    const c = config_1.config.get("schedule");
    schedule.scheduleJob(c.synchronizeTransactions, transactions_1.synchronizeTransactions);
    logger_1.logger.info(`Job synchronizeTransactions scheduled "${c.synchronizeTransactions}"`);
    schedule.scheduleJob(c.synchronizeBlocks, blocks_1.synchronizeBlocks);
    logger_1.logger.info(`Job synchronizeBlocks scheduled "${c.synchronizeBlocks}"`);
};
run().then(() => {
    logger_1.logger.info("Started scheduler");
});
