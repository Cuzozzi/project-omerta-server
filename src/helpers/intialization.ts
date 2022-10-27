import { AppDataSource } from "../data-source";
import cors from "cors";
import devEnvIntialization from "../helpers/devenv_initialization";
import api from "../routes/api";
import admin from "../routes/admin";
import map from "../routes/map";
import authentication from "../routes/authentication";
import account from "../routes/account";
import express from "express";
import dangerous from "../routes/dangerous";

const app = express();
app.use(express.json());
const port = process.env.SERVER_PORT;

function serverStart() {
  AppDataSource.initialize()
    .then(async () => {
      app.use(cors());

      app.use(function (req, res, next) {
        const allowedOrigins = [
          "https://omerta.cuzozzi.com",
          "http://localhost:3001",
        ];
        const origin = req.headers.origin;
        if (allowedOrigins.includes(origin)) {
          res.setHeader("Access-Control-Allow-Origin", origin);
        }
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
        next();
      });

      app.get("/", (req, res) => {
        res.send("Hello, I'm working!");
      });

      devEnvIntialization();

      app.use("/api", api);
      app.use("/admin", admin);
      app.use("/map", map);
      app.use("/account", account);
      app.use("/authentication", authentication);
      app.use("/dangerous", dangerous);

      app.listen(port, () => {
        console.log(`Project-Omerta-Server listening on port ${port}`);
      });
    })
    .catch((error: any) => console.log(error));
}

export default serverStart;
