require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { PORT } = require("./config/env");

const authRoutes = require("./routes/authroutes");
const pedidosRoutes = require("./routes/pedidosroutes");

require("./database/db"); // inicializa banco

const app = express();

// Middlewares globais
app.use(cors({ origin: "http://localhost:5500" }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));

// Rotas
app.use("/auth", authRoutes);
app.use("/pedidos", pedidosRoutes);

// Health check (recomendado)
app.get("/", (req, res) => {
  res.json({ status: "API rodando" });
});

// Start
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});