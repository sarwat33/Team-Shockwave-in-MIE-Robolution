// routes/tables.js
const express = require('express');
const router = express.Router();
const { createTable, getAllTables, updateTable, deleteTable, getTable } = require('../controllers/tablesController');

router.get('/', getAllTables);
router.post('/', createTable);
router.get('/:id', getTable);
router.patch('/:id', updateTable);
router.delete('/:id', deleteTable);

module.exports = router;
