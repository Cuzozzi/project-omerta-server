import "reflect-metadata";
import { DataSource } from "typeorm";
import { testUser } from "./entity/testUser";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "<3tomas",
  database: "project-omerta-database",
  synchronize: true,
  logging: false,
  entities: [testUser],
  migrations: [],
  subscribers: [],
});
