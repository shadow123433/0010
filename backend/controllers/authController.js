const db = require("../database/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// ===============================
// REGISTER
// ===============================
exports.register = async (req, res) => {
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
};

// ===============================
// LOGIN
// ===============================
exports.login = (req, res) => {
  const { email, senha } = req.body;

  db.get("SELECT * FROM users WHERE email=?", [email], async (err, user) => {
    // 1. Se o usuário não existe, retorna 404
    if (!user) {
      return res.status(404).json({ error: "Este e-mail não está cadastrado" });
    }

    // 2. Se o usuário existe, mas a senha está errada, retorna 401
    const ok = await bcrypt.compare(senha, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Senha incorreta" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token, role: user.role });
  });
};

// ===============================
// ME
// ===============================
exports.me = (req, res) => {
  res.json({
    id: req.user.id,
    role: req.user.role
  });
};