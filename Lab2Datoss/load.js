// load.js — script independiente: Streamers.csv -> MySQL (esquema `strem`)
// Uso: node load.js [ruta_del_csv]   (por defecto ./Streamers.csv)
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');
const config = require('./env/mysqlConfig');
const { readCsv } = require('./csv_reader');
const { transformRow } = require('./transform');

const REQUIRED_COLUMNS = ['NAME', 'LANGUAGE', 'MOST_STREAMED_GAME', '2ND_MOST_STREAMED_GAME',
  'AVG_VIEWERS_PER_STREAM', 'TOTAL_FOLLOWERS', 'TOTAL_VIEWS', 'TOTAL_GAMES_STREAMED', 'ACTIVE_DAYS_PER_WEEK'];

// Inserta y devuelve el id; si ya existe (UNIQUE, p. ej. por la collation) lo busca y deja un aviso
async function getOrCreateId(conn, table, idColumn, nameColumn, name, cache, createdKeys, warnings) {
  if (cache.has(name)) return cache.get(name);
  let id;
  try {
    const [result] = await conn.execute(`INSERT INTO \`${table}\` (\`${nameColumn}\`) VALUES (?)`, [name]);
    id = result.insertId;
  } catch (err) {
    if (err.code !== 'ER_DUP_ENTRY') throw err;
    const [found] = await conn.execute(
      `SELECT \`${idColumn}\` AS id, \`${nameColumn}\` AS name FROM \`${table}\` WHERE \`${nameColumn}\` = ?`, [name]);
    id = found[0].id;
    warnings.push(`${table}: "${name}" matches existing "${found[0].name}" under the collation; reusing id ${id}`);
  }
  cache.set(name, id);
  createdKeys.push([cache, name]);
  return id;
}

async function loadStreamers(filePath, { log = console.log } = {}) {
  const errors = []; // { line, name, type, detail }
  const warnings = [];
  const counters = { streamers: 0, relations: 0, withoutSecondaryGame: 0 };
  const languages = new Map();
  const games = new Map();
  const addError = (line, name, type, detail) => errors.push({ line, name, type, detail });

  const { headers, rows } = readCsv(filePath);
  const missing = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));
  if (missing.length) throw new Error(`Missing columns in the file: ${missing.join(', ')}`);
  log(`Rows read from file: ${rows.length}`);

  const conn = await mysql.createConnection(config);
  let aborted = false;
  try {
    await conn.beginTransaction();
    for (const { lineNumber, data, error } of rows) {
      if (error) { addError(lineNumber, null, 'INVALID_DATA', error); continue; }
      let row;
      try { row = transformRow(data); }
      catch (err) { addError(lineNumber, data.NAME, 'INVALID_DATA', err.message); continue; }

      const createdKeys = [];
      await conn.query('SAVEPOINT row_sp');
      try {
        const languageId = await getOrCreateId(conn, 'LANGUAGUE', 'languague_id', 'languague_name',
          row.language, languages, createdKeys, warnings);
        const [res] = await conn.execute(
          `INSERT INTO STREAMER (name, avg_viewers_per_stream, total_followers, total_views,
             total_games_streamed, active_days_per_week, language_id) VALUES (?,?,?,?,?,?,?)`,
          [row.name, row.avgViewers, row.totalFollowers, row.totalViews, row.totalGames, row.activeDays, languageId]);
        const streamerId = res.insertId;

        const primaryId = await getOrCreateId(conn, 'GAME', 'game_id', 'game_name',
          row.primaryGame, games, createdKeys, warnings);
        await conn.execute('INSERT INTO STREAMER_GAME (streamer_id, game_id, game_role) VALUES (?,?,?)',
          [streamerId, primaryId, 'primary']);
        let inserted = 1;
        if (row.secondaryGame) {
          const secondaryId = await getOrCreateId(conn, 'GAME', 'game_id', 'game_name',
            row.secondaryGame, games, createdKeys, warnings);
          await conn.execute('INSERT INTO STREAMER_GAME (streamer_id, game_id, game_role) VALUES (?,?,?)',
            [streamerId, secondaryId, 'secondary']);
          inserted = 2;
        } else counters.withoutSecondaryGame++;
        counters.relations += inserted;
        counters.streamers++;
      } catch (err) {
        // Error de BD (UNIQUE, FK, tipo...): se deshace solo esta fila, se registra y se continúa
        await conn.query('ROLLBACK TO SAVEPOINT row_sp');
        createdKeys.forEach(([cache, key]) => cache.delete(key)); // ids de la fila revertida ya no valen
        addError(lineNumber, row.name, err.code || 'DB_ERROR', err.message);
      }
    }
    await conn.commit();
  } catch (err) {
    aborted = true;
    await conn.rollback();
    log(`LOAD ABORTED and rolled back: ${err.code || ''} ${err.message}`);
  } finally {
    await conn.end();
  }

  const base = path.basename(filePath, path.extname(filePath));
  const summary = { file: path.basename(filePath), rowsRead: rows.length, ...counters,
    languages: new Set(languages.values()).size, games: new Set(games.values()).size, errors: errors.length, aborted, warnings };
  fs.writeFileSync(path.join(__dirname, `load_summary_${base}.json`), JSON.stringify(summary, null, 2));
  if (errors.length) fs.writeFileSync(path.join(__dirname, `load_errors_${base}.json`), JSON.stringify(errors, null, 2));
  return { summary, errors };
}

module.exports = { loadStreamers };

// Ejecución desde la terminal
if (require.main === module) {
  const file = process.argv[2] || path.join(__dirname, 'Streamers.csv');
  loadStreamers(file)
    .then(({ summary, errors }) => {
      console.log('\n=== LOAD SUMMARY ===');
      console.log(summary);
      if (errors.length) {
        console.error(`\n${errors.length} row(s) rejected. See load_errors_${path.basename(file, path.extname(file))}.json`);
        console.table(errors.slice(0, 10));
      }
      if (errors.length || summary.aborted) process.exitCode = 1;
    })
    .catch((err) => { console.error('FATAL ERROR:', err.message); process.exit(1); });
}
