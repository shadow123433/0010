/* =========================
   BOTÃO RESERVAR (BACK-END)
========================= */

const btnReserva = document.querySelector('.reservar');
const modalReserva = document.getElementById('modalReserva');
const cancelarReserva = document.getElementById('cancelarReserva');
const confirmarReserva = document.getElementById('confirmarReserva');

btnReserva.onclick = () => {
  if (!window.carrinho || window.carrinho.length === 0) {
    alert("Carrinho vazio. Não é possível reservar.");
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
    alert("Informe seu nome para concluir a reserva.");
    return;
  }

  const pedidoReserva = {
  tipo: "RESERVA",
  pedidoID: "RES-" + Date.now(),
  nome,
  itens: JSON.parse(JSON.stringify(window.carrinho)),
  total: window.total
};


  fetch("http://localhost:3000/pedidos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pedidoReserva)
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert("Erro ao registrar reserva: " + data.error);
        return;
      }

      alert("Reserva registrada com sucesso! Aguarde confirmação da loja.");

      // limpa carrinho
      window.carrinho = [];
      window.total = 0;

      if (typeof atualizarCarrinho === "function") {
        atualizarCarrinho();
      }

      modalReserva.style.display = 'none';
    })
    .catch(err => {
      console.error(err);
      alert("Erro ao conectar com o servidor.");
    });
};
