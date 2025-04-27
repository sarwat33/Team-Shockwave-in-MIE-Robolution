// sockets/orderSocket.js
const pool = require("../db");

const registerOrderSocket = (socket) => {
  console.log("Kitchen dashboard connected:", socket.id);
  
  // Listen for any order updates from the server
  socket.on('new_order', async () => {
    // When a new order comes in, send updated dashboard data
    await emitDashboardUpdate();
  });
  
  socket.on('order_status_updated', async () => {
    // When an order status changes, send updated dashboard data
    await emitDashboardUpdate();
  });

  // Function to fetch and emit updated dashboard data
  const emitDashboardUpdate = async () => {
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

      // Get pending orders with details
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
        WHERE o.status = 'pending'
        ORDER BY o.placed_at ASC
      `);

      // Emit updated data to this specific client
      socket.emit("dashboard-update", {
        pending_orders: pendingOrders.rows,
        orders_by_status: ordersByStatus.rows,
        total_sales: totalSales.rows[0].total || 0,
        avg_fulfillment_minutes: parseFloat(avgFulfillment.rows[0].avg_time_minutes || 0).toFixed(2)
      });
    } catch (error) {
      console.error("Error emitting dashboard update:", error);
    }
  };

  // Send initial data when client connects
  emitDashboardUpdate();

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Kitchen dashboard disconnected:", socket.id);
  });
};

module.exports = registerOrderSocket;