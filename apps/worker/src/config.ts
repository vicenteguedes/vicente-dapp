import convict from "convict";

export const config = convict({
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
      env: "SCHEDULE_SYNCHRONIZE_TRANSACTIONS",
      default: "0 * * * *",
      doc: "Cron format - every hour",
    },
    synchronizeBlocks: {
      env: "SCHEDULE_SYNCHRONIZE_BLOCKS",
      default: "*/5 * * * *",
      doc: "Cron format - every 5 minutes by default",
    },
  },
});
