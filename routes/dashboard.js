const express = require("express");
const router = express.Router();
const { getDashboardMetrics } = require("../controllers/dashboardController");

router.get("/metrics", getDashboardMetrics);

module.exports = router;
