// js/reserva.js
import { ReservaService } from './api.js';
import { Auth } from './auth.js';
import { abrirModal, showToast } from './ui.js';

/* =========================
    ELEMENTOS
========================= */
export const modalReserva = document.getElementById("modalReserva");
const nomeInput = document.getElementById("nomeReserva");
const pedidoForm = document.getElementById("pedido-form");
const pedidoLoading = document.getElementById("pedido-loading");

/* =========================
    FUNÇÕES LÓGICAS
========================= */
function gerarReservaID() {
    return `RES-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;
}

// Esta é a função que o main.js também vai usar
export function validarAcesso() {
    // 1. Primeiro checa se o carrinho está vazio
    if (!window.carrinho || window.carrinho.length === 0) {
        abrirModal("Adicione itens ao carrinho primeiro.");
        return false;
    }

    // 2. Depois checa o login. Se não estiver logado, REDIRECIONA
    if (!Auth.isLogged()) {
        sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
        window.location.href = "/login-usuarios/login.html";
        return false;
    }

    return true;
}

// Esta agora fica limpinha usando a função de cima
export function abrirModalReserva() {
    if (validarAcesso()) {
        modalReserva.style.display = "flex";
    }
}

export function fecharModalReserva() {
    modalReserva.style.display = "none";
}

export function confirmarReserva(atualizarCarrinhoUI) {
    const nome = nomeInput.value.trim();
    if (!nome) return showToast("Preencha o nome para confirmar a reserva");

    const reservaID = gerarReservaID();

    // 1. Prepara a tela
    modalReserva.style.display = "none";
    pedidoForm.style.display = "none";
    pedidoLoading.style.display = "block";

    // 2. Cálculo do total
    let totalCalculado = window.carrinho.reduce((acc, item) => {
        return acc + Object.values(item.tamanhos).reduce((sum, qtd) => sum + (qtd * item.precoUnitario), 0);
    }, 0);

    const reserva = {
        tipo: "RESERVA",
        pedidoID: reservaID,
        nome,
        itens: window.carrinho,
        total: totalCalculado,
        data: new Date().toISOString()
    };

    // 3. CHAMADA CERTEIRA DA API (Usando o serviço que você criou)
    ReservaService.confirmar(reserva)
    .then(() => {
        pedidoLoading.style.display = "none";

        // 4. Cria o Overlay e o Modal Profissional (Usa seu CSS pronto)
        const overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.style.display = "flex";

        const modalSucesso = document.createElement("div");
        modalSucesso.id = "reserva-confirmada"; // Usa seu ID do CSS que você mandou
        modalSucesso.innerHTML = `
            <h2>Reserva confirmada ✅</h2>
            <p>Número da reserva: <strong>#${reservaID}</strong></p>
            <p>Status: <strong>Recebido</strong></p>
            <p>Sua reserva foi recebida pela loja e está sujeita à confirmação.</p>
            <button id="fecharReservaBtn">Fechar</button>
        `;

        document.body.appendChild(overlay);
        overlay.appendChild(modalSucesso);

        // 5. Evento de Fechar e Limpar tudo
        document.getElementById("fecharReservaBtn").onclick = () => {
            overlay.remove();
            
            // Limpa dados
            window.carrinho = [];
            window.total = 0;
            localStorage.removeItem("carrinho");
            localStorage.removeItem("total");
            sessionStorage.removeItem("reservaConfirmada");
            nomeInput.value = "";

            // Reseta UI
            if (pedidoForm) pedidoForm.style.display = "block";
            if (typeof atualizarCarrinhoUI === "function") atualizarCarrinhoUI();
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };

        localStorage.setItem("pedidosBadge", "1");
    })
    .catch((err) => {
        console.error("Erro na reserva:", err);
        pedidoLoading.style.display = "none";
        pedidoForm.style.display = "block";
        abrirModal("Erro ao processar reserva. Verifique a rota no api.js.");
    });
}

export function verificarReservaSalva() {
    const reservaSalva = sessionStorage.getItem("reservaConfirmada");
    if (reservaSalva) {
        // Se quiser manter o aviso de reserva pendente, você pode recriar o modal aqui
        // Mas o ideal para limpar o bug é remover após o uso
        sessionStorage.removeItem("reservaConfirmada");
    }
}