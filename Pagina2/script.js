/* =========================
   ESTADO GLOBAL
========================= */
let carrinho = [];
let total = 0;

function gerarPedidoID() {
  return "PED-" + Date.now().toString().slice(-6);
}

/* =========================
   ELEMENTOS FIXOS
========================= */
const container = document.querySelector(".container");
const carrinhoTexto = document.querySelector(".carrinho p");
const totalTexto = document.querySelector(".total");
const finalizarBtn = document.querySelector(".finalizar");
const botoesEscola = document.querySelectorAll(".escola-card button");
const secaoEscolas = document.querySelector(".escolas");

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
    { nome: "Camisa masculina e feminina IFES", preco: 49.9, tamanhos: ["P","M","G","GG"], imagem: "../imagemIFES/camisa.png" },
    { nome: "Short masculino IFES", preco: 79.9, tamanhos: ["P","M","G","GG"], imagem: "../imagemIFES/bermuda.png" },
    { nome: "Calça feminina IFES", preco: 89.9, tamanhos: ["P","M","G","GG"], imagem: "../imagemIFES/calçaa.png" }
  ],
  SESI: [
    { nome: "Camisa masculina e feminina SESI", preco: 59.9, tamanhos: ["P","M","G","GG"], imagem: "../imagemSESI/camisa.png" },
    { nome: "Bermuda SESI", preco: 84.9, tamanhos: ["P","M","G","GG"], imagem: "../imagemSESI/calção.png" },
    { nome: "Calça feminina SESI", preco: 84.9, tamanhos: ["P","M","G","GG"], imagem: "../imagemSESI/calça.png" }
  ],
  "CRISTO REI": [
    { nome: "Camisa masculina e feminina CRISTO REI", preco: 54.9, tamanhos: ["P","M","G","GG"], imagem: "../imagemCRISTOREI/camisa.png" },
    { nome: "Bermuda masculina CRISTO REI", preco: 92.9, tamanhos: ["P","M","G","GG"], imagem: "../imagemCRISTOREI/camisa.png" },
    { nome: "Calça feminina CRISTO REI", preco: 92.9, tamanhos: ["P","M","G","GG"], imagem: "../imagemCRISTOREI/calça.png" }
  ]
};

/* =========================
   SEÇÃO PRODUTOS
========================= */
const produtosSec = document.createElement("section");
produtosSec.className = "produtos";
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
        <option value="">Selecione o tamanho</option>
        ${produto.tamanhos.map(t => `<option>${t}</option>`).join("")}
      </select>
      <div class="preco">R$ ${produto.preco.toFixed(2)}</div>
      <button>Adicionar</button>
    `;

    card.querySelector("img").onclick = () => {
      lightboxImg.src = produto.imagem;
      lightbox.style.display = "flex";
      document.body.style.overflow = "hidden";
      lightboxImg.classList.add("zoom");
      lightboxImg.style.transform = "translate(0px,0px) scale(1)";
      scale = 1;
      currentX = 0;
      currentY = 0;
    };

    card.querySelector("button").onclick = () => {
      const tamanho = card.querySelector("select").value;
      if (!tamanho) return showToast("Selecione um tamanho");
      addCarrinho(produto.nome, tamanho, produto.preco);
    };

    produtosGrid.appendChild(card);
  });

  secaoEscolas.style.display = "none";
  produtosSec.style.display = "block";
  produtosSec.scrollIntoView({ behavior: "smooth", block: "start" });

  produtosSec.classList.add("destaque");
  setTimeout(() => produtosSec.classList.remove("destaque"), 1200);
}

/* =========================
   CARRINHO
========================= */
function addCarrinho(produto, tamanho, preco) {
  let item = carrinho.find(i => i.produto === produto);

  if (!item) {
    item = {
      produto,
      tamanhos: {},
      precoUnitario: preco
    };
    carrinho.push(item);
  }

  item.tamanhos[tamanho] = (item.tamanhos[tamanho] || 0) + 1;
  total += preco;

  atualizarCarrinho();
  showToast("Item adicionado");
}

function atualizarCarrinho() {
  carrinhoContainer.innerHTML = "";

  carrinho.forEach(item => {
    Object.entries(item.tamanhos).forEach(([tamanho, qtd]) => {
      const linha = document.createElement("div");
      linha.className = "linha-carrinho";

      linha.innerHTML = `
        <span>• ${item.produto} (${tamanho} × ${qtd})</span>
        <button 
          class="btn-remover" 
          data-produto="${item.produto}" 
          data-tamanho="${tamanho}"
        >✖</button>
      `;

      carrinhoContainer.appendChild(linha);
    });
  });

  document.querySelectorAll(".btn-remover").forEach(btn => {
    btn.onclick = e => {
      removerItem(
        e.target.dataset.produto,
        e.target.dataset.tamanho
      );
    };
  });

  totalValor.textContent = total.toFixed(2);
}

/* =========================
   REMOVER ITEM
========================= */
function removerItem(produto, tamanho) {
  const itemIndex = carrinho.findIndex(i => i.produto === produto);
  if (itemIndex === -1) return;

  const item = carrinho[itemIndex];

  if (!item.tamanhos[tamanho]) return;

  item.tamanhos[tamanho]--;
  total -= item.precoUnitario;

  if (item.tamanhos[tamanho] === 0) {
    delete item.tamanhos[tamanho];
  }

  if (Object.keys(item.tamanhos).length === 0) {
    carrinho.splice(itemIndex, 1);
  }

  atualizarCarrinho();
  showToast("Item removido");
}

/* =========================
   MODAL
========================= */
const modal = document.createElement("div");
modal.className = "modal-overlay";
modal.style.display = "none";
modal.innerHTML = `
  <div class="modal">
    <h2>Confirmação de entrega</h2>
    <input id="nome" placeholder="Nome completo">
    <input id="whats" placeholder="WhatsApp">
    <input id="endereco" placeholder="Rua / Avenida">
    <input id="numero" placeholder="Número da casa">
    <input id="referencia" placeholder="Ponto de referência">
    <div>
      <button id="cancelar">Cancelar</button>
      <button id="confirmar">Confirmar pedido</button>
    </div>
  </div>
