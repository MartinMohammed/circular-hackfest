// server.js
const express = require("express");
const WebSocket = require("ws");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();

const serverPort = process.env.SERVER_PORT || 3000;
const webSocketPort = process.env.WEB_SOCKET_PORT || 8080;
const postgresHost = process.env.POSTGRES_HOST;
const postgresUser = process.env.POSTGRES_USER;
const postgresPassword = process.env.POSTGRES_PASSWORD;
const postgresDB = process.env.POSTGRES_DB;
const postgresPort = process.env.POSTGRES_PORT || 5432;

const pool = new Pool({
  user: postgresUser,
  host: postgresHost,
  database: postgresDB,
  password: postgresPassword,
  port: postgresPort,
});

app.use(bodyParser.json());

app.post("/api/identifications", async (req, res) => {
  const { SerialNumber, ApplianceType, Timestamp } = req.body;

  if (SerialNumber && ApplianceType && Timestamp) {
    try {
      const result = await pool.query(
        'INSERT INTO identifications (serial_number, appliance_type, "timestamp") VALUES ($1, $2, $3) RETURNING *',
        [SerialNumber, ApplianceType, Timestamp]
      );

      const identification = result.rows[0];

      // Broadcast to WebSocket clients
      broadcastNewIdentification(identification);

      res.status(201).send({ message: "Identification added successfully!" });
    } catch (error) {
      console.error("Error inserting data:", error);
      res.status(500).send({ message: "Server error" });
    }
  } else {
    res.status(400).send({ message: "Invalid data format" });
  }
});

// Initialize WebSocket server
const wss = new WebSocket.Server({ port: webSocketPort });

wss.on("connection", async (ws) => {
  console.log("Client connected");

  try {
    // Fetch existing identifications from the database
    const result = await pool.query(
      "SELECT * FROM identifications ORDER BY id ASC"
    );
    const identifications = result.rows;

    // Send existing data on connection
    ws.send(JSON.stringify(identifications));
  } catch (error) {
    console.error("Error fetching data:", error);
  }

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

// Broadcast new identification to all connected clients
function broadcastNewIdentification(identification) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify([identification]));
    }
  });
}

app.listen(serverPort, () => {
  console.log(`Server running on http://localhost:${serverPort}`);
});
