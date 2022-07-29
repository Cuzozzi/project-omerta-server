import "reflect-metadata";
import { DataSource } from "typeorm";
import { login_credentials } from "./entity/login-credentials";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "",
  database: "project-omerta-databse",
  synchronize: true,
  logging: false,
  entities: [login_credentials],
  migrations: [],
  subscribers: [],
});
