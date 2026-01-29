// ==========================
// MEUS-PEDIDOS.JS (SEM LOGOUT)
// ==========================

document.addEventListener("DOMContentLoaded", () => {

  // BLOQUEIA SE NÃO ESTIVER LOGADO
  if (!localStorage.getItem("token")) {
    window.location.href = "login.html";
    return;
  }

  carregarPedidos();

});


// ==========================
// BUSCAR PEDIDOS
// ==========================

function carregarPedidos() {

  const lista = document.getElementById("listaPedidos");

  lista.innerHTML = "Carregando pedidos...";

  fetch("http://localhost:3000/meus-pedidos", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
    }
  })

    .then(res => {
      if (!res.ok) throw new Error("Erro ao buscar pedidos");
      return res.json();
    })

    .then(pedidos => {

      if (!Array.isArray(pedidos) || pedidos.length === 0) {
        lista.innerHTML = "<p>Nenhum pedido ou reserva encontrado.</p>";
        return;
      }

      lista.innerHTML = "";

      pedidos.forEach(pedido => {

        const div = document.createElement("div");

        const classe =
          pedido.tipo === "RESERVA" ? "reserva" : "pedido";

        div.className = "pedido " + classe;

        // ======================
        // ITENS
        // ======================

        let itensHTML = "";

        if (pedido.itens?.length) {

          pedido.itens.forEach(item => {

            if (item.tamanhos) {

              Object.entries(item.tamanhos).forEach(
                ([tam, qtd]) => {

                  if (qtd > 0) {
                    itensHTML +=
                      `<li>${item.produto} - ${tam} × ${qtd}</li>`;
                  }

                }
              );
            }

          });

        } else {
          itensHTML = "<li>—</li>";
        }

        // ======================
        // DADOS
        // ======================

        const total =
          pedido.total != null ? `R$ ${pedido.total}` : "—";

        const status = pedido.status || "pendente";

        const data =
          pedido.data
            ? new Date(pedido.data).toLocaleString()
            : "—";

        div.innerHTML = `
          <strong>Tipo:</strong> ${pedido.tipo || "PEDIDO"}<br/>
          <strong>ID:</strong> ${pedido.pedidoID || "—"}<br/>
          <strong>Nome:</strong> ${pedido.nome || "—"}<br/>
          <strong>Total:</strong> ${total}<br/>
          <strong>Status:</strong> ${status}<br/>
          <strong>Data:</strong> ${data}

          <div class="itens">
            <strong>Itens:</strong>
            <ul>${itensHTML}</ul>
          </div>
        `;

        lista.appendChild(div);

      });

    })

    .catch(err => {
      console.error(err);
      lista.innerHTML = "Erro ao carregar pedidos.";
    });

}
