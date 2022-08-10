import "reflect-metadata";
import { DataSource } from "typeorm";
import { login_credentials } from "./entity/login-credentials";
import { session_tokens } from "./entity/session_tokens";
import { tile_positions } from "./entity/tile_positions";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "",
  database: "project-omerta-databse",
  synchronize: true,
  logging: false,
  entities: [login_credentials, session_tokens, tile_positions],
  migrations: [],
  subscribers: [],
});
