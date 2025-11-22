const pool = require('../lib/db.cjs');
const fs = require('fs');
const path = require('path');

(async function () {
  try {
    const filePath = path.join(__dirname, '..', 'migrations', 'create_links.sql');
    const sql = fs.readFileSync(filePath, 'utf8');

    await pool.query(sql);

    console.log('Migration applied');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
