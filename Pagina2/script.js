const API_URL = "http://localhost:3000"; // define pra onde vão as requisições fethch

function getToken() {
  return localStorage.getItem("token");
}

function setToken(token) {
  localStorage.setItem("token", token);
}

function logout() {
  localStorage.removeItem("token");
  location.reload();
}

function isLogged() {
  return !!getToken();
}
// guarda o token enviado pelo backend após login bem-sucedido


/* =========================
   ESTADO GLOBAL
========================= */
window.carrinho = [];
window.total = 0;

function gerarPedidoID() {
  return "PED-" + Date.now().toString().slice(-6);
}

/* =========================
   ELEMENTOS FIXOS
========================= */
const container = document.querySelector(".container");
const finalizarBtn = document.querySelector(".finalizar");
const botoesEscola = document.querySelectorAll(".escola-card button");
const secaoEscolas = document.querySelector(".escolas");
const pedidoForm = document.getElementById("pedido-form");
const pedidoLoading = document.getElementById("pedido-loading");
const pedidoConfirmado = document.getElementById("pedido-confirmado");
const pedidoIdSpan = document.getElementById("pedidoId");

/* =========================
   VARIÁVEIS DO CARRINHO
========================= */
const carrinhoContainer = document.getElementById("carrinhoContainer");
const totalValor = document.getElementById("totalValor");

/* =========================
   TOAST
========================= */
const toast = document.createElement("div");
toast.className = "toast";
document.body.appendChild(toast);

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

/* =========================
   PRODUTOS
========================= */
const produtosPorEscola = {
  IFES: [
    {
      id: "camisa_ifes",
      nome: "Camisa masculina e feminina IFES",
      preco: 49.9,
      tamanhos: ["P","M","G","GG"],
      imagem: "../imagemIFES/camisa.png"
    },
    {
      id: "bermuda_ifes",
      nome: "Bermuda masculina IFES",
      preco: 79.9,
      tamanhos: ["P","M","G","GG"],
      imagem: "../imagemIFES/bermuda.png"
    },
    {
      id: "calca_ifes",
      nome: "Calça feminina IFES",
      preco: 89.9,
      tamanhos: ["P","M","G","GG"],
      imagem: "../imagemIFES/calçaa.png"
    }
  ],

  SESI: [
    {
      id: "camisa_sesi",
      nome: "Camisa masculina e feminina SESI",
      preco: 59.9,
      tamanhos: ["P","M","G","GG"],
      imagem: "../imagemSESI/camisa.png"
    },
    {
      id: "bermuda_sesi",
      nome: "Bermuda masculina SESI",
      preco: 84.9,
      tamanhos: ["P","M","G","GG"],
      imagem: "../imagemSESI/calção.png"
    },
    {
      id: "calca_sesi",
      nome: "Calça feminina SESI",
      preco: 84.9,
      tamanhos: ["P","M","G","GG"],
      imagem: "../imagemSESI/calça.png"
    }
  ],

  "CRISTO REI": [
    {
      id: "camisa_cristorei",
      nome: "Camisa masculina e feminina CRISTO REI",
      preco: 54.9,
      tamanhos: ["P","M","G","GG"],
      imagem: "../imagemCRISTOREI/camisa.png"
    },
    {
      id: "bermuda_cristorei",
      nome: "Bermuda masculina CRISTO REI",
      preco: 92.9,
      tamanhos: ["P","M","G","GG"],
      imagem: "../imagemCRISTOREI/bermuda.png"
    },
    {
      id: "calca_cristorei",
      nome: "Calça feminina CRISTO REI",
      preco: 92.9,
      tamanhos: ["P","M","G","GG"],
      imagem: "../imagemCRISTOREI/calça.png"
    }
  ]
};

/* =========================
   SEÇÃO PRODUTOS
========================= */
const produtosSec = document.createElement("section");
produtosSec.className = "produtos";
produtosSec.id = "secao-produtos";
produtosSec.style.display = "none";
produtosSec.innerHTML = `
  <h2>Uniformes disponíveis</h2>
  <div class="produtos-grid"></div>
  <button class="botao-voltar" id="fecharProdutos">← Voltar para escolas</button>
`;
container.insertBefore(produtosSec, document.querySelector(".carrinho"));
const produtosGrid = produtosSec.querySelector(".produtos-grid");

