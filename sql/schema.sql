-- Users who manage the system
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) NOT NULL UNIQUE,
    password TEXT NOT NULL
);

-- Restaurant tables (physical seating)
CREATE TABLE tables (
    id SERIAL PRIMARY KEY,
    table_number VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'available'
);

-- Menu items available for orders
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    category VARCHAR(50),
    image_url VARCHAR(255),
    is_available BOOLEAN DEFAULT true
);

-- Orders placed by customers at a specific table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    table_id INTEGER REFERENCES tables(id),
    status VARCHAR(20) DEFAULT 'pending',
    placed_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    total_amount NUMERIC(10,2)
);

-- Items belonging to an order
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    menu_item_id INTEGER REFERENCES menu_items(id),
    quantity INTEGER NOT NULL,
    price_snapshot NUMERIC(10,2) NOT NULL
);

-- Payments made for orders
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    amount NUMERIC(10,2),
    payment_method VARCHAR(50),
    status VARCHAR(20),
    paid_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_menu_item_id ON order_items(menu_item_id);
CREATE INDEX idx_orders_table_id ON orders(table_id);
CREATE INDEX idx_orders_last_hour ON orders(placed_at, id, table_id, status);
CREATE INDEX idx_payments_order_id ON payments(order_id);
