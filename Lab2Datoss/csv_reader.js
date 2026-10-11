// csv_reader.js — lector de CSV sin dependencias externas (soporta comillas, comas internas y \r\n)
const fs = require('fs');

function parseCsv(text) {
  const records = [];
  let field = '';
  let record = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') { record.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      record.push(field); field = '';
      records.push(record); record = [];
    } else field += ch;
  }
  if (field !== '' || record.length) { record.push(field); records.push(record); }
  if (inQuotes) throw new Error('Malformed CSV: unclosed quote at end of file');
  return records.filter((r) => !(r.length === 1 && r[0].trim() === ''));
}

// Devuelve { headers, rows: [{ lineNumber, data, error }] }
function readCsv(filePath) {
  const text = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  const records = parseCsv(text);
  if (records.length === 0) throw new Error('The CSV file is empty');
  const headers = records[0].map((h) => h.trim());
  const rows = records.slice(1).map((rec, idx) => {
    const lineNumber = idx + 2; // fila 1 = encabezado
    if (rec.length !== headers.length) {
      return { lineNumber, data: null, error: `Expected ${headers.length} columns but found ${rec.length}` };
    }
    const data = {};
    headers.forEach((h, i) => { data[h] = rec[i]; });
    return { lineNumber, data, error: null };
  });
  return { headers, rows };
}

module.exports = { readCsv, parseCsv };
