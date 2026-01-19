// Mostra no terminal o caminho completo do arquivo do banco de dados
console.log("📁 Banco em:", __dirname + "/pedidos.db");

// Importa o SQLite e ativa modo verbose (mensagens de erro mais detalhadas)
const sqlite3 = require("sqlite3").verbose();

// Importa o framework Express para criar o servidor HTTP
const express = require("express");

// Importa o middleware CORS para permitir acesso do frontend
const cors = require("cors");

// Cria a aplicação Express
const app = express();

// Habilita CORS (permite requisições de qualquer origem)
app.use(cors());

// Permite que o servidor receba JSON no corpo das requisições
app.use(express.json());

/* =========================
   BANCO DE DADOS
========================= */

// Abre ou cria o banco de dados SQLite no diretório atual
const db = new sqlite3.Database(__dirname + "/pedidos.db", (err) => {
  // Se der erro ao abrir o banco, exibe mensagem
  if (err) {
    console.error("❌ Erro ao abrir banco de dados:", err.message);
    // Encerra o servidor porque sem banco ele não funciona
    process.exit(1);
  }

  // Confirma que o banco foi conectado com sucesso
  console.log("🗄️ Banco de dados SQLite conectado com sucesso");
});

// Garante que os comandos SQL rodem em ordem
db.serialize(() => {
  // Cria a tabela de pedidos se ela ainda não existir
  db.run(`
    CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT, -- ID interno do banco
      tipo TEXT NOT NULL,                   -- Tipo do pedido (PEDIDO ou RESERVA)
      pedidoID TEXT NOT NULL,               -- ID visível do pedido
      nome TEXT NOT NULL,                   -- Nome do cliente
      endereco TEXT,                        -- Endereço (opcional)
      numeroCasa TEXT,                      -- Número da casa (opcional)
      referencia TEXT,                      -- Referência (opcional)
      itens TEXT NOT NULL,                  -- Itens do pedido em JSON (string)
      total REAL NOT NULL,                  -- Valor total do pedido
      data TEXT NOT NULL,                   -- Data do pedido
      status TEXT DEFAULT 'pendente'        -- Status do pagamento
    )
  `, (err) => {
    // Caso dê erro na criação da tabela
    if (err) {
      console.error("❌ Erro ao criar tabela:", err.message);
      process.exit(1);
    }

    // Confirma que a tabela está pronta
    console.log("✅ Tabela 'pedidos' pronta com coluna 'status'");
  });
});

/* =========================
   FUNÇÃO DE NORMALIZAÇÃO
========================= */

// Função para padronizar textos (nomes de produtos)
function normalizar(str) {
  return str
    .normalize("NFD")                     // Separa letras de acentos
    .replace(/[\u0300-\u036f]/g, "")     // Remove os acentos
    .trim()                              // Remove espaços extras
    .toLowerCase();                      // Converte para minúsculo
}

/* =========================
   TABELA DE PREÇOS
========================= */

// Objeto que define os preços de cada produto
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

// Rota simples para verificar se o backend está funcionando
app.get("/", (req, res) => {
  res.send("✅ Backend funcionando corretamente");
});

/* =========================
   RECEBER PEDIDOS
========================= */

// Rota que recebe pedidos enviados pelo frontend
app.post("/pedidos", (req, res) => {
  // Corpo da requisição
  const body = req.body;

  // Define valores padrão caso algo não seja enviado
  const tipo = body.tipo || "PEDIDO";
  const pedidoID = body.pedidoID || "SEM-ID";
  const nome = body.nome || "Não informado";
  const endereco = body.endereco || "";
  const numeroCasa = body.numeroCasa || "";
  const referencia = body.referencia || "";

  // Garante que os itens sejam um array
  const itens = Array.isArray(body.itens) ? body.itens : [];

  // Bloqueia pedido sem itens
  if (itens.length === 0) {
    return res.status(400).json({ error: "Carrinho vazio" });
  }

  // Variável para somar o valor total
  let totalCalculado = 0;

  // Percorre cada item do pedido
  for (const item of itens) {
    // Valida estrutura do item
    if (!item.produto || !item.tamanhos) {
      return res.status(400).json({ error: "Item mal formatado" });
    }

    // Normaliza o nome do produto
    const produtoNormalizado = normalizar(item.produto);

    // Busca o preço do produto
    const preco = PRECOS[produtoNormalizado];

    // Se o produto não existir na tabela de preços
    if (!preco) {
      return res.status(400).json({ error: `Produto inválido: ${item.produto}` });
    }

    // Soma as quantidades de cada tamanho
    for (const qtd of Object.values(item.tamanhos)) {
      const quantidade = Number(qtd);
      if (quantidade > 0) {
        totalCalculado += preco * quantidade;
      }
    }
  }

  // Data atual em formato padrão
  const data = new Date().toISOString();

  // Insere o pedido no banco de dados
  db.run(
    `INSERT INTO pedidos 
     (tipo, pedidoID, nome, endereco, numeroCasa, referencia, itens, total, data, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      tipo,
      pedidoID,
      nome,
      endereco,
      numeroCasa,
      referencia,
      JSON.stringify(itens), // Converte itens para string
      totalCalculado,
      data,
      'pendente' // Status inicial do pedido
    ],
    function (err) {
      // Caso ocorra erro ao salvar
      if (err) {
        console.error("❌ Erro ao salvar pedido:", err.message);
        return res.status(500).json({ error: "Erro ao salvar pedido" });
      }

      // Retorna sucesso ao frontend
      return res.status(201).json({
        success: true,
        pedidoID,
        total: totalCalculado.toFixed(2),
        status: 'pendente'
      });
    }
  );
});

/* =========================
   LISTAR PEDIDOS
========================= */

// Rota que retorna todos os pedidos cadastrados
app.get("/pedidos", (req, res) => {
  db.all(
    "SELECT * FROM pedidos ORDER BY id DESC", // Busca pedidos do mais novo para o mais antigo
    [],
    (err, rows) => {
      if (err) {
        console.error("❌ Erro ao buscar pedidos:", err.message);
        return res.status(500).json({ error: "Erro ao buscar pedidos" });
      }

      // Converte os dados do banco para JSON
      const pedidos = rows.map(p => ({
        tipo: p.tipo,
        pedidoID: p.pedidoID,
        nome: p.nome,
        endereco: p.endereco || "",
        numeroCasa: p.numeroCasa || "",
        referencia: p.referencia || "",
        itens: JSON.parse(p.itens), // Converte string para objeto
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

// Inicia o servidor na porta 3000
app.listen(3000, () => {
  console.log("🚀 Servidor rodando em http://localhost:3000");
});

/* =========================
   SIMULAÇÃO DE PAGAMENTO
========================= */

// Rota para marcar um pedido como pago
app.put("/pedidos/:pedidoID/pagar", (req, res) => {
  // Captura o ID do pedido pela URL
  const pedidoID = req.params.pedidoID;

  // Atualiza o status do pedido no banco
  db.run(
    `UPDATE pedidos SET status = 'pago' WHERE pedidoID = ?`,
    [pedidoID],
    function(err) {
      if (err) {
        return res.status(500).json({ error: "Erro ao atualizar status" });
      }

      // Retorna confirmação
      res.json({ success: true, pedidoID, status: 'pago' });
    }
  );
});
