// controllers/dashboardController.js
const pool = require("../db");

const getDashboardMetrics = async (req, res) => {
  try {
    // Get total sales from completed orders
    const totalSales = await pool.query(`
      SELECT SUM(total_amount) AS total 
      FROM orders 
      WHERE status = 'completed' OR status = 'served'
    `);

    // Get average fulfillment time in minutes
    const avgFulfillment = await pool.query(`
      SELECT AVG(EXTRACT(EPOCH FROM (completed_at - placed_at)))/60 AS avg_time_minutes 
      FROM orders 
      WHERE (status = 'completed' OR status = 'served') AND completed_at IS NOT NULL
    `);

    // Get order count by status for all orders
    const ordersByStatus = await pool.query(`
      SELECT 
        status, 
        COUNT(*) as count 
      FROM orders 
      GROUP BY status
    `);

    // Get ONLY pending orders with table info and items
    const pendingOrders = await pool.query(`
      SELECT 
        o.id, 
        o.status, 
        o.placed_at, 
        o.total_amount,
        t.table_number,
        (
          SELECT json_agg(json_build_object(
            'id', oi.id,
            'name', mi.name,
            'quantity', oi.quantity,
            'price', oi.price_snapshot
          ))
          FROM order_items oi
          JOIN menu_items mi ON oi.menu_item_id = mi.id
          WHERE oi.order_id = o.id
        ) AS items
      FROM orders o
      JOIN tables t ON o.table_id = t.id
      WHERE o.status IN ('pending', 'in-progress')
      ORDER BY o.placed_at ASC
    `);

    res.json({
      total_sales: totalSales.rows[0].total || 0,
      avg_fulfillment_minutes: parseFloat(avgFulfillment.rows[0].avg_time_minutes || 0).toFixed(2),
      pending_orders: pendingOrders.rows,
      orders_by_status: ordersByStatus.rows
    });
  } catch (err) {
    console.error("Dashboard metrics error:", err);
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
};

module.exports = {
  getDashboardMetrics
};