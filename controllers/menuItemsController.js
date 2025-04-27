const pool = require('../db');

// Create menu item
const createMenuItem = async (req, res) => {
  const { name, price, category, description, is_available } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Name, price, and category are required.' });
  }

  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({ error: 'Price must be a number greater than 0.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO menu_items (name, price, category, description, is_available)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, price, category, description || '', is_available ?? true]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
};

// Get all menu items
const getAllMenuItems = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menu_items ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve menu items' });
  }
};

// Update menu item
const updateMenuItem = async (req, res) => {
  const { id } = req.params;
  const { name, price, category, description, is_available } = req.body;

  if (!id) return res.status(400).json({ error: 'Menu item ID is required' });

  try {
    const existing = await pool.query('SELECT * FROM menu_items WHERE id = $1', [id]);
    if (existing.rowCount === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    await pool.query(
      `UPDATE menu_items SET
         name = COALESCE($1, name),
         price = COALESCE($2, price),
         category = COALESCE($3, category),
         description = COALESCE($4, description),
         is_available = COALESCE($5, is_available)
       WHERE id = $6`,
      [name, price, category, description, is_available, id]
    );

    const updated = await pool.query('SELECT * FROM menu_items WHERE id = $1', [id]);
    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
};

// Delete menu item
const deleteMenuItem = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await pool.query('DELETE FROM menu_items WHERE id = $1 RETURNING *', [id]);
    if (deleted.rowCount === 0) return res.status(404).json({ error: 'Menu item not found' });
    res.json({ message: 'Menu item deleted', item: deleted.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
};

// Get single menu item
const getMenuItem = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM menu_items WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Menu item not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve menu item' });
  }
};

module.exports = { createMenuItem, updateMenuItem, deleteMenuItem, getAllMenuItems, getMenuItem };