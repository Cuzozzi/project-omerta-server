import ServerStart from "./intialization";

const pgtools = require("pgtools");
const { Client } = require("pg");

const config = {
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
};

// TODO: await this next line so we dont have a race condition

async function createDB() {
  await pgtools.createdb(config, "omerta_db", function (err: any, res: any) {
    if (err) {
      console.log("Database already exists!");
      ServerStart();
    } else if (res) {
      console.log("Database created!");

      const client = new Client({
        user: process.env.DB_USERNAME,
        host: process.env.DB_HOST,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        database: "omerta_db",
      });

      client.connect((err) => {
        if (err) {
          console.error("connection error", err.stack);
        } else {
          console.log("connected");
        }
      });

      client.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;", (err, res) => {
        if (err) throw err;
        console.log(res);
        client.end();
      });
      ServerStart();
    }
  });
}

export default createDB;
