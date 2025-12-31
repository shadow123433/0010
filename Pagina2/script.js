/* =========================
   ESTADO GLOBAL
========================= */
let carrinho = [];
let total = 0;

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
    { nome: "Camisa masculina IFES", preco: 49.9, tamanhos: ["P","M","G","GG"], imagem: "../imagemIFES/camisa.avif" },
    { nome: "Short masculino IFES", preco: 79.9, tamanhos: ["P","M","G","GG"], imagem: "../imagemIFES/bermuda.avif" },
    { nome: "Camisa feminina IFES", preco: 129.9, tamanhos: ["P","M","G","GG"], imagem: "../imagemIFES/camisaF.webp" },
    { nome: "Calça feminina IFES", preco: 89.9, tamanhos: ["P","M","G","GG"], imagem: "../imagemIFES/calça.png" }
  ],
  SESI: [
    { nome: "Camisa masculina SESI", preco: 59.9, tamanhos: ["P","M","G","GG"], imagem: "../imagemSESI/camisa.jpg" },
    { nome: "Bermuda SESI", preco: 84.9, tamanhos: ["P","M","G","GG"], imagem: "../imagemSESI/bermuda.jpg" },
    { nome: "Camisa feminina SESI", preco: 59.9, tamanhos: ["P","M","G","GG"], imagem: "../imagemSESI/camisaF.jpg" },
    { nome: "Calça feminina SESI", preco: 84.9, tamanhos: ["P","M","G","GG"], imagem: "../imagemSESI/calça.webp" }
  ],
  "CRISTO REI": [
    { nome: "Camisa masculina CRISTO REI", preco: 54.9, tamanhos: ["P","M","G","GG"], imagem: "../imagemCRISTOREI/camisa.jpg" },
    { nome: "Bermuda masculina CRISTO REI", preco: 92.9, tamanhos: ["P","M","G","GG"], imagem: "../imagemCRISTOREI/camisa.jpg" },
    { nome: "Camisa feminina CRISTO REI", preco: 54.9, tamanhos: ["P","M","G","GG"], imagem: "../imagemCRISTOREI/camisa.jpg" },
    { nome: "Calça feminina CRISTO REI", preco: 92.9, tamanhos: ["P","M","G","GG"], imagem: "../imagemCRISTOREI/calça.webp" }
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
      document.body.style.overflow = "hidden"; // bloqueia scroll
      lightboxImg.classList.add("zoom");
      lightboxImg.style.transform = "translate(0px,0px) scale(1)";
      scale = 1;
      currentX = 0;
      currentY = 0;
    };

    card.querySelector("button").onclick = () => {
      const tamanho = card.querySelector("select").value;
      if (!tamanho) return showToast("Selecione um tamanho");
      addCarrinho(`${produto.nome} - Tam: ${tamanho}`, produto.preco);
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
function addCarrinho(nome, preco) {
  carrinho.push({ nome, preco });
  total += preco;
  atualizarCarrinho();
  showToast("Item adicionado");
}

function atualizarCarrinho() {
  if (!carrinho.length) {
    carrinhoTexto.innerHTML = "Nenhum item adicionado.";
    totalTexto.innerHTML = `<strong>Total:</strong> R$ 0,00`;
    return;
  }

  carrinhoTexto.innerHTML = carrinho
    .map((item, index) => `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <span>• ${item.nome}</span>
        <span
          style="color:red; cursor:pointer; font-weight:bold;"
          onclick="removerItem(${index})"
        >✖</span>
      </div>
    `)
    .join("");

  totalTexto.innerHTML = `<strong>Total:</strong> R$ ${total.toFixed(2)}`;
}

/* =========================
   REMOVER ITEM
========================= */
function removerItem(index) {
  total -= carrinho[index].preco;
  carrinho.splice(index, 1);
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

  if (!nome || !whats || !endereco || !numero)
    return showToast("Preencha os campos obrigatórios");

  const itens = carrinho.map(i => `- ${i.nome}`).join("\n");

  const mensagem = `
*NOVO PEDIDO DE UNIFORME*

Nome: ${nome}
WhatsApp: ${whats}

Endereço:
${endereco}, Nº ${numero}
${referencia ? "Ref: " + referencia : ""}

Itens:
${itens}

Total: R$ ${total.toFixed(2)}
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
  lightboxImg.classList.remove("zoom");
  lightboxImg.style.transform = "translate(0px,0px) scale(1)";
  scale = 1;
  currentX = 0;
  currentY = 0;
  lastTouchDistance = null;
};



/* =========================
   ZOOM PROFISSIONAL NA IMAGEM
========================= */
let scale = 1;
let currentX = 0, currentY = 0;
let originX = 0, originY = 0;
let isDragging = false;
let startX = 0, startY = 0;
let lastTouchDistance = null;

const MIN_SCALE = 1;
const MAX_SCALE = 2.5;

lightboxImg.style.transition = "transform 0.2s ease";

/* -------------------------
   DESKTOP - Zoom com roda
------------------------- */
lightboxImg.addEventListener("wheel", (e) => {
  e.preventDefault();
  const rect = lightboxImg.getBoundingClientRect();
  const offsetX = e.clientX - rect.left;
  const offsetY = e.clientY - rect.top;

  originX = (offsetX / rect.width) * 100;
  originY = (offsetY / rect.height) * 100;

  scale += e.deltaY * -0.0025; // zoom mais responsivo
  scale = Math.min(Math.max(MIN_SCALE, scale), MAX_SCALE);

  lightboxImg.style.transformOrigin = `${originX}% ${originY}%`;
  lightboxImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
});

/* -------------------------
   DESKTOP - Arrastar imagem
------------------------- */
lightboxImg.addEventListener("mousedown", (e) => {
  if (scale <= 1) return;
  isDragging = true;
  startX = e.clientX - currentX;
  startY = e.clientY - currentY;
});
document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  e.preventDefault();

  currentX = e.clientX - startX;
  currentY = e.clientY - startY;

  // limite de arraste
  const rect = lightboxImg.getBoundingClientRect();
  const parentRect = lightbox.getBoundingClientRect();
  const maxX = Math.max((rect.width * scale - parentRect.width) / 2, 0);
  const maxY = Math.max((rect.height * scale - parentRect.height) / 2, 0);

  currentX = Math.min(Math.max(currentX, -maxX), maxX);
  currentY = Math.min(Math.max(currentY, -maxY), maxY);

  lightboxImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
});
document.addEventListener("mouseup", () => isDragging = false);

/* -------------------------
   MOBILE - Pinch Zoom e Arraste
------------------------- */
lightboxImg.addEventListener("touchstart", (e) => {
  if (e.touches.length === 2) {
    e.preventDefault();
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    lastTouchDistance = Math.sqrt(dx*dx + dy*dy);
  } else if (e.touches.length === 1 && scale > 1) {
    isDragging = true;
    startX = e.touches[0].clientX - currentX;
    startY = e.touches[0].clientY - currentY;
  }
});

lightboxImg.addEventListener("touchmove", (e) => {
  if (e.touches.length === 2 && lastTouchDistance) {
    e.preventDefault();
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const distance = Math.sqrt(dx*dx + dy*dy);
    const delta = (distance - lastTouchDistance) * 0.03; // mais responsivo
    scale += delta;
    scale = Math.min(Math.max(MIN_SCALE, scale), MAX_SCALE);

    // atualiza transform com limite de arraste
    const rect = lightboxImg.getBoundingClientRect();
    const parentRect = lightbox.getBoundingClientRect();
    const maxX = Math.max((rect.width * scale - parentRect.width) / 2, 0);
    const maxY = Math.max((rect.height * scale - parentRect.height) / 2, 0);
    currentX = Math.min(Math.max(currentX, -maxX), maxX);
    currentY = Math.min(Math.max(currentY, -maxY), maxY);

    lightboxImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
    lastTouchDistance = distance;
  } else if (e.touches.length === 1 && isDragging) {
    e.preventDefault();
    currentX = e.touches[0].clientX - startX;
    currentY = e.touches[0].clientY - startY;

    const rect = lightboxImg.getBoundingClientRect();
    const parentRect = lightbox.getBoundingClientRect();
    const maxX = Math.max((rect.width * scale - parentRect.width) / 2, 0);
    const maxY = Math.max((rect.height * scale - parentRect.height) / 2, 0);
    currentX = Math.min(Math.max(currentX, -maxX), maxX);
    currentY = Math.min(Math.max(currentY, -maxY), maxY);

    lightboxImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
  }
}, { passive: false });

lightboxImg.addEventListener("touchend", (e) => {
  if (e.touches.length < 2) lastTouchDistance = null;
  if (e.touches.length === 0) isDragging = false;
});
