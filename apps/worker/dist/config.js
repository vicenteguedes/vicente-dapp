"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const convict_1 = __importDefault(require("convict"));
exports.config = (0, convict_1.default)({
    database: {
        port: {
            env: "DB_PORT",
            default: 5432,
        },
        host: {
            env: "DB_HOST",
            default: "localhost",
        },
        username: {
            env: "DB_USERNAME",
            default: "postgres",
        },
        password: {
            env: "DB_PASSWORD",
            default: "postgres",
        },
        name: {
            env: "DB_NAME",
            default: "dapp_db",
        },
    },
    schedule: {
        synchronizeTransactions: {
            env: "SCHEDULE_FETCH_BLOCKCHAIN_DATA",
            default: "*/1 * * * *",
            doc: "Cron format - every 5 minutes by default",
        },
    },
});