/* =========================
   LIGHTBOX
========================= */
const lightbox = document.createElement("div");
lightbox.className = "lightbox-overlay";
lightbox.innerHTML = `<span class="fechar-lightbox">✖</span><img src="">`;
document.body.appendChild(lightbox);
const lightboxImg = lightbox.querySelector("img");
const fecharLightbox = lightbox.querySelector(".fechar-lightbox");

/* =========================
   MOSTRAR PRODUTOS
========================= */
function mostrarProdutos(escola) {
  produtosGrid.innerHTML = "";

  produtosPorEscola[escola].forEach(produto => {
    const card = document.createElement("div");
    card.className = "produto-card";
    card.innerHTML = `
      <img src="${produto.imagem}" class="produto-img">
      <strong>${produto.nome}</strong>
      <select>
        <option value="">Tamanhos</option>
        ${produto.tamanhos.map(t => `<option>${t}</option>`).join("")}
      </select>
      <div class="preco">R$ ${produto.preco.toFixed(2)}</div>
      <button>Adicionar</button>
    `;

    card.querySelector("img").onclick = () => {
      lightboxImg.src = produto.imagem;
      lightbox.style.display = "flex";
      document.body.style.overflow = "hidden";
      resetLightbox();
    };

    card.querySelector("button").onclick = () => {
      const select = card.querySelector("select");
      const tamanho = select.value;

      if (!tamanho) {
        abrirModal("Selecione um tamanho");
        select.classList.add("tamanho-destaque");
        setTimeout(() => select.classList.remove("tamanho-destaque"), 3000);
        return;
      }
      
addCarrinho(produto.id, tamanho, produto.preco);

    };

    produtosGrid.appendChild(card);
  });

  secaoEscolas.style.display = "none";
  produtosSec.style.display = "block";
  produtosSec.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* =========================
   CARRINHO
========================= */
function addCarrinho(produto, tamanho, preco) {
  let item = window.carrinho.find(i => i.produto === produto);

  if (!item) {
    item = { produto, tamanhos: {}, precoUnitario: preco };
    window.carrinho.push(item);
  }

  item.tamanhos[tamanho] = (item.tamanhos[tamanho] || 0) + 1;
  window.total += preco;

  atualizarCarrinho();
  abrirModal("Este item foi adicionado ao carrinho");
}

function atualizarCarrinho() {
  carrinhoContainer.innerHTML = "";

  window.carrinho.forEach(item => {
    Object.entries(item.tamanhos).forEach(([tamanho, qtd]) => {
      const linha = document.createElement("div");
      linha.className = "linha-carrinho";
      linha.innerHTML = `
  <span>• ${item.produto} (${tamanho} × ${qtd})</span>
  <button class="btn-remover" data-produto="${item.produto}" data-tamanho="${tamanho}">✖</button>
`;
      carrinhoContainer.appendChild(linha);
    });
  });

  document.querySelectorAll(".btn-remover").forEach(btn => {
    btn.onclick = e => removerItem(e.target.dataset.produto, e.target.dataset.tamanho);
  });

  totalValor.textContent = window.total.toFixed(2);
}

/* =========================
   REMOVER ITEM
========================= */
function removerItem(produto, tamanho) {
  const itemIndex = window.carrinho.findIndex(i => i.produto === produto);
  if (itemIndex === -1) return;

  const item = window.carrinho[itemIndex];
  if (!item.tamanhos[tamanho]) return;

  item.tamanhos[tamanho]--;
  window.total -= item.precoUnitario;

  if (item.tamanhos[tamanho] === 0) delete item.tamanhos[tamanho];
  if (!Object.keys(item.tamanhos).length) window.carrinho.splice(itemIndex, 1);

  atualizarCarrinho();
  abrirModal("Este item foi removido do carrinho");
}

/* =========================
   MODAL PEDIDO
========================= */
const modal = document.createElement("div");
modal.className = "modal-overlay";
modal.style.display = "none";
modal.innerHTML = `
  <div class="modal">
    <h2>Confirmação de entrega</h2>
    <input id="nome" placeholder="Nome completo">
    <input id="endereco" placeholder="Rua / Avenida">
    <input
  id="numero"
  placeholder="Número da casa"
  oninput="this.value = this.value.replace(/[^0-9]/g, '')">

    <input id="referencia" placeholder="Ponto de referência">
    <div>
      <button id="cancelar">Cancelar pedido</button>
      <button id="confirmar">Enviar pedido</button>
    </div>
  </div>
`;
document.body.appendChild(modal);

/* =========================
   FINALIZAR PEDIDO
========================= */
finalizarBtn.onclick = () => {
  // Verifica se o usuário está logado
  if (!isLogged()) {

    // Mostra alerta
    abrirModal("Faça login👤 para prosseguir com o pedido.");

    // 🔴 BOTÃO DE LOGIN DO MENU FLUTUANTE
    const btnLoginMenu = document.getElementById("btnLoginMenu");

    if (btnLoginMenu) {
      btnLoginMenu.classList.add("pulsar-login");

      // remove a animação após 3 segundos
      setTimeout(() => {
        btnLoginMenu.classList.remove("pulsar-login");
      }, 3000);
    }

    return; // bloqueia finalização
  }

  // Verifica se o carrinho está vazio
  if (!window.carrinho || window.carrinho.length === 0) {
    abrirModal("Carrinho vazio");
    return;
  }

  // Abre modal normalmente
  modal.style.display = "flex";
};





modal.querySelector("#cancelar").onclick = () => modal.style.display = "none";

modal.querySelector("#confirmar").onclick = () => {
const nome = document.getElementById("nome").value.trim();
const endereco = document.getElementById("endereco").value.trim();
const numero = document.getElementById("numero").value.trim();
const referencia = document.getElementById("referencia").value.trim();
const pedidoID = gerarPedidoID();

  if (!nome || !endereco || !numero) return showToast("Preencha os campos obrigatórios");

const totalCalculado = window.carrinho.reduce((acc, item) => {
  return acc + Object.values(item.tamanhos).reduce((sum, qtd) => sum + qtd * item.precoUnitario, 0);
}, 0);

const pedido = {
  tipo: "PEDIDO",
  pedidoID,
  nome,
  endereco,
  numeroCasa: numero,
  referencia,
  itens: window.carrinho,
  total: totalCalculado,
  data: new Date().toISOString()
};

modal.style.display = "none";
pedidoForm.style.display = "none";
pedidoLoading.style.display = "block";

// Cria modal de confirmação se ainda não existir
let pedidoModalConfirmacao = document.getElementById("pedido-modal-confirmacao");
if (!pedidoModalConfirmacao) {
  pedidoModalConfirmacao = document.createElement("div");
  pedidoModalConfirmacao.id = "pedido-modal-confirmacao";
  pedidoModalConfirmacao.className = "modal-overlay";
  pedidoModalConfirmacao.style.display = "none";
  pedidoModalConfirmacao.innerHTML = `
    <div class="modal">
      <h2>Pedido confirmado ✅</h2>
      <p>Número do pedido: <strong id="pedidoIdModal"></strong></p>
      <p>Status: <strong>Recebido</strong></p>
      <p>Seu pedido foi recebido pela loja e está sendo processado.</p>
      <button id="fecharPedidoModal">Fechar</button>
    </div>
  `;
  container.insertBefore(pedidoModalConfirmacao, pedidoForm);
}

const pedidoIdModal = document.getElementById("pedidoIdModal");
const fecharPedidoModal = document.getElementById("fecharPedidoModal");

fetch(API_URL + "/pedidos", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + getToken()
  },
  body: JSON.stringify(pedido)
})
// chama o node backend/server.js, envia json, cria pedido no banco de dados

  .then(res => {

    if (res.status === 401) {
      abrirModal("Sessão expirada. Faça login novamente.");
      logout();
      return;
    }

    return res.json();
  }) // caso o backend negar a requisição por token inválido, força logout/novo login

