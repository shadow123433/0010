const jwt = require("jsonwebtoken");
const db = require("../database/db"); 


const { JWT_SECRET } = require("../config/env");


function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = header.split(" ")[1];

  try {
    // 1. Tenta decodificar o token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 2. Busca o usuário no banco para garantir que ele ainda existe
    db.get("SELECT id, role FROM users WHERE id = ?", [decoded.id], (err, user) => {
      if (err) {
        console.error("❌ ERRO NO BANCO (auth middleware):", err.message);
        return res.status(500).json({ error: "Erro interno no servidor" });
      }

      if (!user) {
        // Se cair aqui, o token é válido, mas o usuário não existe no banco (provável reset do SQLite)
        console.warn(`⚠️ USUÁRIO NÃO ENCONTRADO: O token pertence ao ID ${decoded.id}, mas esse ID não existe no banco de dados.`);
        return res.status(401).json({ error: "Usuário não encontrado. Tente se cadastrar novamente." });
      }

      // Se tudo estiver certo, logamos o sucesso
      console.log(`✅ AUTENTICADO: Usuário ID ${user.id} passou pelo porteiro.`);
      req.user = user; 
      next();
    });

  } catch (err) {
    // Se cair aqui, a "chave" (JWT_SECRET) está errada ou o token expirou de verdade
    console.error("❌ ERRO NA VERIFICAÇÃO DO TOKEN:", err.message);
    return res.status(401).json({ error: "Sessão expirada ou token inválido." });
  }
}

function onlyAdmin(req, res, next) {  
  if (!req.user || req.user.role !== "admin") { 
    return res.status(403).json({ error: "Acesso negado: Requer privilégios de administrador" });
  }
  next();
}

module.exports = { auth, onlyAdmin };