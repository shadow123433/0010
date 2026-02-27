const express = require("express");
const router = express.Router();
const db = require("../database/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { auth } = require("../middlewares/auth");

const JWT_SECRET = process.env.JWT_SECRET;

// ===============================
// REGISTER
// ===============================
router.post("/register", async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha)
    return res.status(400).json({ error: "Campos obrigatórios" });

  if (!email.includes("@"))
    return res.status(400).json({ error: "Email inválido" });

  if (senha.length < 6)
    return res.status(400).json({ error: "Senha deve ter no mínimo 6 caracteres" });

  const hash = await bcrypt.hash(senha, 10);

  db.run(
    `INSERT INTO users (nome,email,password_hash) VALUES (?,?,?)`,
    [nome, email, hash],
    function (err) {
      if (err) return res.status(400).json({ error: "Email já cadastrado" });

      const token = jwt.sign(
        { id: this.lastID, role: "cliente" },
        JWT_SECRET,
        { expiresIn: "8h" }
      );

      res.json({ token });
    }
  );
});

// ===============================
// LOGIN
// ===============================
router.post("/login", (req, res) => {
  const { email, senha } = req.body;

  db.get("SELECT * FROM users WHERE email=?", [email], async (err, user) => {
    if (!user) return res.status(401).json({ error: "Credenciais inválidas" });

    const ok = await bcrypt.compare(senha, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Credenciais inválidas" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token, role: user.role });
  });
});

// ===============================
// ME
// ===============================
router.get("/me", auth, (req, res) => {
  res.json({
    id: req.user.id,
    role: req.user.role
  });
});

module.exports = router;