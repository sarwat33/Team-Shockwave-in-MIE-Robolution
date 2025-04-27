const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
async function seed() {
  try {
    await pool.query('BEGIN');

    // 1. Seed tables
    const tablePromises = [];
    for (let i = 1; i <= 10; i++) {
      tablePromises.push(
        pool.query(
          `INSERT INTO tables (table_number, status) VALUES ($1, $2)`,
          [`T${i}`, i % 3 === 0 ? 'occupied' : 'available']
        )
      );
    }
    await Promise.all(tablePromises);

    // 2. Seed menu_items
    const menuItems = [
      {
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce and mozzarella',
        price: 10.99,
        category: 'Main Course',
        image_url: 'https://example.com/pizza.jpg',
      },
      {
        name: 'Caesar Salad',
        description: 'Romaine lettuce with Caesar dressing and croutons',
        price: 7.5,
        category: 'Appetizer',
        image_url: 'https://example.com/salad.jpg',
      },
      {
        name: 'Spaghetti Bolognese',
        description: 'Pasta with rich meat sauce',
        price: 12.5,
        category: 'Main Course',
        image_url: 'https://example.com/spaghetti.jpg',
      },
      {
        name: 'Cheesecake',
        description: 'Creamy dessert with a graham cracker crust',
        price: 6.0,
        category: 'Dessert',
        image_url: 'https://example.com/cheesecake.jpg',
      },
      {
        name: 'Lemonade',
        description: 'Freshly squeezed lemonade',
        price: 3.0,
        category: 'Beverage',
        image_url: 'https://example.com/lemonade.jpg',
      },
    ];

    for (const item of menuItems) {
      await pool.query(
        `INSERT INTO menu_items (name, description, price, category, image_url) VALUES ($1, $2, $3, $4, $5)`,
        [item.name, item.description, item.price, item.category, item.image_url]
      );
    }

    // 3. Seed orders
    const orderIds = [];
    for (let i = 1; i <= 5; i++) {
      const res = await pool.query(
        `INSERT INTO orders (table_id, status, total_amount) VALUES ($1, $2, $3) RETURNING id`,
        [i, i % 2 === 0 ? 'completed' : 'pending', 25.00 + i * 3]
      );
      orderIds.push(res.rows[0].id);
    }

    // 4. Seed order_items
    const menuRes = await pool.query('SELECT id, price FROM menu_items');
    const menuData = menuRes.rows;

    const orderItemPromises = [];
    for (const orderId of orderIds) {
      const randomItems = menuData.sort(() => 0.5 - Math.random()).slice(0, 3);

      for (const item of randomItems) {
        const quantity = Math.floor(Math.random() * 3) + 1;
        orderItemPromises.push(
          pool.query(
            `INSERT INTO order_items (order_id, menu_item_id, quantity, price_snapshot) VALUES ($1, $2, $3, $4)`,
            [orderId, item.id, quantity, item.price]
          )
        );
      }
    }
    await Promise.all(orderItemPromises);

    await pool.query('COMMIT');
    console.log('Seeding completed!');
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error during seeding:', error);
  } finally {
    await pool.end();
  }
}

seed();
