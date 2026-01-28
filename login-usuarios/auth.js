const API_URL = "http://localhost:3000";

// =====================
// TOKEN
// =====================

function getToken() {
  return localStorage.getItem("token");
}

function setToken(token) {
  localStorage.setItem("token", token);
}

function logout() {
  localStorage.removeItem("token");
  // Redireciona para a página de login
  window.location.href = "login.html";
}

function isLogged() {
  return !!getToken();
}

// =====================
// LOGIN
// =====================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    try {
      const res = await fetch(API_URL + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Erro no login");
        return;
      }

      // Salva token e redireciona para a página inicial
      setToken(data.token);
      window.location.href = "../index.html";
    } catch (err) {
      alert("Erro ao conectar com o servidor");
      console.error(err);
    }
  });
}

// =====================
// REGISTER
// =====================

const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    try {
      const res = await fetch(API_URL + "/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Erro ao cadastrar");
        return;
      }

      // Salva token e redireciona para a página inicial
      setToken(data.token);
      window.location.href = "../index.html";
    } catch (err) {
      alert("Erro ao conectar com o servidor");
      console.error(err);
    }
  });
}

// =====================
// REDIRECIONAMENTO E MENU DINÂMICO
// =====================

// Esta parte será usada na página inicial (index.html) para mostrar "Meus Pedidos" dinamicamente
document.addEventListener("DOMContentLoaded", () => {
  const menu = document.querySelector(".menu-topo ul");

  if (isLogged() && menu) {
    // Evita duplicar o item
    if (!document.getElementById("menuMeusPedidos")) {
      const li = document.createElement("li");
      li.id = "menuMeusPedidos";
      li.innerHTML = `<a href="meus-pedidos.html">Meus Pedidos</a>`;
      menu.appendChild(li);
    }
  }
});
