import { apiFetch } from './auth.js';

export const PedidoService = {
  enviar: async (dadosPedido) => {
    const res = await apiFetch("/pedidos", {
      method: "POST",
      body: JSON.stringify(dadosPedido)
    });

    if (!res.ok) throw new Error("Erro ao processar pedido");
    return await res.json();
  }
};

export const ReservaService = {
    /**
     * Envia os dados da reserva para o servidor
     */
    confirmar: async (dadosReserva) => {
        // CORREÇÃO: Mudei de "/reservas" para "/pedidos"
        const res = await apiFetch("/pedidos", {
            method: "POST",
            body: JSON.stringify(dadosReserva)
        });

        if (!res.ok) throw new Error("Erro ao processar reserva");

        return await res.json();
    }
};