const db = require('../services/mysql.service');

// Consultar todos los streamers
const getAll = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.*, l.languague_name
       FROM STREAMER s
       LEFT JOIN LANGUAGUE l ON s.language_id = l.languague_id`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Consultar un streamer por su ID
const getById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.*, l.languague_name
       FROM STREAMER s
       LEFT JOIN LANGUAGUE l ON s.language_id = l.languague_id
       WHERE s.streamer_id = ?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Streamer no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear un streamer
const create = async (req, res) => {
  try {
    const {
      name, avg_viewers_per_stream, total_followers, total_views,
      total_games_streamed, active_days_per_week, language_id
    } = req.body;

    if (!name || avg_viewers_per_stream === undefined ||
        total_followers === undefined || total_views === undefined ||
        total_games_streamed === undefined || active_days_per_week === undefined ||
        language_id === undefined) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const [result] = await db.query(
      `INSERT INTO STREAMER
       (name, avg_viewers_per_stream, total_followers, total_views,
        total_games_streamed, active_days_per_week, language_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, avg_viewers_per_stream, total_followers, total_views,
       total_games_streamed, active_days_per_week, language_id]
    );

    res.status(201).json({
      streamer_id: result.insertId,
      name, avg_viewers_per_stream, total_followers, total_views,
      total_games_streamed, active_days_per_week, language_id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar un streamer
const update = async (req, res) => {
  try {
    const {
      name, avg_viewers_per_stream, total_followers, total_views,
      total_games_streamed, active_days_per_week, language_id
    } = req.body;

    const [result] = await db.query(
      `UPDATE STREAMER SET name = ?, avg_viewers_per_stream = ?,
       total_followers = ?, total_views = ?, total_games_streamed = ?,
       active_days_per_week = ?, language_id = ?
       WHERE streamer_id = ?`,
      [name, avg_viewers_per_stream, total_followers, total_views,
       total_games_streamed, active_days_per_week, language_id, req.params.id]
    );

    if (!result.affectedRows) return res.status(404).json({ error: 'Streamer no encontrado' });
    res.json({ message: 'Streamer actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Eliminar un streamer
const remove = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM STREAMER WHERE streamer_id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Streamer no encontrado' });
    res.json({ message: 'Streamer eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
