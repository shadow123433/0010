// js/carrinho.js

// Inicializa o estado global (mantendo o uso do window como no seu original)
window.carrinho = [];
window.total = 0;

export function salvarCarrinho() {
  localStorage.setItem("carrinho", JSON.stringify(window.carrinho));
  localStorage.setItem("total", window.total);
}

// Carrega o carrinho salvo no localStorage, caso exista
export function carregarCarrinho(atualizarCarrinhoUI) { 
  const carrinhoSalvo = localStorage.getItem("carrinho");
  const totalSalvo = localStorage.getItem("total");

  if (carrinhoSalvo) {
    window.carrinho = JSON.parse(carrinhoSalvo);
    window.total = parseFloat(totalSalvo) || 0;
    
    // Chamamos a função de atualizar a tela que passaremos por argumento
    if (atualizarCarrinhoUI) atualizarCarrinhoUI();
  }
}

export function addCarrinho(produtoId, tamanho, preco, atualizarCarrinhoUI, abrirModal) {
  let item = window.carrinho.find(i => i.produto === produtoId);

  if (!item) {
    item = { produto: produtoId, tamanhos: {}, precoUnitario: preco };
    window.carrinho.push(item);
  }

  item.tamanhos[tamanho] = (item.tamanhos[tamanho] || 0) + 1;
  window.total += preco;

  atualizarCarrinhoUI();
  salvarCarrinho();
  abrirModal("Este item foi adicionado ao carrinho");
}

export function removerItem(produtoId, tamanho, atualizarCarrinhoUI, abrirModal) {
  const itemIndex = window.carrinho.findIndex(i => i.produto === produtoId);
  if (itemIndex === -1) return;

  const item = window.carrinho[itemIndex];
  if (!item.tamanhos[tamanho]) return;

  item.tamanhos[tamanho]--;
  window.total -= item.precoUnitario;

  if (item.tamanhos[tamanho] === 0) delete item.tamanhos[tamanho];
  if (!Object.keys(item.tamanhos).length) window.carrinho.splice(itemIndex, 1);

  atualizarCarrinhoUI();
  salvarCarrinho();
  abrirModal("Este item foi removido do carrinho");
}