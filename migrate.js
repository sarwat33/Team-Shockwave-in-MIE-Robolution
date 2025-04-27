const fs = require("fs");
const pool = require("./db");

const runMigration = async () => {
  const sql = fs.readFileSync("./sql/schema.sql").toString();
  try {
    await pool.query(sql);
    console.log("✅ Migration completed!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
};

runMigration();
