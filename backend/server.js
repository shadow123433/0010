// Mostra no terminal o caminho completo do arquivo do banco de dados
console.log("📁 Banco em:", __dirname + "/pedidos.db");

// Importa o SQLite e ativa modo verbose (erros detalhados)
const sqlite3 = require("sqlite3").verbose();

// Importa o Express para criar servidor HTTP
const express = require("express");

// Importa o CORS para liberar acesso do frontend
const cors = require("cors");

// Cria a aplicação Express
const app = express();

// Habilita CORS
app.use(cors());

// Permite receber JSON no body das requisições
app.use(express.json());

/* =========================
   BANCO DE DADOS
========================= */

/* =========================
   BANCO DE DADOS
========================= */

const db = new sqlite3.Database(
  __dirname + "/pedidos.db",
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  err => {
    if (err) {
      console.error("❌ Erro ao abrir banco:", err.message);
      process.exit(1);
    }

    console.log("🗄️ Banco SQLite conectado");
  }
);

// evita travamento em múltiplas escritas
db.configure("busyTimeout", 10000);

db.serialize(() => {

  db.run("PRAGMA journal_mode = WAL;");
  db.run("PRAGMA synchronous = NORMAL;");

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
      status TEXT DEFAULT 'pendente'
    )
  `, err => {

    if (err) {
      console.error("❌ Erro ao criar tabela:", err.message);
      process.exit(1);
    }

    console.log("✅ Tabela 'pedidos' pronta");
  });

});
function normalizar(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

/* =========================
   PREÇOS DOS PRODUTOS
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
   ROTA TESTE
========================= */

// Apenas para validar se o backend está vivo
app.get("/", (req, res) => {
  res.send("✅ Backend funcionando corretamente");
});

/* =========================
   RECEBER PEDIDOS
========================= */

app.post("/pedidos", (req, res) => {

  const body = req.body;

  // Valores padrão
  const tipo = body.tipo || "PEDIDO";
  const pedidoID = body.pedidoID || "SEM-ID";
  const nome = body.nome || "Não informado";
  const endereco = body.endereco || "";
  const numeroCasa = body.numeroCasa || "";
  const referencia = body.referencia || "";

  // Garante que itens seja array
  const itens = Array.isArray(body.itens) ? body.itens : [];

  // Bloqueia carrinho vazio
  if (itens.length === 0) {
    return res.status(400).json({ error: "Carrinho vazio" });
  }

  // Soma total
  let totalCalculado = 0;

  for (const item of itens) {

    if (!item.produto || !item.tamanhos) {
      return res.status(400).json({ error: "Item mal formatado" });
    }

    // Normaliza nome
    const produtoNormalizado = normalizar(item.produto);

    // Busca preço
    const preco = PRECOS[produtoNormalizado];

    if (!preco) {
      return res.status(400).json({
        error: `Produto inválido: ${item.produto}`
      });
    }

    // Soma quantidades
    for (const qtd of Object.values(item.tamanhos)) {
      const quantidade = Number(qtd);

      if (quantidade > 0) {
        totalCalculado += preco * quantidade;
      }
    }
  }

  // Data ISO padrão
  const data = new Date().toISOString();

  // Define status inicial corretamente
  const statusInicial = tipo === "RESERVA"
    ? "aguardando"
    : "pendente";

  // Insere no banco
  db.run(
    `
    INSERT INTO pedidos
    (tipo, pedidoID, nome, endereco, numeroCasa, referencia, itens, total, data, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      tipo,
      pedidoID,
      nome,
      endereco,
      numeroCasa,
      referencia,
      JSON.stringify(itens),
      totalCalculado,
      data,
      statusInicial
    ],
    function (err) {

      if (err) {
        console.error("❌ Erro ao salvar pedido:", err.message);
        return res.status(500).json({ error: "Erro ao salvar pedido" });
      }

      // Retorna dados corretos
      res.status(201).json({
        success: true,
        pedidoID,
        total: totalCalculado.toFixed(2),
        status: statusInicial
      });

    }
  );

});

/* =========================
   LISTAR PEDIDOS
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

      // Converte dados
      const pedidos = rows.map(p => ({

        tipo: p.tipo,
        pedidoID: p.pedidoID,
        nome: p.nome,
        endereco: p.endereco || "",
        numeroCasa: p.numeroCasa || "",
        referencia: p.referencia || "",
        itens: JSON.parse(p.itens),
        total: Number(p.total).toFixed(2),
        data: p.data,
        status: p.status

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

/* =========================
   PAGAMENTO / RETIRADA
========================= */

// Marca pedido como pago
app.put("/pedidos/:pedidoID/pagar", (req, res) => {

  const pedidoID = req.params.pedidoID;

  db.get(
    "SELECT tipo FROM pedidos WHERE pedidoID = ?",
    [pedidoID],
    (err, row) => {

      if (err) {
        return res.status(500).json({ error: "Erro ao buscar pedido" });
      }

      if (!row) {
        return res.status(404).json({ error: "Pedido não encontrado" });
      }

      if (row.tipo === "RESERVA") {
        return res.status(400).json({
          error: "Reserva não pode ser marcada como paga"
        });
      }

      db.run(
        "UPDATE pedidos SET status = 'pago' WHERE pedidoID = ?",
        [pedidoID],
        function (err) {

          if (err) {
            return res.status(500).json({ error: "Erro ao atualizar status" });
          }

          res.json({
            success: true,
            pedidoID,
            status: "pago"
          });

        }
      );
    }
  );

});

// Marca reserva como retirada
app.put("/pedidos/:pedidoID/retirar", (req, res) => {

  const pedidoID = req.params.pedidoID;

  db.get(
    "SELECT tipo, status FROM pedidos WHERE pedidoID = ?",
    [pedidoID],
    (err, row) => {

      if (err) {
        return res.status(500).json({ error: "Erro ao buscar pedido" });
      }

      if (!row) {
        return res.status(404).json({ error: "Pedido não encontrado" });
      }

      if (row.tipo !== "RESERVA") {
        return res.status(400).json({
          error: "Apenas reservas podem ser retiradas"
        });
      }

      db.run(
        "UPDATE pedidos SET status = 'retirado' WHERE pedidoID = ?",
        [pedidoID],
        function (err) {

          if (err) {
            return res.status(500).json({
              error: "Erro ao atualizar status"
            });
          }

          res.json({
            success: true,
            pedidoID,
            status: "retirado"
          });

        }
      );
    }
  );

});
