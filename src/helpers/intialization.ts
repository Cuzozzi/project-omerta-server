import { AppDataSource } from "../data-source";
import cors from "cors";
import devEnvIntialization from "../helpers/devenv_initialization";
import authentication from "../routes/authentication";
import admin from "../routes/admin";
import map from "../routes/map";
import express from "express";

const app = express();
app.use(express.json());
const port = process.env.SERVER_PORT;

function ServerStart() {
  AppDataSource.initialize()
    .then(async () => {
      app.use(cors());

      app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", process.env.CLIENT_URL);
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
}

export default ServerStart;
