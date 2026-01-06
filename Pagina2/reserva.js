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
  const whats = document.getElementById('whatsReserva').value.trim();

  if (!nome || !whats) {
    alert('Preencha nome e WhatsApp');
    return;
  }

  let itensTexto = '';

  carrinho.forEach(item => {
    Object.entries(item.tamanhos).forEach(([tamanho, qtd]) => {
      itensTexto += `- ${item.produto} (${tamanho} × ${qtd})\n`;
    });
  });

  const mensagem = `
*RESERVA DE UNIFORMES*

Nome: ${nome}
WhatsApp: ${whats}

Itens reservados:
${itensTexto}

Total estimado: R$ ${total.toFixed(2)}

⚠️ Reserva válida por 24h
⚠️ Retirada na loja
⚠️ Valor sujeito à confirmação
`.trim();

  const numeroLoja = '27998040952'; // seu número
  const url = `https://wa.me/${numeroLoja}?text=${encodeURIComponent(mensagem)}`;

 window.open(url, '_blank');

// LIMPA O CARRINHO APÓS RESERVA
carrinho = [];
total = 0;
atualizarCarrinho();

modalReserva.style.display = 'none';

};
