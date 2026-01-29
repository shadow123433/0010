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
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
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

      // salva token e dados do usuário
      setToken(data.token);

      if (data.user) {
        localStorage.setItem("userName", data.user.nome);
        localStorage.setItem("userEmail", data.user.email);
      }

      // redirecionamento pós-login
      const redirect = sessionStorage.getItem("redirectAfterLogin");

      if (redirect) {
        sessionStorage.removeItem("redirectAfterLogin");
        window.location.href = redirect;
      } else {
        window.location.href = "../Pagina2/index2.html";
      }

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

      // salva token e dados do usuário
      setToken(data.token);

      if (data.user) {
        localStorage.setItem("userName", data.user.nome);
        localStorage.setItem("userEmail", data.user.email);
      }

      // redirecionamento pós-cadastro
      const redirect = sessionStorage.getItem("redirectAfterLogin");

      if (redirect) {
        sessionStorage.removeItem("redirectAfterLogin");
        window.location.href = redirect;
      } else {
        window.location.href = "../Pagina2/index2.html";
      }

    } catch (err) {
      alert("Erro ao conectar com o servidor");
      console.error(err);
    }
  });
}
