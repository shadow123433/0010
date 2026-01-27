/* =========================
   RESERVA.JS
========================= */
document.addEventListener("DOMContentLoaded", () => {

  // =========================
  // ELEMENTOS
  // =========================
  const reservarBtn = document.querySelector(".reservar");
  const modal = document.getElementById("modalReserva");
  const nomeInput = document.getElementById("nomeReserva");
  const cancelarBtn = document.getElementById("cancelarReserva");
  const confirmarBtn = document.getElementById("confirmarReserva");

  const pedidoForm = document.getElementById("pedido-form");
  const pedidoLoading = document.getElementById("pedido-loading");

  // Criar modal de confirmação (se ainda não existir)
  let reservaConfirmada = document.getElementById("reserva-confirmada");
  if (!reservaConfirmada) {
    reservaConfirmada = document.createElement("section");
    reservaConfirmada.id = "reserva-confirmada";
    // Estilos para modal centralizado e visual profissional
    Object.assign(reservaConfirmada.style, {
      display: "none",
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "#fff",
      padding: "30px 40px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
      borderRadius: "12px",
      zIndex: "9999",
      textAlign: "left",
      maxWidth: "400px",
      width: "90%",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: "#222",
    });
    reservaConfirmada.innerHTML = `
      <h2 style="margin-top:0; margin-bottom: 15px;">Reserva confirmada ✅</h2>
      <p>
        Número da reserva: <strong>#<span id="reservaId"></span></strong>
      </p>
      <p>Status: <strong>Recebido</strong></p>
      <p>Sua reserva foi recebida pela loja e está sujeita à confirmação.</p>
      <button id="fecharReservaBtn" style="
        margin-top: 25px;
        padding: 10px 30px;
        font-weight: 600;
        background: linear-gradient(135deg, #27ae60, #219150);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        box-shadow: 0 6px 12px rgba(33, 145, 80, 0.4);
        transition: background-color 0.3s ease, box-shadow 0.3s ease;
        user-select: none;
      ">Fechar</button>
    `;
    document.body.appendChild(reservaConfirmada);
  }

  const reservaIdSpan = document.getElementById("reservaId");
  const fecharReservaBtn = document.getElementById("fecharReservaBtn");

  // =========================
  // FUNÇÕES
  // =========================
  function gerarReservaID() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 90 + 10); // 2 dígitos
  return `RES-${timestamp}${random}`;
}

  // Toast simples
  const toast = document.createElement("div");
  toast.className = "toast";
  document.body.appendChild(toast);
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
  }

  // =========================
  // ABRIR MODAL RESERVA
  // =========================
  reservarBtn.addEventListener("click", () => {
    if (!window.carrinho.length) {
      alert("Adicione itens ao carrinho antes de reservar");
      return;
    }
    modal.style.display = "flex";
  });

  // =========================
  // FECHAR MODAL RESERVA
  // =========================
  cancelarBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // =========================
  // CONFIRMAR RESERVA
  // =========================
  confirmarBtn.addEventListener("click", () => {
    const nome = nomeInput.value.trim();
    if (!nome) {
      showToast("Preencha o nome para confirmar a reserva");
      return;
    }

const reservaID = gerarReservaID();
document.getElementById("reservaId").textContent = reservaID;

    // Mostrar carregando e esconder formulário modal reserva
    modal.style.display = "none";
    pedidoForm.style.display = "none";
    pedidoLoading.style.display = "block";

    const reserva = {
  tipo: "RESERVA",
  pedidoID: reservaID,
  nome,
  itens: window.carrinho,
  total: window.total,
  data: new Date().toISOString()
};

    fetch("http://localhost:3000/pedidos", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(reserva)
})
.then(() => {
  pedidoLoading.style.display = "none";
  reservaConfirmada.style.display = "block";

  document.getElementById("reservaId").textContent = reservaID;

  sessionStorage.setItem(
    "reservaConfirmada",
    JSON.stringify({ reservaID })
  );
})
.catch(() => {
  alert("Erro ao conectar com o servidor");
  pedidoLoading.style.display = "none";
  pedidoForm.style.display = "block";
});
  });

  // =========================
  // FUNÇÃO PARA REINICIAR ESTADO E LIMPAR TUDO
  // =========================
  function resetTudo() {
    // Limpar carrinho e total
    window.carrinho = [];
    window.total = 0;

    // Atualizar UI do carrinho (supondo que tenha essa função global)
    if (typeof atualizarCarrinho === "function") atualizarCarrinho();

    // Esconder modal de confirmação
    reservaConfirmada.style.display = "none";

    // Mostrar formulário reserva novamente
    pedidoForm.style.display = "block";

    // Esconder loading
    pedidoLoading.style.display = "none";

    // Limpar dados da reserva no sessionStorage para não reaparecer modal
    sessionStorage.removeItem("reservaConfirmada");

    // Limpar input nome
    nomeInput.value = "";
  }

  // =========================
  // EVENTO FECHAR MODAL CONFIRMAÇÃO
  // =========================
 fecharReservaBtn.addEventListener("click", () => {
  // Fecha o modal
  reservaConfirmada.style.display = "none";

  // Esvazia o carrinho e zera total
  window.carrinho = [];
  window.total = 0;

  // Atualiza o carrinho para mostrar "Nenhum item adicionado"
  atualizarCarrinho();

  // Restaura o formulário e esconde loading/confirmacao
  pedidoForm.style.display = "block";
  pedidoLoading.style.display = "none";

  // Remove confirmação salva
  sessionStorage.removeItem("reservaConfirmada");

  // Limpa campos do modal de reserva
  nomeInput.value = "";
});

  // =========================
  // RECUPERAR CONFIRMAÇÃO AO RECARREGAR
  // =========================
  const reservaSalva = sessionStorage.getItem("reservaConfirmada");
  if (reservaSalva) {
    const { reservaID } = JSON.parse(reservaSalva);
    // Remove para não mostrar sempre no reload
    sessionStorage.removeItem("reservaConfirmada");

    pedidoForm.style.display = "none";
    pedidoLoading.style.display = "none";
    reservaConfirmada.style.display = "block";
document.getElementById("reservaId").textContent = reservaID;
  }

});
