console.log("📁 Banco em:", __dirname + "/pedidos.db");

const sqlite3 = require("sqlite3").verbose();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   BANCO DE DADOS
========================= */
const db = new sqlite3.Database("./pedidos.db", (err) => {
  if (err) {
    console.error("❌ Erro ao abrir banco de dados:", err.message);
    process.exit(1);
  }
  console.log("🗄️ Banco de dados SQLite conectado com sucesso");
});

db.serialize(() => {
  // Cria tabela com todas as colunas necessárias
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
      data TEXT NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error("❌ Erro ao criar tabela:", err.message);
      process.exit(1);
    }
    console.log("✅ Tabela 'pedidos' pronta");
  });
});

/* =========================
   FUNÇÃO DE NORMALIZAÇÃO
========================= */
function normalizar(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

/* =========================
   TABELA DE PREÇOS
========================= */
const PRECOS = {
  "camisa masculina e feminina ifes": 49.9,
  "bermuda masculina ifes": 79.9,
  "calca feminina ifes": 89.9,

  "camisa masculina e feminina sesi": 59.9,
  "bermuda masculina sesi": 84.9,
  "calca feminina sesi": 84.9,

  "camisa masculina e feminina cristo rei": 54.9,
  "bermuda masculina cristo rei": 92.9,
  "calca feminina cristo rei": 92.9
};

/* =========================
   ROTA TESTE. API REST GET - API SIMPLES PARA TESTAR SE O BACKEND ESTÁ RODANDO
========================= */
app.get("/", (req, res) => {
  res.send("✅ Backend funcionando corretamente");
});

/* =========================
   RECEBER PEDIDOS.   API PRINCIPAL QUE RECEBE DADOS DO FRONTEND, VALIDA PEDIDO, CALCULA O TOTAL, RESPONDE SUCESSO OU ERRO E SALVA NO BANCO
========================= */
app.post("/pedidos", (req, res) => {
  const body = req.body;

  const tipo = body.tipo || "PEDIDO";
  const pedidoID = body.pedidoID || "SEM-ID";
  const nome = body.nome || "Não informado";
  const endereco = body.endereco || "";
  const numeroCasa = body.numeroCasa || "";
  const referencia = body.referencia || "";
  const itens = Array.isArray(body.itens) ? body.itens : [];

  if (itens.length === 0) {
    return res.status(400).json({ error: "Carrinho vazio" });
  }

  let totalCalculado = 0;

  for (const item of itens) {
    if (!item.produto || !item.tamanhos) {
      return res.status(400).json({ error: "Item mal formatado" });
    }

    const produtoNormalizado = normalizar(item.produto);
    const preco = PRECOS[produtoNormalizado];

    if (!preco) {
      return res.status(400).json({ error: `Produto inválido: ${item.produto}` });
    }

    for (const qtd of Object.values(item.tamanhos)) {
      const quantidade = Number(qtd);
      if (quantidade > 0) {
        totalCalculado += preco * quantidade;
      }
    }
  }

  const data = new Date().toISOString();

  db.run(
    `INSERT INTO pedidos (tipo, pedidoID, nome, endereco, numeroCasa, referencia, itens, total, data)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      tipo,
      pedidoID,
      nome,
      endereco,
      numeroCasa,
      referencia,
      JSON.stringify(itens),
      totalCalculado,
      data
    ],
    function (err) {
      if (err) {
        console.error("❌ Erro ao salvar pedido:", err.message);
        return res.status(500).json({ error: "Erro ao salvar pedido" });
      }

      return res.status(201).json({
        success: true,
        pedidoID,
        total: totalCalculado.toFixed(2)
      });
    }
  );
});

/* =========================
   LISTAR PEDIDOS.  API QUE RETORNA TODOS OS PEDIDOS SALVOS NO BANCO EM FORMATO JSON PARA O FRONTEND
========================= */
app.get("/pedidos", (req, res) => {
  db.all(
    "SELECT * FROM pedidos ORDER BY id DESC",
    [],
    (err, rows) => {
      if (err) {
        console.error("❌ Erro ao buscar pedidos:", err.message);
        return res.status(500).json({ error: "Erro ao buscar pedidos" });
      }

      const pedidos = rows.map(p => ({
        tipo: p.tipo,
        pedidoID: p.pedidoID,
        nome: p.nome,
        endereco: p.endereco || "",
        numeroCasa: p.numeroCasa || "",
        referencia: p.referencia || "",
        itens: JSON.parse(p.itens),
        total: Number(p.total).toFixed(2),
        data: p.data
      }));

      res.json(pedidos);
    }
  );
});

/* =========================
   START SERVER
========================= */
app.listen(3000, () => {
  console.log("🚀 Servidor rodando em http://localhost:3000");
});
