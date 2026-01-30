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

  <button class="btn-excluir" data-id="${pedido.pedidoID}">🗑️ Excluir pedido</button>
`;


        lista.appendChild(div);
        const btnExcluir = div.querySelector(".btn-excluir");
btnExcluir.onclick = () => {
  if (!confirm("Tem certeza que deseja excluir este pedido/reserva?")) return;

  fetch(`http://localhost:3000/meus-pedidos/${pedido.pedidoID}`, {
  method: "PATCH",
  headers: {
    Authorization: "Bearer " + localStorage.getItem("token")
  }
})
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      div.remove(); // Remove do HTML apenas se o servidor confirmou
      alert("Pedido oculto da sua conta!");
    } else {
      alert(data.error || "Não foi possível ocultar o pedido");
    }
  })
  .catch(err => {
    console.error(err);
    alert("Erro ao ocultar o pedido. Tente novamente.");
  });
};

      });

    })

    .catch(err => {
      console.error(err);
      lista.innerHTML = "Erro ao carregar pedidos.";
    });

}


document.getElementById("btnVoltar").onclick = () => {
  window.location.href = "../Pagina2/index2.html";
};
