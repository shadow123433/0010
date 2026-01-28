// meus-pedidos.js

document.addEventListener("DOMContentLoaded", () => {
  carregarPedidos();

  // botão de logout
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "/login.html"; // ou outra página de login
  });
});

function carregarPedidos() {
  const lista = document.getElementById("listaPedidos");
  lista.innerHTML = "Carregando pedidos...";

  fetch("http://localhost:3000/meus-pedidos", {
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("token")
    }
  })
    .then(res => res.json())
    .then(pedidos => {
      if (!pedidos.length) {
        lista.innerHTML = "<p>Nenhum pedido ou reserva encontrado.</p>";
        return;
      }

      lista.innerHTML = "";

      pedidos.forEach(pedido => {
        const div = document.createElement("div");
        const classe = pedido.tipo === "RESERVA" ? "reserva" : "pedido";
        div.className = "pedido " + classe;

        // montar lista de itens
        let itensHTML = "";
        if (pedido.itens && pedido.itens.length) {
          pedido.itens.forEach(item => {
            if (item.tamanhos) {
              Object.entries(item.tamanhos).forEach(([tam, qtd]) => {
                if (qtd > 0) {
                  itensHTML += `<li>${item.produto} - ${tam} × ${qtd}</li>`;
                }
              });
            }
          });
        } else {
          itensHTML = "<li>—</li>";
        }

        const total = pedido.total !== undefined ? `R$ ${pedido.total}` : "—";
        const status = pedido.status || "pendente";
        const data = pedido.data ? new Date(pedido.data).toLocaleString() : "—";

        div.innerHTML = `
          <strong>Tipo:</strong> <span>${pedido.tipo || "PEDIDO"}</span><br/>
          <strong>ID:</strong> <span>${pedido.pedidoID || "—"}</span><br/>
          <strong>Nome:</strong> <span>${pedido.nome || "—"}</span><br/>
          <strong>Total:</strong> <span>${total}</span><br/>
          <strong>Status:</strong> <span>${status}</span><br/>
          <strong>Data:</strong> <span>${data}</span>
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