.then(() => {
  pedidoLoading.style.display = "none";

  // 🔴 MOSTRA BADGE IMEDIATAMENTE
  localStorage.setItem("pedidosBadge", "1");

  pedidoIdModal.textContent = pedidoID;
  pedidoModalConfirmacao.style.display = "flex";

  sessionStorage.setItem(
    "pedidoConfirmado",
    JSON.stringify({ pedidoID })
  );
})


  .catch(() => abrirModal("Erro ao conectar com o servidor"));

fecharPedidoModal.onclick = () => {
  // Fecha modal
  pedidoModalConfirmacao.style.display = "none";

  // Zera carrinho e total
  window.carrinho = [];
  window.total = 0;

  atualizarCarrinho();

  // Restaura tela inicial
  pedidoForm.style.display = "block";
  pedidoLoading.style.display = "none";

  // REMOVE DEFINITIVAMENTE O PEDIDO SALVO
  sessionStorage.removeItem("pedidoConfirmado");

  // Limpa inputs
  document.getElementById("nome").value = "";
  document.getElementById("endereco").value = "";
  document.getElementById("numero").value = "";
  document.getElementById("referencia").value = "";
};


};
document.addEventListener("DOMContentLoaded", () => {

  if (!isLogged()) return;

  const pedidoSalvo = sessionStorage.getItem("pedidoConfirmado");
  if (!pedidoSalvo) return;

  const { pedidoID } = JSON.parse(pedidoSalvo);

  pedidoForm.style.display = "none";
  pedidoLoading.style.display = "none";
  pedidoModalConfirmacao.style.display = "flex";
  document.getElementById("pedidoIdModal").textContent = pedidoID;
});





