import { DataSource, DataSourceOptions } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { config } from "./config";

const entitiesPath =
  process.env.NODE_ENV == "production" ? "dist/database/entities/**/*.js" : "packages/database/entities/**/*.ts";
const migrationsPath =
  process.env.NODE_ENV == "production" ? "dist/database/migrations/**/*.js" : "packages/database/migrations/**/*.ts";

export const dataSourceOptions = {
  type: "postgres",
  host: config.get("database").host,
  port: config.get("database").port,
  username: config.get("database").username,
  password: config.get("database").password,
  database: config.get("database").name,
  entities: [entitiesPath],
  migrations: [migrationsPath],
  namingStrategy: new SnakeNamingStrategy(),
};

const db = new DataSource(dataSourceOptions as DataSourceOptions);

export default db;
