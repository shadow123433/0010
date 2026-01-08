const btnReserva = document.querySelector('.reservar');
const modalReserva = document.getElementById('modalReserva');
const cancelarReserva = document.getElementById('cancelarReserva');
const confirmarReserva = document.getElementById('confirmarReserva');

btnReserva.onclick = () => {
  if (!carrinho.length) {
    alert('Carrinho vazio. Não é possível reservar.');
    return;
  }
  modalReserva.style.display = 'flex';
};

cancelarReserva.onclick = () => {
  modalReserva.style.display = 'none';
};

confirmarReserva.onclick = () => {
  const nome = document.getElementById('nomeReserva').value.trim();

  if (!nome) {
    alert('Por favor preencha o seu nome completo para continuar com a reserva.');
    return;
  }

  let itensTexto = '';

  carrinho.forEach(item => {
    Object.entries(item.tamanhos).forEach(([tamanho, qtd]) => {
      itensTexto += `- ${item.produto} (${tamanho} × ${qtd})\n`;
    });
  });

  const mensagem = `
*NOVA RESERVA DE UNIFORMES*

Nome: ${nome}


Itens reservados:
${itensTexto}


⚠️ Reserva válida por 24h
⚠️ Retirada na loja
⚠️ O valor será confirmado no momento da retirada
⚠️ Não é necessário escrever nada.
Basta enviar esta mensagem e aguardar a confirmação da loja.
`.trim();

  const numeroLoja = '27998040952'; 
  const url = `https://wa.me/${numeroLoja}?text=${encodeURIComponent(mensagem)}`;

 window.open(url, '_blank');

// LIMPA O CARRINHO APÓS RESERVA
carrinho = [];
total = 0;
atualizarCarrinho();

modalReserva.style.display = 'none';

};
