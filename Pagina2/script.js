// ==========================
// ESTADO DO SISTEMA
// ==========================
let carrinho = [];
let total = 0;

// ==========================
// ELEMENTOS FIXOS
// ==========================
const container = document.querySelector(".container");
const carrinhoTexto = document.querySelector(".carrinho p");
const totalTexto = document.querySelector(".total");
const botaoFinalizar = document.querySelector(".finalizar");
const botoesEscola = document.querySelectorAll(".escola-card button");

// ==========================
// TOAST (MENSAGEM VISUAL)
// ==========================
const toast = document.createElement("div");
toast.className = "toast";
container.appendChild(toast);

function mostrarToast(mensagem) {
    toast.textContent = mensagem;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

// ==========================
// ÁREA DE PRODUTOS
// ==========================
const produtosSection = document.createElement("section");
produtosSection.style.display = "none";
produtosSection.style.marginTop = "40px";

produtosSection.innerHTML = `
    <h2>Uniformes disponíveis</h2>
    <div id="produtos"></div>
    <button class="botao-secundario" id="cancelar">Cancelar</button>
`;

container.insertBefore(produtosSection, document.querySelector(".carrinho"));

const produtosDiv = produtosSection.querySelector("#produtos");
const botaoCancelar = produtosSection.querySelector("#cancelar");

// ==========================
// FUNÇÃO: MOSTRAR UNIFORMES
// ==========================
function mostrarUniformes(escola) {
    produtosDiv.innerHTML = "";

    const produtos = [
        { nome: "Camisa Escolar", preco: 49.9 },
        { nome: "Calça Escolar", preco: 79.9 },
        { nome: "Agasalho Escolar", preco: 129.9 }
    ];

    produtos.forEach(produto => {
        const card = document.createElement("div");
        card.style.border = "1px solid #ddd";
        card.style.padding = "15px";
        card.style.marginBottom = "15px";

        card.innerHTML = `
            <strong>${produto.nome}</strong><br>
            Escola: ${escola}<br>
            Preço: R$ ${produto.preco.toFixed(2)}<br><br>
            <button class="botao-primario">Adicionar ao carrinho</button>
        `;

        card.querySelector("button").addEventListener("click", () => {
            adicionarAoCarrinho(`${produto.nome} - ${escola}`, produto.preco);
        });

        produtosDiv.appendChild(card);
    });

    produtosSection.style.display = "block";
}

// ==========================
// FUNÇÃO: ADICIONAR AO CARRINHO
// ==========================
function adicionarAoCarrinho(nome, preco) {
    carrinho.push({ nome, preco });
    total += preco;

    atualizarCarrinho();
    mostrarToast("Item adicionado ao carrinho");
}

// ==========================
// FUNÇÃO: ATUALIZAR CARRINHO
// ==========================
function atualizarCarrinho() {
    if (carrinho.length === 0) {
        carrinhoTexto.textContent = "Nenhum item adicionado.";
    } else {
        carrinhoTexto.innerHTML = carrinho
            .map(item => `• ${item.nome}`)
            .join("<br>");
    }

    totalTexto.innerHTML = `<strong>Total:</strong> R$ ${total.toFixed(2)}`;
}

// ==========================
// EVENTOS DAS ESCOLAS
// ==========================
botoesEscola.forEach(botao => {
    botao.addEventListener("click", () => {
        const escola = botao.previousElementSibling.textContent;
        mostrarUniformes(escola);
    });
});

// ==========================
// CANCELAR UNIFORMES
// ==========================
botaoCancelar.addEventListener("click", () => {
    produtosSection.style.display = "none";
});

// ==========================
// FINALIZAR PEDIDO
// ==========================
botaoFinalizar.addEventListener("click", () => {
    if (carrinho.length === 0) {
        mostrarToast("Carrinho vazio");
        return;
    }

    carrinho = [];
    total = 0;

    carrinhoTexto.textContent = "Pedido enviado com sucesso";
    totalTexto.innerHTML = `<strong>Total:</strong> R$ 0,00`;

    mostrarToast("Pedido enviado com sucesso");
});
