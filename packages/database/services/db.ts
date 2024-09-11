import { DataSource } from "typeorm";
import db from "../config";

let dbInstance: DataSource;

export const start = async () => {
  if (dbInstance?.isInitialized) {
    return dbInstance;
  }

  dbInstance = await db.initialize();

  console.log("Database connection established");
};

export const stop = async () => {
  await dbInstance?.close();
};

export { dbInstance as db };
