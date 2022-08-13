import { AppDataSource } from "../data-source";

export function ReturnOne(x, z, res) {
  AppDataSource.manager
    .query(`SELECT * FROM tile_positions WHERE x = ${x - 32} AND z = ${z}`)
    .then(async (response) => {
      console.log(response);
      if (response.length > 0) {
        AppDataSource.manager
          .query(
            `SELECT * FROM tile_positions WHERE x = ${x} AND z = ${z + 32}`
          )
          .then(async (response) => {
            console.log(response);
            if (response.length > 0) {
              console.log("Return One");
              res.status(200).json({ response: response, x: x, z: z + 32 });
              AppDataSource.manager.query(
                `LOCK TABLE tile_positions; INSERT INTO tile_positions (x, y, z) SELECT ${
                  x + 32
                }, 0, ${z} WHERE NOT EXISTS (SELECT 1 FROM tile_positions WHERE z = ${z} AND x = ${
                  x + 32
                } AND y = 0)`
              );
              return;
            }
          });
      }
      ReturnTwo(x, z, res);
    });
}

export function ReturnTwo(x, z, res) {
  AppDataSource.manager
    .query(`SELECT * FROM tile_positions WHERE x = ${x - 32} AND z = ${z}`)
    .then(async (response) => {
      console.log(response);
      if (response.length > 0) {
        console.log("Return Two");
        res.status(200).json({ response: response, x: x, z: z + 32 });
        AppDataSource.manager.query(
          `LOCK TABLE tile_positions; INSERT INTO tile_positions (x, y, z) SELECT ${x}, 0, ${
            z + 32
          } WHERE NOT EXISTS (SELECT 1 FROM tile_positions WHERE z = ${
            z + 32
          } AND x = ${x} AND y = 0)`
        );
        return;
      } else {
        ReturnThree(x, z, res);
      }
    });
}

export function ReturnThree(x, z, res) {
  AppDataSource.manager
    .query(`SELECT * FROM tile_positions WHERE x = ${x} AND z = ${z - 32}`)
    .then(async (response) => {
      console.log(response);
      if (response.length > 0) {
        res.status(200).json({ response: response, x: x - 32, z: z });
        console.log("Return Three");
        AppDataSource.manager.query(
          `LOCK TABLE tile_positions; INSERT INTO tile_positions (x, y, z) SELECT ${
            x - 32
          }, 0, ${z} WHERE NOT EXISTS (SELECT 1 FROM tile_positions WHERE z = ${z} AND x = ${
            x - 32
          } AND y = 0)`
        );
        return;
      } else {
        ReturnFour(x, z, res);
      }
    });
}

export function ReturnFour(x, z, res) {
  AppDataSource.manager
    .query(`SELECT * FROM tile_positions WHERE x = ${x + 32} and z = ${z}`)
    .then(async (response) => {
      if (response.length > 0) {
        res.status(200).json({ resppnse: response, x: x, z: z - 32 });
        console.log("Return Four");
        AppDataSource.manager.query(
          `LOCK TABLE tile_positions; INSERT INTO tile_positions (x, y, z) SELECT ${x}, 0, ${
            z - 32
          } WHERE NOT EXISTS (SELECT 1 FROM tile_positions WHERE z = ${
            z - 32
          } AND x = ${x} AND y = 0)`
        );
        return;
      } else {
        ReturnFive(x, z, res);
      }
    });
}

export function ReturnFive(x, z, res) {
  AppDataSource.manager
    .query(`SELECT * FROM tile_positions WHERE x = ${x} and z = ${z + 32}`)
    .then(async (response) => {
      if (response.length > 0) {
        res.status(200).json({ response: response, x: x + 32, z: z });
        console.log("Return Five");
        AppDataSource.manager.query(
          `LOCK TABLE tile_positions; INSERT INTO tile_positions (x, y, z) SELECT ${
            x + 32
          }, 0, ${z} WHERE NOT EXISTS (SELECT 1 FROM tile_positions WHERE z = ${z} AND x = ${
            x + 32
          } AND y = 0)`
        );
        return true;
      }
    });
}
