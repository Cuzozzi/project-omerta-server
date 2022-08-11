import express from "express";
import { AppDataSource } from "../data-source";
let router = express.Router();

router.use((req, res, next) => {
  console.log(req.url, "@", Date.now());
  next();
});

//count all tiles
router.get("/count-tiles", (req, res) => {
  AppDataSource.manager
    .query(`SELECT count(*) FROM tile_positions`)
    .then(async (response) => {
      if (response) {
        res.status(200).send(response);
        //console.log(response);
      } else {
        res.sendStatus(404);
      }
    });
});

//returns total tilepower among users
router.get("/tile-power", (req, res) => {
  AppDataSource.manager
    .query(`SELECT SUM (tilepower) AS tilepower FROM login_credentials`)
    .then(async (response) => {
      if (response) {
        res.status(200).send(response);
        //console.log(response);
      } else {
        res.sendStatus(404);
      }
    });
});

//returns all tile rows in table
router.get("/all-tiles", (req, res) => {
  AppDataSource.manager
    .query(`SELECT * FROM tile_positions`)
    .then(async (response) => {
      if (response) {
        res.status(200).send(response);
        //console.log(response);
      } else {
        res.sendStatus(401);
      }
    });
});

//generates tiles
router.get("/tile-generation", async (req, res) => {
  const allTiles = await AppDataSource.manager.query(
    `SELECT * FROM tile_positions ORDER BY "ID" ASC`
  );
  const lastTile = allTiles[allTiles.length - 1];
  console.log(allTiles);
  console.log(lastTile);
  console.log(lastTile.x, lastTile.z);
  const x = Number(lastTile.x);
  const z = Number(lastTile.z);

  AppDataSource.manager
    .query(`SELECT * FROM tile_positions WHERE x = ${x - 32} AND z = ${z}`)
    .then(async (response) => {
      if (response.length > 0) {
        console.log("Return One");
        res.status(200).json({ response: response, x: x, z: z + 32 });
        AppDataSource.manager.query(
          `LOCK TABLE tile_positions; INSERT INTO tile_positions (x, y, z) SELECT ${x}, 0, ${
            z + 32
          } WHERE NOT EXISTS (SELECT 1 FROM tile_positions WHERE z = ${
            z + 32
          } AND x = ${x} AND y = 0)`
        );
        return;
      }
      AppDataSource.manager
        .query(`SELECT * FROM tile_positions WHERE x = ${x} AND z = ${z - 32}`)
        .then(async (response) => {
          if (response.length > 0) {
            res.status(200).json({ response: response, x: x - 32, z: z });
            console.log("Return Two");
            AppDataSource.manager.query(
              `LOCK TABLE tile_positions; INSERT INTO tile_positions (x, y, z) SELECT ${
                x - 32
              }, 0, ${z} WHERE NOT EXISTS (SELECT 1 FROM tile_positions WHERE z = ${z} AND x = ${
                x - 32
              } AND y = 0)`
            );
            return;
          }
          AppDataSource.manager
            .query(
              `SELECT * FROM tile_positions WHERE x = ${x + 32} and z = ${z}`
            )
            .then(async (response) => {
              if (response.length > 0) {
                res.status(200).json({ resppnse: response, x: x, z: z - 32 });
                console.log("Return Three");
                AppDataSource.manager.query(
                  `LOCK TABLE tile_positions; INSERT INTO tile_positions (x, y, z) SELECT ${x}, 0, ${
                    z - 32
                  } WHERE NOT EXISTS (SELECT 1 FROM tile_positions WHERE z = ${
                    z - 32
                  } AND x = ${x} AND y = 0)`
                );
                return;
              }
              AppDataSource.manager
                .query(
                  `SELECT * FROM tile_positions WHERE x = ${x} and z = ${
                    z + 32
                  }`
                )
                .then(async (response) => {
                  if (response.length > 0) {
                    res
                      .status(200)
                      .json({ response: response, x: x + 32, z: z });
                    console.log("Return Four");
                    AppDataSource.manager.query(
                      `LOCK TABLE tile_positions; INSERT INTO tile_positions (x, y, z) SELECT ${
                        x + 32
                      }, 0, ${z} WHERE NOT EXISTS (SELECT 1 FROM tile_positions WHERE z = ${z} AND x = ${
                        x + 32
                      } AND y = 0)`
                    );
                    return;
                  }
                  res.sendStatus(401);
                });
            });
        });
    });
});

export default router;
