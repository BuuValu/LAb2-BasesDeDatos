// verify.js — evidencia de que la carga fue exitosa (conteos por tabla + integridad)
// Uso: node verify.js
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('./env/mysqlConfig');

(async () => {
  const conn = await mysql.createConnection(config);
  const count = async (sql) => (await conn.query(sql))[0][0].n;

  const actual = {
    streamers: await count('SELECT COUNT(*) n FROM STREAMER'),
    languages: await count('SELECT COUNT(*) n FROM LANGUAGUE'),
    games: await count('SELECT COUNT(*) n FROM GAME'),
    streamer_game_rows: await count('SELECT COUNT(*) n FROM STREAMER_GAME'),
    primary_rows: await count("SELECT COUNT(*) n FROM STREAMER_GAME WHERE game_role='primary'"),
    secondary_rows: await count("SELECT COUNT(*) n FROM STREAMER_GAME WHERE game_role='secondary'"),
  };
  console.log('=== ROW COUNT PER TABLE ===');
  console.table(actual);

  const integrity = {
    streamers_without_language: await count('SELECT COUNT(*) n FROM STREAMER s LEFT JOIN LANGUAGUE l ON l.languague_id = s.language_id WHERE l.languague_id IS NULL'),
    streamers_without_primary_game: await count("SELECT COUNT(*) n FROM STREAMER s WHERE NOT EXISTS (SELECT 1 FROM STREAMER_GAME sg WHERE sg.streamer_id = s.streamer_id AND sg.game_role = 'primary')"),
    games_never_used: await count('SELECT COUNT(*) n FROM GAME g WHERE NOT EXISTS (SELECT 1 FROM STREAMER_GAME sg WHERE sg.game_id = g.game_id)'),
    active_days_out_of_range: await count('SELECT COUNT(*) n FROM STREAMER WHERE active_days_per_week < 0 OR active_days_per_week > 7'),
  };
  console.log('=== INTEGRITY CHECKS (all must be 0) ===');
  console.table(integrity);

  let ok = Object.values(integrity).every((v) => v === 0);
  const summaryPath = path.join(__dirname, 'load_summary_Streamers.json');
  if (fs.existsSync(summaryPath)) {
    const s = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    console.log('=== DATABASE vs. LOAD PROGRAM SUMMARY ===');
    for (const [label, actualValue, expected] of [
      ['streamers', actual.streamers, s.streamers],
      ['languages', actual.languages, s.languages],
      ['games', actual.games, s.games],
      ['streamer_game rows', actual.streamer_game_rows, s.relations],
    ]) {
      const match = actualValue === expected;
      ok = ok && match;
      console.log(`${match ? 'OK   ' : 'FAIL '} ${label}: database=${actualValue} loader=${expected}`);
    }
    console.log(`Rows rejected during load: ${s.errors}`);
  } else {
    console.warn('load_summary_Streamers.json not found: run "node load.js" first');
    ok = false;
  }
  console.log(ok ? '\nVERIFICATION SUCCESSFUL' : '\nVERIFICATION FAILED');
  await conn.end();
  process.exit(ok ? 0 : 1);
})().catch((err) => { console.error('VERIFICATION ERROR:', err.message); process.exit(1); });
