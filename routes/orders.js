const express = require("express");
const router = express.Router();
const { placeOrder, getOrders, getLastHourOrders, updateOrderStatus } = require("../controllers/ordersController");

router.get("/", getOrders)
router.post("/", placeOrder);
router.post('/last-hour-orders', getLastHourOrders )
router.put("/:id/status", updateOrderStatus);



module.exports = router;
