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
    { nome: "Camisa masculina IFES", preco: 49.9, tamanhos: ["P", "M", "G", "GG"], imagem: "/imagemIFES/camisa.avif" },
    { nome: "Short masculino IFES", preco: 79.9, tamanhos: ["P", "M", "G", "GG"], imagem: "/imagemIFES/bermuda.avif" },
    { nome: "Camisa feminina IFES", preco: 129.9, tamanhos: ["P", "M", "G", "GG"], imagem: "/imagemIFES/camisaF.webp" },
    { nome: "Calça feminina IFES", preco: 89.9, tamanhos: ["P", "M", "G", "GG"], imagem: "/imagemIFES/calça.png" }
  ],
  SESI: [
    { nome: "Camisa masculina SESI", preco: 59.9, tamanhos: ["P", "M", "G", "GG"], imagem: "/imagemSESI/camisa.jpg" },
    { nome: "Bermuda SESI", preco: 84.9, tamanhos: ["P", "M", "G", "GG"], imagem: "/imagemSESI/bermuda.jpg" },
    { nome: "Camisa feminina SESI", preco: 59.9, tamanhos: ["P", "M", "G", "GG"], imagem: "/imagemSESI/camisaF.jpg" },
    { nome: "Calça feminina SESI", preco: 84.9, tamanhos: ["P", "M", "G", "GG"], imagem: "/imagemSESI/calça.webp" }
  ],
  "CRISTO REI": [
    { nome: "Camisa masculina CRISTO REI", preco: 54.9, tamanhos: ["P", "M", "G", "GG"], imagem: "/imagemCRISTOREI/camisa.jpg" },
    { nome: "Bermuda masculina CRISTO REI", preco: 92.9, tamanhos: ["P", "M", "G", "GG"], imagem: "/imagemCRISTOREI/camisa.jpg" },
    { nome: "Camisa feminina CRISTO REI", preco: 54.9, tamanhos: ["P", "M", "G", "GG"], imagem: "/imagemCRISTOREI/camisa.jpg" },
    { nome: "Calça feminina CRISTO REI", preco: 92.9, tamanhos: ["P", "M", "G", "GG"], imagem: "/imagemCRISTOREI/calça.webp" }
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

// Lightbox
const lightbox = document.createElement("div");
lightbox.id = "lightbox";
lightbox.className = "lightbox-overlay";
lightbox.innerHTML = `<img src="" alt="Uniforme em tela cheia">`;
document.body.appendChild(lightbox);
const lightboxImg = lightbox.querySelector("img");

function mostrarProdutos(escola) {
  produtosGrid.innerHTML = "";

  const produtos = produtosPorEscola[escola];
  if (!produtos) return showToast("Produtos não encontrados para esta escola");

  produtos.forEach(produto => {
    const card = document.createElement("div");
    card.className = "produto-card";

    card.innerHTML = `
      <img src="${produto.imagem}" class="produto-img">
      <strong>${produto.nome}</strong>
      <select>
        <option value="">Selecione o tamanho</option>
        ${produto.tamanhos.map(t => `<option value="${t}">${t}</option>`).join("")}
      </select>
      <div class="preco">R$ ${produto.preco.toFixed(2)}</div>
      <button class="botao-primario">Adicionar</button>
    `;

    // Clique na imagem abre em tela cheia
    const img = card.querySelector(".produto-img");
    img.onclick = () => {
      lightboxImg.src = img.src;
      lightbox.style.display = "flex";
    };

    // Adicionar ao carrinho
    card.querySelector("button").onclick = () => {
      const tamanho = card.querySelector("select").value;
      if (!tamanho) return showToast("Selecione um tamanho");
      addCarrinho(`${produto.nome} - Tam: ${tamanho}`, produto.preco);
    };

    produtosGrid.appendChild(card);
  });

  produtosSec.style.display = "block";
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
  carrinhoTexto.innerHTML = carrinho.length
    ? carrinho.map(i => `• ${i.nome}`).join("<br>")
    : "Nenhum item adicionado.";
  totalTexto.innerHTML = `<strong>Total:</strong> R$ ${total.toFixed(2)}`;
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
      <button class="botao-secundario" id="cancelar">Cancelar</button>
      <button class="botao-primario" id="confirmar">Confirmar pedido</button>
    </div>
  </div>
`;
document.body.appendChild(modal);

/* =========================
   EVENTOS
========================= */
botoesEscola.forEach(btn => {
  btn.onclick = () => {
    const escola = btn.dataset.escola;
    mostrarProdutos(escola);
  };
});

document.getElementById("fecharProdutos").onclick = () => {
  produtosSec.style.display = "none";
};

finalizarBtn.onclick = () => {
  if (!carrinho.length) return showToast("Carrinho vazio");
  modal.style.display = "flex";
};

modal.querySelector("#cancelar").onclick = () => {
  modal.style.display = "none";
};

modal.querySelector("#confirmar").onclick = () => {
  const nome = modal.querySelector("#nome").value.trim();
  const whats = modal.querySelector("#whats").value.trim();
  const endereco = modal.querySelector("#endereco").value.trim();
  const numero = modal.querySelector("#numero").value.trim();
  const referencia = modal.querySelector("#referencia").value.trim();

  if (!nome || !whats || !endereco || !numero) return showToast("Preencha os campos obrigatórios");

  const itens = carrinho.map(i => `- ${i.nome} (R$ ${i.preco.toFixed(2)})`).join("\n");

  const mensagem = `
*NOVO PEDIDO DE UNIFORME*

Nome: ${nome}
WhatsApp: ${whats}

Endereço:
${endereco}, Nº ${numero}
${referencia ? "📌 Ref: " + referencia : ""}

Itens:
${itens}

Total: R$ ${total.toFixed(2)}
  `.trim();

  const url = `https://wa.me/27998040952?text=${encodeURIComponent(mensagem)}`;

  carrinho = [];
  total = 0;
  atualizarCarrinho();
  modal.style.display = "none";

  window.open(url, "_blank");
};

/* =========================
   LIGHTBOX
========================= */
lightbox.onclick = (e) => {
  if (e.target !== lightboxImg) {
    lightbox.style.display = "none";
    lightboxImg.src = "";
  }
};
