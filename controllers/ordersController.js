const pool = require("../db");

const placeOrder = async (req, res) => {
  const { tableId, items } = req.body;

  if (!tableId || !items || items.length === 0) {
    return res.status(400).json({ error: "Table ID and items are required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const orderRes = await client.query(
      `INSERT INTO orders (table_id, status, placed_at)
       VALUES ($1, 'pending', NOW()) RETURNING id`,
      [tableId]
    );

    const orderId = orderRes.rows[0].id;
    let totalAmount = 0;

    for (const item of items) {
      // Calculate running total
      totalAmount += item.price * item.quantity;
      
      await client.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, price_snapshot)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.id, item.quantity, item.price]
      );
    }
    
    // Update the order with the calculated total amount
    await client.query(
      `UPDATE orders SET total_amount = $1 WHERE id = $2`,
      [totalAmount, orderId]
    );

    await client.query("COMMIT");

    // Get the full order with items to return in response
    const orderWithItems = await getOrderWithItems(orderId);

    // Emit to dashboard with complete order info
    req.app.get("io").emit("new_order", orderWithItems);

    res.status(201).json({ 
      message: "Order placed", 
      orderId,
      order: orderWithItems
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Order failed" });
  } finally {
    client.release();
  }
};

const getLastHourOrders =  async (req, res) => {
  // validation 
  const { tableId } = req.params;
  if (!tableId) {
    return res.status(400).json({ error: "Table ID is required" });
  }
  
  try {
    const result = await pool.query(`
      SELECT 
          t.table_number,
          m.name AS item_name,
          oi.quantity,
          o.placed_at AS order_time
      FROM 
          orders o
      JOIN 
          tables t ON o.table_id = t.id
      JOIN 
          order_items oi ON o.id = oi.order_id
      JOIN 
          menu_items m ON oi.menu_item_id = m.id
      WHERE 
          o.placed_at >= NOW() - INTERVAL '1 hour'
      ORDER BY 
          o.placed_at DESC;
    `);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching last hour orders:', err);
    res.status(500).send('Server error');
  }
}
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id || !status) {
    return res.status(400).json({ error: "Order ID and status are required" });
  }

  const client = await pool.connect();
  try {
    let query;
    let values;

    if (status.toLowerCase() === "completed") {
      query = `
        UPDATE orders 
        SET status = $1, completed_at = NOW() 
        WHERE id = $2 
        RETURNING id, table_id, status, completed_at`;
      values = [status, id];
    } else {
      query = `
        UPDATE orders 
        SET status = $1 
        WHERE id = $2 
        RETURNING id, table_id, status, completed_at`;
      values = [status, id];
    }

    const result = await client.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const updatedOrder = result.rows[0];

    // Emit order_updated event to update the order status
    req.app.get("io").emit("order_updated", updatedOrder);
    
    // Emit order_status_updated event - your Dashboard component listens for this
    req.app.get("io").emit("order_status_updated");
    
    // Instead of socket.emit (which would send to a specific client),
    // we use io.emit to broadcast the dashboard update to all clients
    // We need to adapt the existing emitDashboardUpdate function for this
    
    // Fetch the IO instance
    const io = req.app.get("io");
    
    // Call the adapted version of emitDashboardUpdate
    await emitDashboardUpdateToAll(io);

    res.json(updatedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update order status" });
  } finally {
    client.release();
  }
};


// Adapted version of your emitDashboardUpdate function to work with IO instead of a specific socket
const emitDashboardUpdateToAll = async (io) => {
  try {
    // Get total sales from completed orders
    const totalSales = await pool.query(`
      SELECT SUM(total_amount) AS total 
      FROM orders 
      WHERE status = 'completed'
    `);

    // Get average fulfillment time in minutes
    const avgFulfillment = await pool.query(`
      SELECT AVG(EXTRACT(EPOCH FROM (completed_at - placed_at)))/60 AS avg_time_minutes 
      FROM orders 
      WHERE (status = 'completed' ) AND completed_at IS NOT NULL
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

    // Emit updated data to ALL clients using io.emit instead of socket.emit
    io.emit("dashboard-update", {
      pending_orders: pendingOrders.rows,
      orders_by_status: ordersByStatus.rows,
      total_sales: totalSales.rows[0].total || 0,
      avg_fulfillment_minutes: parseFloat(avgFulfillment.rows[0].avg_time_minutes || 0).toFixed(2)
    });
  } catch (error) {
    console.error("Error emitting dashboard update:", error);
  }
};

const getOrders = async (req, res) => {
  try {
    // Get status filter from query parameters if available
    const statusFilter = req.query.status;
    
    // Get all orders
    let ordersQuery = `
      SELECT id, table_id, status, placed_at 
      FROM orders
    `;
    
    // Add status filter if provided
    const queryParams = [];
    if (statusFilter) {
      // Handle multiple statuses separated by commas
      const statuses = statusFilter.split(',');
      const statusPlaceholders = statuses.map((_, idx) => `$${idx + 1}`).join(',');
      ordersQuery += ` WHERE status IN (${statusPlaceholders})`;
      queryParams.push(...statuses);
    }
    
    ordersQuery += ` ORDER BY placed_at DESC`;
    
    const orders = await pool.query(ordersQuery, queryParams);
    
    // For each order, get its items
    const ordersWithItems = await Promise.all(
      orders.rows.map(async (order) => {
        // Get items for this order
        const items = await pool.query(
          `SELECT oi.id, oi.menu_item_id, oi.quantity, oi.price_snapshot,
            mi.name, mi.description, mi.category
           FROM order_items oi
           JOIN menu_items mi ON oi.menu_item_id = mi.id
           WHERE oi.order_id = $1`,
          [order.id]
        );
        
        // Return order with its items
        return {
          ...order,
          items: items.rows
        };
      })
    );
    
    res.json(ordersWithItems);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// Helper function to get a single order with its items
const getOrderWithItems = async (orderId) => {
  // Get order details
  const orderResult = await pool.query(
    `SELECT id, table_id, status, placed_at,  placed_at FROM orders WHERE id = $1`,
    [orderId]
  );
  
  if (orderResult.rows.length === 0) {
    return null;
  }
  
  const order = orderResult.rows[0];
  
  // Get order items with menu item details
  const itemsResult = await pool.query(
    `SELECT oi.id, oi.menu_item_id, oi.quantity, oi.price_snapshot,
      mi.name, mi.description, mi.category
     FROM order_items oi
     JOIN menu_items mi ON oi.menu_item_id = mi.id
     WHERE oi.order_id = $1`,
    [orderId]
  );
  
  // Combine order with its items
  return {
    ...order,
    items: itemsResult.rows
  };
};


 
module.exports = { placeOrder, getLastHourOrders, getOrders, updateOrderStatus };
