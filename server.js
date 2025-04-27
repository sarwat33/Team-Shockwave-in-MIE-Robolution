// server.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const orderRoutes = require("./routes/orders");
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const menuItemRoutes = require("./routes/menuItems");
const tableRoutes = require("./routes/tables");
const registerOrderSocket = require("./sockets/orderSocket");

require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  },
});

// Store the io instance on the app object
app.set("io", io);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/orders", orderRoutes);
app.use("/dashboard", dashboardRoutes);
app.use('/auth', authRoutes);
app.use('/menu-items', menuItemRoutes);
app.use('/tables', tableRoutes);

// Socket setup
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  
  // Register order socket handlers
  registerOrderSocket(socket);
  
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});