/* =========================
   EVENTOS FINAIS
========================= */
botoesEscola.forEach(btn => btn.onclick = () => mostrarProdutos(btn.dataset.escola));
document.getElementById("fecharProdutos").onclick = () => {
  produtosSec.style.display = "none";
  secaoEscolas.style.display = "block";
};
fecharLightbox.onclick = () => {
  lightbox.style.display = "none";
  document.body.style.overflow = "auto";
};

/* =========================
   ZOOM POR REGIÃO (IMAGEM FIXA)
========================= */
let scale = 1;
let lastDistance = null;
let originLocked = false;
let currentX = 0;
let currentY = 0;

lightboxImg.style.transition = "transform 0.12s linear";
lightboxImg.style.transformOrigin = "center center";
lightboxImg.style.touchAction = "none";

function resetLightbox() {
  scale = 1;
  originLocked = false;
  currentX = 0;
  currentY = 0;
  lightboxImg.style.transformOrigin = "center center";
  lightboxImg.style.transform = "translate(0px,0px) scale(1)";
}

lightboxImg.addEventListener("load", resetLightbox);

// Zoom com scroll (mouse)
lightboxImg.addEventListener("wheel", (e) => {
  e.preventDefault();

  if (!originLocked) {
    const rect = lightboxImg.getBoundingClientRect();
    const originX = ((e.clientX - rect.left) / rect.width) * 100;
    const originY = ((e.clientY - rect.top) / rect.height) * 100;
    lightboxImg.style.transformOrigin = `${originX}% ${originY}%`;
    originLocked = true;
  }

  scale += e.deltaY * -0.004;
  scale = Math.min(Math.max(1, scale), 4);
  lightboxImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
}, { passive: false });

// Zoom com toque (pinch)
lightboxImg.addEventListener("touchstart", (e) => {
  if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    lastDistance = Math.hypot(dx, dy);

    if (!originLocked) {
      const rect = lightboxImg.getBoundingClientRect();
      const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const originX = ((centerX - rect.left) / rect.width) * 100;
      const originY = ((centerY - rect.top) / rect.height) * 100;
      lightboxImg.style.transformOrigin = `${originX}% ${originY}%`;
      originLocked = true;
    }
  }
}, { passive: false });

lightboxImg.addEventListener("touchmove", (e) => {
  if (e.touches.length === 2 && lastDistance) {
    e.preventDefault();

    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const distance = Math.hypot(dx, dy);

    scale += (distance - lastDistance) * 0.01;
    scale = Math.min(Math.max(1, scale), 4);
    lightboxImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;

    lastDistance = distance;
  }
}, { passive: false });

lightboxImg.addEventListener("touchend", () => {
  lastDistance = null;
});


