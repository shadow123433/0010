// ===============================
// SERVER.JS COMPLETO FUNCIONAL COM ADMIN
// ===============================

// Importa o framework Express (cria servidor HTTP)
const express = require("express");

// Biblioteca SQLite para banco de dados local
const sqlite3 = require("sqlite3").verbose();

// Middleware para permitir requisições de outros domínios (CORS)
const cors = require("cors");

// Biblioteca para hash de senha
const bcrypt = require("bcrypt");

// Biblioteca para gerar e validar JWT (tokens)
const jwt = require("jsonwebtoken");

// Manipular caminhos de arquivos
const path = require("path");

// Cria a aplicação Express
const app = express();

// Permite requisições externas
app.use(cors());

// Faz o Express entender JSON no body
app.use(express.json());

// Serve os arquivos do front-end (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "..")));

// Chave secreta usada para assinar tokens JWT
const JWT_SECRET = "troque_essa_chave_em_producao";


// ===============================
// BANCO DE DADOS
// ===============================

// Abre/cria banco SQLite
const db = new sqlite3.Database(
  __dirname + "/pedidos.db",
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE
);

// Tempo máximo de espera se banco estiver ocupado
db.configure("busyTimeout", 10000);

// Executa comandos em sequência
db.serialize(() => {

  // Melhora concorrência
  db.run("PRAGMA journal_mode = WAL;");

  // Ajusta desempenho
  db.run("PRAGMA synchronous = NORMAL;");

  // Cria tabela de usuários se não existir
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'cliente',
      criado_em TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Cria tabela de pedidos
  db.run(`
    CREATE TABLE IF NOT EXISTS pedidos (
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
    )
  `);

  console.log("✅ Banco e tabelas prontos");

  // ===============================
  // CRIA ADMIN PADRÃO
  // ===============================

  const adminEmail = "admin@admin.com";
  const adminSenha = "admin123";

  // Procura admin no banco
  db.get(
    "SELECT * FROM users WHERE email=?",
    [adminEmail],
    async (err, user) => {

      // Se não existir, cria
      if (!user) {
        const hash = await bcrypt.hash(adminSenha, 10);

        db.run(
          `INSERT INTO users (nome,email,password_hash,role)
           VALUES (?,?,?,?)`,
          ["Admin", adminEmail, hash, "admin"],
          () =>
            console.log(
              `✅ Admin criado: ${adminEmail} / ${adminSenha}`
            )
        );

      } else {
        console.log("✅ Admin já existe:", adminEmail);
      }
    }
  );
});


// ===============================
// HELPERS (middlewares)
// ===============================

// Middleware que valida JWT
function auth(req, res, next) {

  // Lê header Authorization
  const header = req.headers.authorization;

  // Se não existir, bloqueia
  if (!header)
    return res.status(401).json({ error: "Não autenticado" });

  // Separa "Bearer TOKEN"
  const token = header.split(" ")[1];

  if (!token)
    return res.status(401).json({ error: "Token inválido" });

  try {
    // Decodifica token
    req.user = jwt.verify(token, JWT_SECRET);

    // Continua a rota
    next();

  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}

// Middleware para permitir apenas admin
function onlyAdmin(req, res, next) {

  // Se não for admin, bloqueia
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Acesso negado" });

  next();
}


// ===============================
// AUTENTICAÇÃO
// ===============================

// Cadastro
app.post("/auth/register", async (req, res) => {

  // Pega dados do body
  const { nome, email, senha } = req.body;

  // Validação básica
  if (!nome || !email || !senha)
    return res.status(400).json({ error: "Campos obrigatórios" });

  // Gera hash da senha
  const hash = await bcrypt.hash(senha, 10);

  // Insere usuário
  db.run(
    `INSERT INTO users (nome,email,password_hash)
     VALUES (?,?,?)`,
    [nome, email, hash],
    function (err) {

      if (err)
        return res.status(400).json({ error: "Email já cadastrado" });

      // Gera token
      const token = jwt.sign(
        { id: this.lastID, role: "cliente" },
        JWT_SECRET,
        { expiresIn: "8h" }
      );

      res.json({ token });
    }
  );
});

// Login
app.post("/auth/login", (req, res) => {

  const { email, senha } = req.body;

  db.get(
    "SELECT * FROM users WHERE email=?",
    [email],
    async (err, user) => {

      if (!user)
        return res.status(401).json({ error: "Credenciais inválidas" });

      // Compara senha
      const ok = await bcrypt.compare(senha, user.password_hash);

      if (!ok)
        return res.status(401).json({ error: "Credenciais inválidas" });

      // Gera token
      const token = jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: "8h" }
      );

      res.json({ token, role: user.role });
    }
  );
});


// ===============================
// PRECOS FIXOS (BACKEND)
// ===============================

const PRECOS = {
  camisa_ifes: 49.9,
  bermuda_ifes: 79.9,
  calca_ifes: 89.9,

  camisa_sesi: 59.9,
  bermuda_sesi: 84.9,
  calca_sesi: 84.9,

  camisa_cristorei: 54.9,
  bermuda_cristorei: 92.9,
  calca_cristorei: 92.9
};


// ===============================
// CRIAR PEDIDOS
// ===============================

app.post("/pedidos", auth, (req, res) => {

  try {

    const body = req.body;

    const itens = Array.isArray(body.itens)
      ? body.itens
      : [];

    if (itens.length === 0)
      return res.status(400).json({ error: "Carrinho vazio" });

    let totalCalculado = 0;

    for (const item of itens) {

      const preco = PRECOS[item.produto];

      if (!preco)
        return res.status(400).json({ error: "Produto inválido" });

      for (const qtd of Object.values(item.tamanhos)) {
        totalCalculado += Number(qtd || 0) * preco;
      }
    }

    const pedidoID = body.pedidoID || Date.now().toString();

    const statusInicial =
      body.tipo === "RESERVA" ? "aguardando" : "pendente";

    db.run(
      `INSERT INTO pedidos
       (tipo,pedidoID,nome,endereco,numeroCasa,referencia,
        itens,total,data,status,user_id)
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
      function (err) {

        if (err)
          return res.status(500).json({ error: "Erro ao salvar pedido" });

        res.json({
          pedidoID,
          total: (Number(body.total) || totalCalculado).toFixed(2),
          status: statusInicial
        });
      }
    );

  } catch {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});


// ===============================
// CLIENTE VE SEUS PEDIDOS
// ===============================

app.get("/meus-pedidos", auth, (req, res) => {

  db.all(
    "SELECT * FROM pedidos WHERE user_id=? AND ativo_usuario=1 ORDER BY id DESC",
    [req.user.id],
    (err, rows) => {

      if (err)
        return res.status(500).json({ error: "Erro ao buscar pedidos" });

      const pedidos = (rows || []).map(p => ({
        ...p,
        itens: JSON.parse(p.itens)
      }));

      res.json(pedidos);
    }
  );
});


// ===============================
// ADMIN
// ===============================

app.get("/pedidos", auth, onlyAdmin, (req, res) => {

  db.all(
    "SELECT * FROM pedidos ORDER BY id DESC",
    [],
    (err, rows) => {

      if (err)
        return res.status(500).json({ error: "Erro ao buscar pedidos" });

      const pedidos = rows.map(p => ({
        ...p,
        itens: JSON.parse(p.itens)
      }));

      res.json(pedidos);
    }
  );
});


// ===============================
// START SERVER
// ===============================

app.listen(3000, () => {
  console.log("🚀 Server rodando em http://localhost:3000");
});
