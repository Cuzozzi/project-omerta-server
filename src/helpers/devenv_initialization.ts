import { AppDataSource } from "../data-source";

function devEnvIntialization() {
  AppDataSource.query(`SELECT * FROM login_credentials`).then((response) => {
    if (response.length > 0) {
      console.log("Login credentials found, skipping seeding");
    } else if (response.length === 0) {
      AppDataSource.query(
        `INSERT INTO login_credentials (username, email, password, admin, super_admin, moderator, tilepower) VALUES 
        ('${process.env.DEFAULT_USERNAME}',
        '${process.env.DEFAULT_EMAIL}',
        crypt('${process.env.DEFAULT_PASSWORD}', gen_salt('bf', 8)),
        true,
        true,
        true,
        9
        )`
      );
      console.log("User seeding complete");
    } else {
      console.log("Tile seeding failed");
    }
  });

  AppDataSource.query(`SELECT * FROM tile_positions`).then((response) => {
    if (response.length > 0) {
      console.log("Tile positions found, skipping seeding");
    } else if (response.length === 0) {
      AppDataSource.query(
        `INSERT INTO tile_positions (x, y , z) VALUES (0, 0, 0)`
      );
      console.log("Tile seeding complete");
    } else {
      console.log("Tile seeding failed");
    }
  });
}

export default devEnvIntialization;