`;
document.body.appendChild(modal);

/* =========================
   EVENTOS
========================= */
botoesEscola.forEach(btn => {
  btn.onclick = () => mostrarProdutos(btn.dataset.escola);
});

document.getElementById("fecharProdutos").onclick = () => {
  produtosSec.style.display = "none";
  secaoEscolas.style.display = "block";
};

finalizarBtn.onclick = () => {
  if (!carrinho.length) return showToast("Carrinho vazio");
  modal.style.display = "flex";
};

modal.querySelector("#cancelar").onclick = () => modal.style.display = "none";

modal.querySelector("#confirmar").onclick = () => {
  const nome = modal.querySelector("#nome").value;
  const whats = modal.querySelector("#whats").value;
  const endereco = modal.querySelector("#endereco").value;
  const numero = modal.querySelector("#numero").value;
  const referencia = modal.querySelector("#referencia").value;
  const pedidoID = gerarPedidoID(); 

  if (!nome || !whats || !endereco || !numero)
    return showToast("Preencha os campos obrigatórios");

 const itens = carrinho.map(i => {
  return Object.entries(i.tamanhos)
    .map(([tamanho, qtd]) => `- ${i.produto} (${tamanho} × ${qtd})`)
    .join("\n");
}).join("\n");


  const mensagem = `
*NOVO PEDIDO DE UNIFORME*
Pedido: ${pedidoID}

Nome: ${nome}
WhatsApp: ${whats}

Endereço:
${endereco}, Nº ${numero}
${referencia ? "Ref: " + referencia : ""}

Itens:
${itens}

 ⚠️O valor será confirmado pela loja
`.trim();

  window.open(
    `https://wa.me/27998040952?text=${encodeURIComponent(mensagem)}`,
    "_blank"
  );

  carrinho = [];
  total = 0;
  atualizarCarrinho();
  modal.style.display = "none";
};

/* =========================
   FECHAR LIGHTBOX
========================= */
fecharLightbox.onclick = () => {
  lightbox.style.display = "none";
  document.body.style.overflow = "auto";
  lightboxImg.style.transform = "scale(1)";
  scale = 1;
  lastTouchDistance = null;
};

/* =========================
   ZOOM POR REGIÃO (IMAGEM FIXA)
========================= */
const MIN_SCALE = 1;
const MAX_SCALE = 4;

let originLocked = false;

lightboxImg.style.transition = "transform 0.12s linear";
lightboxImg.style.transformOrigin = "center center";
lightboxImg.style.touchAction = "none";

function resetLightbox() {
  scale = 1;
  originLocked = false;
  lightboxImg.style.transformOrigin = "center center";
  lightboxImg.style.transform = "scale(1)";
}
lightboxImg.addEventListener("load", resetLightbox);

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
  scale = Math.min(Math.max(MIN_SCALE, scale), MAX_SCALE);

  lightboxImg.style.transform = `scale(${scale})`;
}, { passive: false });

let lastDistance = null;

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
    scale = Math.min(Math.max(MIN_SCALE, scale), MAX_SCALE);

    lightboxImg.style.transform = `scale(${scale})`;
    lastDistance = distance;
  }
}, { passive: false });

lightboxImg.addEventListener("touchend", () => {
  lastDistance = null;
});
