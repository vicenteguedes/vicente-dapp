import { DataSource, DataSourceOptions } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { config } from "./config";
import * as path from "path";
import { Transaction, Block, Contract } from "./entities";

const migrationsPath =
  process.env.NODE_ENV == "production"
    ? path.join(__dirname, "../**/**.migrations.js")
    : "packages/database/migrations/**/*.ts";

export const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  host: config.get("database").host,
  port: config.get("database").port,
  username: config.get("database").username,
  password: config.get("database").password,
  database: config.get("database").name,
  entities: [Transaction, Block, Contract],
  migrations: [migrationsPath],
  namingStrategy: new SnakeNamingStrategy(),
};

const db = new DataSource(dataSourceOptions as DataSourceOptions);

export default db;
