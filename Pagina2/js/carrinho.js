let carrinho = [];

export function carregarCarrinho() {
  const dados = localStorage.getItem("carrinho");
  if (dados) {
    carrinho = JSON.parse(dados);
  }
}

function salvarCarrinho() {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

export function addCarrinho(produto) {
  carrinho.push(produto);
  salvarCarrinho();
}

export function removerItem(index) {
  carrinho.splice(index, 1);
  salvarCarrinho();
}

export function getCarrinho() {
  return carrinho;
}