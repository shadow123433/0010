// ===============================
// SERVER.JS COMPLETO FUNCIONAL COM ADMIN
// ===============================

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, ".."))); // Frontend

const JWT_SECRET = "troque_essa_chave_em_producao";

// ===============================
// BANCO DE DADOS
// ===============================

const db = new sqlite3.Database(__dirname + "/pedidos.db", sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);
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
    user_id INTEGER
  )`);

  console.log("✅ Banco e tabelas prontos");

  // ===============================
  // CRIA ADMIN PADRÃO
  // ===============================
  const adminEmail = "admin@admin.com";
  const adminSenha = "admin123";

  db.get("SELECT * FROM users WHERE email=?", [adminEmail], async (err, user) => {
    if (!user) {
      const hash = await bcrypt.hash(adminSenha, 10);
      db.run(`INSERT INTO users (nome,email,password_hash,role) VALUES (?,?,?,?)`,
        ["Admin", adminEmail, hash, "admin"],
        () => console.log(`✅ Admin criado: ${adminEmail} / ${adminSenha}`)
      );
    } else {
      console.log("✅ Admin já existe:", adminEmail);
    }
  });
});

// ===============================
// HELPERS
// ===============================

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Não autenticado" });
  const token = header.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token inválido" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}

function onlyAdmin(req, res, next) {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Acesso negado" });
  next();
}

// ===============================
// AUTENTICAÇÃO
// ===============================

app.post("/auth/register", async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) return res.status(400).json({ error: "Campos obrigatórios" });

  const hash = await bcrypt.hash(senha, 10);

  db.run(`INSERT INTO users (nome,email,password_hash) VALUES (?,?,?)`, [nome,email,hash], function(err) {
    if (err) return res.status(400).json({ error: "Email já cadastrado" });
    const token = jwt.sign({ id: this.lastID, role: "cliente" }, JWT_SECRET, { expiresIn: "8h" });
    res.json({ token });
  });
});

app.post("/auth/login", (req, res) => {
  const { email, senha } = req.body;
  db.get("SELECT * FROM users WHERE email=?", [email], async (err, user) => {
    if (!user) return res.status(401).json({ error: "Credenciais inválidas" });
    const ok = await bcrypt.compare(senha, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Credenciais inválidas" });
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "8h" });
    res.json({ token, role: user.role });
  });
});

// ===============================
// PRECOS
// ===============================

const PRECOS = {
  camisa_ifes: 49.9, bermuda_ifes: 79.9, calca_ifes: 89.9,
  camisa_sesi: 59.9, bermuda_sesi: 84.9, calca_sesi: 84.9,
  camisa_cristorei: 54.9, bermuda_cristorei: 92.9, calca_cristorei: 92.9
};

// ===============================
// CRIAR PEDIDOS / RESERVAS
// ===============================

app.post("/pedidos", auth, (req, res) => {
  try {
    const body = req.body;
    const itens = Array.isArray(body.itens) ? body.itens : [];

    if (itens.length === 0) return res.status(400).json({ error: "Carrinho vazio" });

    let totalCalculado = 0;
    for (const item of itens) {
      const preco = PRECOS[item.produto];
      if (!preco) return res.status(400).json({ error: "Produto inválido" });
      for (const qtd of Object.values(item.tamanhos)) totalCalculado += Number(qtd || 0) * preco;
    }

    const pedidoID = body.pedidoID || Date.now().toString();
    const statusInicial = body.tipo === "RESERVA" ? "aguardando" : "pendente";

    db.run(
      `INSERT INTO pedidos
      (tipo,pedidoID,nome,endereco,numeroCasa,referencia,itens,total,data,status,user_id)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [
        body.tipo || "PEDIDO",
        pedidoID,
        body.nome,
        body.endereco || "",
        body.numeroCasa || "",
        body.referencia || "",
        JSON.stringify(itens),
        Number(body.total) || totalCalculado,
        new Date().toISOString(),
        statusInicial,
        req.user.id
      ],
      function(err) {
        if (err) return res.status(500).json({ error: "Erro ao salvar pedido" });
        res.json({
          pedidoID,
          total: (Number(body.total) || totalCalculado).toFixed(2),
          status: statusInicial
        });
      }
    );

  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// ===============================
// CLIENTE VE SEUS PEDIDOS
// ===============================

db.all("PRAGMA table_info(pedidos)", (err, cols) => {
  if (err) throw err;
  const hasAtivoUsuario = cols.some(col => col.name === "ativo_usuario");
  if (!hasAtivoUsuario) {
    db.run("ALTER TABLE pedidos ADD COLUMN ativo_usuario INTEGER DEFAULT 1");
  }
});

app.get("/meus-pedidos", auth, (req, res) => {
  db.all("SELECT * FROM pedidos WHERE user_id=? AND ativo_usuario=1 ORDER BY id DESC", [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: "Erro ao buscar pedidos" });
    const pedidos = (rows || []).map(pedido => ({
      ...pedido,
      itens: pedido.itens ? JSON.parse(pedido.itens) : []
    }));
    res.json(pedidos);
  });
});


// ===============================
// ADMIN VE TODOS PEDIDOS / RESERVAS
// ===============================

app.get("/pedidos", auth, onlyAdmin, (req, res) => {
  db.all("SELECT * FROM pedidos ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Erro ao buscar pedidos" });
    const pedidos = (rows || []).map(pedido => ({
      ...pedido,
      itens: pedido.itens ? JSON.parse(pedido.itens) : []
    }));
    res.json(pedidos);
  });
});

// ===============================
// ADMIN AÇÕES
// ===============================

app.put("/pedidos/:pedidoID/pagar", auth, onlyAdmin, (req, res) => {
  db.run("UPDATE pedidos SET status='pago' WHERE pedidoID=?", [req.params.pedidoID], function(err) {
    if (err) return res.status(500).json({ error: "Erro ao atualizar" });
    res.json({ success: true });
  });
});

app.put("/pedidos/:pedidoID/retirar", auth, onlyAdmin, (req, res) => {
  db.run("UPDATE pedidos SET status='retirado' WHERE pedidoID=?", [req.params.pedidoID], function(err) {
    if (err) return res.status(500).json({ error: "Erro ao atualizar" });
    res.json({ success: true });
  });
});



// ===============================
// EXCLUIR PEDIDO DO USUÁRIO
// ===============================

app.patch("/meus-pedidos/:pedidoID", auth, (req, res) => {
  const pedidoID = req.params.pedidoID;
  const userId = req.user.id;

  db.run(
    "UPDATE pedidos SET ativo_usuario=0 WHERE pedidoID=? AND user_id=?",
    [pedidoID, userId],
    function(err) {
      if (err) return res.status(500).json({ error: "Erro ao atualizar pedido" });
      if (this.changes === 0)
        return res.status(404).json({ error: "Pedido não encontrado ou não pertence a você" });
      res.json({ success: true, msg: "Pedido oculto da sua conta" });
    }
  );
});




// ===============================
// START SERVER
// ===============================

app.listen(3000, () => {
  console.log("🚀 Server rodando em http://localhost:3000");
});
