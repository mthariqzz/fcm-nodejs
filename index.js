const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const appRoutes = require("./routes/app.routes");

dotenv.config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
);

// Middleware and Routes
app.use("/api", require("./routes/app.routes"));

// Database MySQL
const mysql = require("mysql");
const dbConfig = require("./config/db.config");

const db = mysql.createConnection({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
});

db.connect((error) => {
  if (error) {
    throw error;
  }
  console.log("Successfully connected to the database");
});

global.db = db;

// Websocket
const server = http.createServer(app);
const io = socketIO(server);
module.exports.io = io; // Export io

io.on("connection", (socket) => {
  console.log("A user has connected");

  socket.on("disconnect", () => {
    console.log("User has disconnected");
  });

  socket.on("pesanDariClient", (data) => {
    console.log("Message from client:", data);
    io.emit("pesanDariServer", { data: "This is data from the server" });
  });
});

// Regular RESTful endpoint
app.get("/", async (req, res) => {
  res.status(200).send({
    message: "Hello from the Node.js RESTful side!",
  });
});

// Additional router from the first code
app.use("/api", appRoutes);

// Run the server
server.listen(4000, function () {
  console.log("Server is Ready to Go !");
});
