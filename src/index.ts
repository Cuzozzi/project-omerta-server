import * as dotenv from "dotenv";
dotenv.config();
const pgtools = require("pgtools");
import { AppDataSource } from "./data-source";
import express from "express";
import cors from "cors";
import devEnvIntialization from "./helpers/devenv_initialization";
import authentication from "./routes/authentication";
import admin from "./routes/admin";
import map from "./routes/map";

const app = express();
app.use(express.json());
const port = process.env.SERVER_PORT;
const config = {
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
};

pgtools.createdb(config, "omerta_db", function (err, res) {
  if (err) {
    console.log("Database already exists!");
  } else if (res) {
    console.log("Database created!");
  }
});

AppDataSource.initialize()
  .then(async () => {
    app.use(cors());

    app.use(function (req, res, next) {
      res.header("Access-Control-Allow-Origin", "http://localhost:3001");
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
      next();
    });

    devEnvIntialization();

    app.use("/authentication", authentication);
    app.use("/admin", admin);
    app.use("/map", map);

    app.listen(port, () => {
      console.log(`Project-Omerta-Server listening on port ${port}`);
    });
  })
  .catch((error) => console.log(error));
