import "reflect-metadata";
import { DataSource } from "typeorm";
import { login_credentials } from "./entity/login-credentials";
import { session_tokens } from "./entity/session_tokens";
import { tile_positions } from "./entity/tile_positions";

export const AppDataSource = new DataSource({
  type: process.env.DB_TYPE as "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [login_credentials, session_tokens, tile_positions],
  migrations: [],
  subscribers: [],
});
