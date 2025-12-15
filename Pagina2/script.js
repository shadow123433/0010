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
const produtosPadrao = [
  { nome: "Camisa escolar masculino", preco: 49.9, tamanhos: ["P", "M", "G", "GG"] },
  { nome: "Short escolar masculino", preco: 79.9, tamanhos: ["P", "M", "G", "GG"] },
  { nome: "Camisa escolar feminina", preco: 129.9, tamanhos: ["P", "M", "G", "GG"] },
  { nome: "Calça escolar feminina", preco: 89.9, tamanhos: ["P", "M", "G", "GG"] }
];

/* =========================
   SEÇÃO PRODUTOS
========================= */
const produtosSec = document.createElement("section");
produtosSec.className = "produtos";
produtosSec.style.display = "none";
produtosSec.innerHTML = `
  <h2>Uniformes disponíveis</h2>
  <div class="produtos-grid"></div>
  <button class="botao-secundario" id="fecharProdutos">Voltar</button>
`;

container.insertBefore(produtosSec, document.querySelector(".carrinho"));
const produtosGrid = produtosSec.querySelector(".produtos-grid");

function mostrarProdutos(escola) {
  produtosGrid.innerHTML = "";

  produtosPadrao.forEach(produto => {
    const card = document.createElement("div");
    card.className = "produto-card";

    card.innerHTML = `
      <strong>${produto.nome}</strong>
      <small>${escola}</small>

      <select>
        <option value="">Selecione o tamanho</option>
        ${produto.tamanhos.map(t => `<option value="${t}">${t}</option>`).join("")}
      </select>

      <div class="preco">R$ ${produto.preco.toFixed(2)}</div>

      <button class="botao-primario">Adicionar</button>
    `;

    card.querySelector("button").onclick = () => {
      const tamanho = card.querySelector("select").value;
      if (!tamanho) return showToast("Selecione um tamanho");

      addCarrinho(
        `${produto.nome} (${escola}) - Tam: ${tamanho}`,
        produto.preco
      );
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
   MODAL DE CONFIRMAÇÃO
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
    const escola = btn.previousElementSibling.textContent;
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

  if (!nome || !whats || !endereco || !numero)
    return showToast("Preencha os campos obrigatórios");

  console.log({
    cliente: { nome, whats, endereco, numero },
    carrinho,
    total
  });

  carrinho = [];
  total = 0;
  atualizarCarrinho();
  modal.style.display = "none";
  showToast("Pedido confirmado com sucesso");
};
