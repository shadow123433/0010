const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
require("dotenv").config();

const db = new sqlite3.Database(
  __dirname + "/../pedidos.db",
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE
);

db.configure("busyTimeout", 10000);

db.serialize(() => {
  db.run("PRAGMA journal_mode = WAL;");
  db.run("PRAGMA synchronous = NORMAL;");

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'cliente',
    criado_em TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL,
    pedidoID TEXT NOT NULL,
    nome TEXT NOT NULL,
    endereco TEXT,
    numeroCasa TEXT,
    referencia TEXT,
    itens TEXT NOT NULL,
    total REAL NOT NULL,
    data TEXT NOT NULL,
    status TEXT DEFAULT 'pendente',
    user_id INTEGER,
    ativo_usuario INTEGER DEFAULT 1
  )`);

  console.log("✅ Banco e tabelas prontos");

  // ===============================
  // CRIAR ADMIN PADRÃO
  // ===============================
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminSenha = process.env.ADMIN_PASSWORD;

  db.get("SELECT * FROM users WHERE email=?", [adminEmail], async (err, user) => {
    if (!user) {
      const hash = await bcrypt.hash(adminSenha, 10);
      db.run(
        `INSERT INTO users (nome,email,password_hash,role) VALUES (?,?,?,?)`,
        ["Admin", adminEmail, hash, "admin"],
        () => console.log(`Admin criado: ${adminEmail}`)
      );
    } else {
      console.log("✅ Admin já existe:", adminEmail);
    }
  });
});

module.exports = db;