const pool = require('../db');

const createTable = async (req, res) => {
  const { table_number, status } = req.body;
  if (!table_number) return res.status(400).json({ error: 'Table number is required' });

  try {
    const result = await pool.query(
      'INSERT INTO tables (table_number, status) VALUES ($1, $2) RETURNING *',
      [table_number, status || 'available']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create table' });
  }
};

const getAllTables = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tables ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
};

const updateTable = async (req, res) => {
  const { id } = req.params;
  const { table_number, status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE tables SET
        table_number = COALESCE($1, table_number),
        status = COALESCE($2, status)
      WHERE id = $3 RETURNING *`,
      [table_number, status, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Table not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update table' });
  }
};

const deleteTable = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM tables WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Table not found' });
    res.json({ message: 'Table deleted', table: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete table' });
  }
};

const getTable = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM tables WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Table not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch table' });
  }
}


module.exports = { createTable, getAllTables, updateTable, deleteTable, getTable };

