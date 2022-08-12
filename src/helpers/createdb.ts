const pgtools = require("pgtools");
const { Client } = require("pg");

const config = {
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
};

async function createDB() {
  await pgtools
    .createdb(config, "omerta_db")
    .then(() => {
      console.log("Database created!");

      const client = new Client({
        user: process.env.DB_USERNAME,
        host: process.env.DB_HOST,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        database: "omerta_db",
      });

      client.connect((err: any) => {
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
    })
    .catch(() => console.log("Database already exists!"));
}

export default createDB;