document.addEventListener("DOMContentLoaded", () => {

  const btnPerfil = document.getElementById("btnPerfil");
  const btnPedidos = document.getElementById("btnPedidos");
  const dropdown = document.getElementById("userDropdown");
  const userNome = document.getElementById("userNome");
  const btnLogout = document.getElementById("btnLogout");

  if (!btnPerfil || !dropdown) {
    console.error("Elementos do menu não encontrados");
    return;
  }

 function atualizarUI() {
    const token = getToken();

    const btnPedidosMenu = document.getElementById('btnPedidosMenu');
    const btnLoginMenu = document.getElementById('btnLoginMenu');
    const btnLogoutMenu = document.getElementById('btnLogoutMenu');
    const badge = btnPedidosMenu.querySelector(".badge-pedidos");
    const mostrarBadge = localStorage.getItem("pedidosBadge");

    if (token) {
        btnPedidosMenu.style.display = "flex";
        btnLogoutMenu.style.display = "flex";
        btnLoginMenu.style.display = "none";

        if (mostrarBadge === "1") {
            badge.textContent = "1";
            badge.style.display = "block";
        } else {
            badge.style.display = "none";
        }
    } else {
        btnPedidosMenu.style.display = "none";
        btnLogoutMenu.style.display = "none";
        btnLoginMenu.style.display = "flex";
        if (badge) badge.style.display = "none";
    }
}

document.getElementById("btnLogoutMenu").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("pedidosBadge");
    atualizarUI();
});



  atualizarUI();

  btnPerfil.addEventListener("click", (e) => {
    e.stopPropagation();

    if (!getToken()) {
      sessionStorage.setItem("redirectAfterLogin", "../Pagina2/index2.html");
      window.location.href = "../login-usuarios/login.html"; // redireciona para login
      return;
    }

    dropdown.classList.toggle("open");
  });

 btnPedidos.addEventListener("click", () => {

  // 🔴 REMOVE NOTIFICAÇÃO
localStorage.removeItem("pedidosBadge"); // 👈 CERTO

  const badge = document.getElementById("badgePedidos");
  if (badge) badge.style.display = "none";

  window.location.href = "../login-usuarios/meus-pedidos.html";
});


btnLogout.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("pedidosCount"); // 👈 LIMPA CONTADOR

  // 🔴 Fecha o dropdown imediatamente
  const dropdown = document.getElementById("userDropdown");
  if (dropdown) dropdown.classList.remove("open");

  atualizarUI();
});



  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && e.target !== btnPerfil) {
      dropdown.classList.remove("open");
    }
  });

});


/* =========================
   BONECO MENU LOGIN/PEDIDOS/Sair
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const btnPedidosMenu = document.getElementById("btnPedidosMenu");
  const btnLoginMenu = document.getElementById("btnLoginMenu");
  const btnLogoutMenu = document.getElementById("btnLogoutMenu");
  const badge = btnPedidosMenu.querySelector(".badge-pedidos");

  // Função fictícia para obter token (substituir pela sua lógica real)
  function getToken() {
    return localStorage.getItem("token");
  }

  // Atualiza a interface conforme autenticação
  function atualizarUI() {
    if (getToken()) {
      btnLoginMenu.style.display = "none";          // esconde login
      btnPedidosMenu.style.display = "flex";        // mostra pedidos
      btnLogoutMenu.style.display = "flex";         // mostra logout

      const mostrarBadge = localStorage.getItem("pedidosBadge");
      if (mostrarBadge === "1") {
        badge.textContent = "1";
        badge.style.display = "block";
      } else {
        badge.style.display = "none";
      }
    } else {
      btnLoginMenu.style.display = "flex";          // mostra login
      btnPedidosMenu.style.display = "none";        // esconde pedidos
      btnLogoutMenu.style.display = "none";         // esconde logout
      badge.style.display = "none";
    }
  }

  atualizarUI();

  // Botão login
  btnLoginMenu.addEventListener("click", () => {
    window.location.href = "../login-usuarios/login.html";
  });

  // Botão pedidos
  btnPedidosMenu.addEventListener("click", () => {
    localStorage.removeItem("pedidosBadge");
    atualizarUI();
    window.location.href = "../login-usuarios/meus-pedidos.html";
  });

  // Botão sair
  btnLogoutMenu.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("pedidosBadge");
    atualizarUI();
  });
});


function abrirModal(mensagem) {
  document.getElementById("modalMessage").innerText = mensagem;
  document.getElementById("modalOverlay").style.display = "flex";
}

function fecharModal() {
  document.getElementById("modalOverlay").style.display = "none";
}