const express = require('express');
const router = express.Router();
const { createMenuItem, updateMenuItem, deleteMenuItem, getAllMenuItems, getMenuItem } = require('../controllers/menuItemsController.js');

router.get('/', getAllMenuItems);
router.post('/', createMenuItem);
router.get('/:id', getMenuItem);
router.patch('/:id', updateMenuItem);
router.delete('/:id', deleteMenuItem);

module.exports = router;
