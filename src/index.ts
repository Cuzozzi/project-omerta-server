import * as dotenv from "dotenv";
dotenv.config();
import createDB from "./helpers/createdb";

process.on("uncaughtException", function (err) {
  console.log(err);
  var stack = err.stack;
  //you can also notify the err/stack to support via email or other APIs
});

createDB();
