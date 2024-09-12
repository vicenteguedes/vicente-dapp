import convict from "convict";

export const config = convict({
  api: {
    port: {
      env: "PORT",
      default: 8000,
    },
  },
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
});
