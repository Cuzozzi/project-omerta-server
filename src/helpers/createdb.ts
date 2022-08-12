const pgtools = require("pgtools");

const config = {
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
};

// TODO: await this next line so we dont have a race condition

async function createDB() {
  await pgtools.createdb(config, "omerta_db", function (err: any, res: any) {
    if (err) {
      console.log("Database already exists!");
    } else if (res) {
      console.log("Database created!");
    }
  });
}

export default createDB;
