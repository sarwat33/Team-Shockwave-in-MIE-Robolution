const pool = require('../db');

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  try {
    const result = await pool.query('SELECT * FROM admin_users WHERE email = $1 AND password = $2', [email, password]);
    if (result.rowCount === 0) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ message: 'Login successful', admin: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
};

module.exports = { login };