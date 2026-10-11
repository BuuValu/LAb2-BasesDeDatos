// transform.js — funciones puras de limpieza y validación (sin acceso a BD ni a archivos)

class RowError extends Error {}

const toNumber = (value, field, { integer = false, min = 0, max = Infinity } = {}) => {
  const raw = value === null || value === undefined ? '' : String(value).trim();
  if (raw === '') throw new RowError(`${field} is empty`);
  const n = Number(raw);
  if (!Number.isFinite(n)) throw new RowError(`${field} is not numeric: "${raw}"`);
  if (integer && !Number.isInteger(n)) throw new RowError(`${field} must be an integer: ${n}`);
  if (n < min || n > max) throw new RowError(`${field} out of range [${min}, ${max}]: ${n}`);
  return n;
};

const toText = (value, field, maxLength, { required = true } = {}) => {
  const s = value === null || value === undefined ? '' : String(value).trim();
  if (!s) {
    if (required) throw new RowError(`${field} is empty`);
    return null;
  }
  if (s.length > maxLength) throw new RowError(`${field} exceeds ${maxLength} characters (${s.length})`);
  return s;
};

// Fila cruda del CSV -> objeto listo para insertar (solo las columnas que el modelo necesita)
const transformRow = (raw) => ({
  name: toText(raw.NAME, 'NAME', 100),
  language: toText(raw.LANGUAGE, 'LANGUAGE', 50),
  primaryGame: toText(raw.MOST_STREAMED_GAME, 'MOST_STREAMED_GAME', 150),
  secondaryGame: toText(raw['2ND_MOST_STREAMED_GAME'], '2ND_MOST_STREAMED_GAME', 150, { required: false }),
  avgViewers: toNumber(raw.AVG_VIEWERS_PER_STREAM, 'AVG_VIEWERS_PER_STREAM', { integer: true }),
  totalFollowers: toNumber(raw.TOTAL_FOLLOWERS, 'TOTAL_FOLLOWERS', { integer: true }),
  totalViews: toNumber(raw.TOTAL_VIEWS, 'TOTAL_VIEWS', { integer: true }),
  totalGames: toNumber(raw.TOTAL_GAMES_STREAMED, 'TOTAL_GAMES_STREAMED', { integer: true }),
  activeDays: toNumber(raw.ACTIVE_DAYS_PER_WEEK, 'ACTIVE_DAYS_PER_WEEK', { min: 0, max: 7 }),
});

module.exports = { transformRow, RowError };
