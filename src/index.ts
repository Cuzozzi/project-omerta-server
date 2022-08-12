import * as dotenv from "dotenv";
dotenv.config();
import { AppDataSource } from "./data-source";
import express from "express";
import cors from "cors";
import devEnvIntialization from "./helpers/devenv_initialization";
import createDB from "./helpers/createdb";
import authentication from "./routes/authentication";
import admin from "./routes/admin";
import map from "./routes/map";

const app = express();
const port = process.env.SERVER_PORT;
app.use(express.json());
createDB();

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
  .catch((error: any) => console.log(error));
