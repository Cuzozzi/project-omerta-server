import * as dotenv from "dotenv";
dotenv.config();
import createDB from "./helpers/createdb";
import serverStart from "./helpers/intialization";

process.on("uncaughtException", function (err) {
  console.error(err);
  // var stack = err.stack;
  // wa can send the stack to support via email or other APIs
});

async function main() {
  await createDB();
  serverStart();
}

main();
