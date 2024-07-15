document.addEventListener("DOMContentLoaded", function () {
  const accessToken = localStorage.getItem("accessToken");
  const userName = localStorage.getItem("userName");

  const pendenteSection = document.getElementById("pendente-section");
  const historicoSection = document.getElementById("historico-section");
  const mensagemStatus = document.getElementById("mensagemStatus");
  const tituloBemVindo = document.getElementById("tituloBemVindo");

  tituloBemVindo.textContent = `Bem-vindo, ${userName}`;

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userName");
    window.location.href = "./index.html";
  });

  document.getElementById("pendente-tab").addEventListener("click", () => {
    pendenteSection.classList.remove("d-none");
    historicoSection.classList.add("d-none");
    listarPedidosPendentes();
    selecionarItemMenu("pendente-tab");
  });

  document.getElementById("historico-tab").addEventListener("click", () => {
    pendenteSection.classList.add("d-none");
    historicoSection.classList.remove("d-none");
    listarPedidosHistorico();
    selecionarItemMenu("historico-tab");
  });

  function listarPedidosPendentes() {
    fetch("https://sga.grupobrf1.com:10000/listarpedidosnaovalidados", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => {
        if (response.status === 403) {
          window.location.href = "pagina_erro_403.html";
          return Promise.reject(new Error("Acesso proibido"));
        } else if (response.status === 404) {
          return Promise.resolve([]);
        } else if (!response.ok) {
          throw new Error("Erro ao buscar pedidos pendentes");
        }
        return response.json();
      })
      .then((data) => {
        const pendentePedidos = document.getElementById("pendentePedidos");
        pendentePedidos.innerHTML = "";

        if (Array.isArray(data) && data.length > 0) {
          data.forEach((pedido) => {
            const pedidoElement = document.createElement("div");
            pedidoElement.className = "pedido-box";
            pedidoElement.innerHTML = `
              <div class="pedido-info"><strong>Transação:</strong> ${
                pedido.transacao
              }</div>
              <div class="pedido-info"><strong>Cliente:</strong> ${
                pedido.cliente
              }</div>
              <div class="pedido-info"><strong>CNPJ:</strong> ${formatarCNPJ(
                pedido.cnpj
              )}</div>
              <div class="pedido-info"><strong>UF:</strong> ${pedido.uf}</div>
              <div class="pedido-info"><strong>Cidade:</strong> ${
                pedido.cidade
              }</div>
              <div class="pedido-info"><strong>Fornecedor:</strong> ${
                pedido.fornecedor
              }</div>
              <div class="pedido-info"><strong>Valor Pedido:</strong> ${formatarMoeda(
                pedido.valorped
              )}</div>
              <div class="pedido-info"><strong>Quantidade de Moedas:</strong> ${
                pedido.qtmoedas
              }</div>
              <div class="pedido-info"><strong>Vendedor:</strong> ${
                pedido.usuariofunc
              }</div>
              <div class="pedido-info"><strong>Data Lançamento:</strong> ${formatarData(
                pedido.dtlanc
              )}</div>
              <div class="pedido-info"><strong>Distribuidora:</strong> ${
                pedido.filial
              }</div>
              <button class="btn btn-success btn-approve mt-2" data-transacao="${
                pedido.transacao
              }">Aprovar</button>
              <button class="btn btn-danger btn-reprovar mt-2" data-transacao="${
                pedido.transacao
              }">Reprovar</button>
            `;
            pendentePedidos.appendChild(pedidoElement);
          });
        } else {
          pendentePedidos.innerHTML =
            '<div class="alert alert-info">Não há pedidos pendentes no momento.</div>';
        }
      })
      .catch((error) => {
        console.error("Erro ao buscar pedidos pendentes:", error);
        const pendentePedidos = document.getElementById("pendentePedidos");
        pendentePedidos.innerHTML =
          '<div class="alert alert-danger">Erro ao buscar pedidos pendentes.</div>';
      });
  }

  function listarPedidosHistorico() {
    listarPedidosAprovados();
    listarPedidosNegados();
  }

  function listarPedidosAprovados() {
    fetch("https://sga.grupobrf1.com:10000/listarsolicitacoesaprovadas", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const aprovadosPedidos = document.getElementById("aprovadosPedidos");
        aprovadosPedidos.innerHTML = "";

        if (Array.isArray(data)) {
          data.forEach((pedido) => {
            const pedidoElement = document.createElement("div");
            pedidoElement.className = "pedido-box";
            pedidoElement.innerHTML = `
              <div class="pedido-info"><strong>Transação:</strong> ${
                pedido.transacao
              }</div>
              <div class="pedido-info"><strong>Cliente:</strong> ${
                pedido.cliente
              }</div>
              <div class="pedido-info"><strong>CNPJ:</strong> ${formatarCNPJ(
                pedido.cnpj
              )}</div>
              <div class="pedido-info"><strong>UF:</strong> ${pedido.uf}</div>
              <div class="pedido-info"><strong>Cidade:</strong> ${
                pedido.cidade
              }</div>
              <div class="pedido-info"><strong>Fornecedor:</strong> ${
                pedido.fornecedor
              }</div>
              <div class="pedido-info"><strong>Valor Pedido:</strong> ${formatarMoeda(
                pedido.valorped
              )}</div>
              <div class="pedido-info"><strong>Quantidade de Moedas:</strong> ${
                pedido.qtmoedas
              }</div>
              <div class="pedido-info"><strong>Vendedor:</strong> ${
                pedido.usuariofunc
              }</div>
              <div class="pedido-info"><strong>Data Validação:</strong> ${formatarData(
                pedido.dtvalidacaofin
              )}</div>
              <div class="pedido-info"><strong>Usuário Libera:</strong> ${
                pedido.usuariovalidacaofin
              }</div>
              <div class="pedido-info"><strong>Distribuidora:</strong> ${
                pedido.filial
              }</div>
            `;
            aprovadosPedidos.appendChild(pedidoElement);
          });
        }
      });
  }

  function listarPedidosNegados() {
    fetch("https://sga.grupobrf1.com:10000/listarsolicitacoesnegadas", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const negadosPedidos = document.getElementById("negadosPedidos");
        negadosPedidos.innerHTML = "";

        if (Array.isArray(data)) {
          data.forEach((pedido) => {
            const pedidoElement = document.createElement("div");
            pedidoElement.className = "pedido-box";
            pedidoElement.innerHTML = `
              <div class="pedido-info"><strong>Transação:</strong> ${
                pedido.transacao
              }</div>
              <div class="pedido-info"><strong>Cliente:</strong> ${
                pedido.cliente
              }</div>
              <div class="pedido-info"><strong>CNPJ:</strong> ${formatarCNPJ(
                pedido.cnpj
              )}</div>
              <div class="pedido-info"><strong>UF:</strong> ${pedido.uf}</div>
              <div class="pedido-info"><strong>Cidade:</strong> ${
                pedido.cidade
              }</div>
              <div class="pedido-info"><strong>Fornecedor:</strong> ${
                pedido.fornecedor
              }</div>
              <div class="pedido-info"><strong>Valor Pedido:</strong> ${formatarMoeda(
                pedido.valorped
              )}</div>
              <div class="pedido-info"><strong>Quantidade de Moedas:</strong> ${
                pedido.qtmoedas
              }</div>
              <div class="pedido-info"><strong>Vendedor:</strong> ${
                pedido.usuariofunc
              }</div>
              <div class="pedido-info"><strong>Data Validação:</strong> ${formatarData(
                pedido.dtvalidacaofin
              )}</div>
              <div class="pedido-info"><strong>Usuário Libera:</strong> ${
                pedido.usuariovalidacaofin
              }</div>
              <div class="pedido-info"><strong>Distribuidora:</strong> ${
                pedido.filial
              }</div>
            `;
            negadosPedidos.appendChild(pedidoElement);
          });
        }
      });
  }

  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("btn-approve")) {
      const pedidoBox = event.target.closest(".pedido-box");
      mostrarModal("aprovar", pedidoBox, event.target);
    } else if (event.target.classList.contains("btn-reprovar")) {
      const pedidoBox = event.target.closest(".pedido-box");
      mostrarModal("reprovar", pedidoBox, event.target);
    }
  });

  function mostrarModal(acao, pedidoBox, button) {
    document.getElementById("acaoModal").textContent =
      acao === "aprovar" ? "aprovar" : "reprovar";

    document.getElementById("confirmaTransacao").textContent = pedidoBox
      .querySelector(".pedido-info:nth-child(1)")
      .textContent.split(": ")[1];
    document.getElementById("confirmaCliente").textContent = pedidoBox
      .querySelector(".pedido-info:nth-child(2)")
      .textContent.split(": ")[1];
    document.getElementById("confirmaCnpj").textContent = pedidoBox
      .querySelector(".pedido-info:nth-child(3)")
      .textContent.split(": ")[1];
    document.getElementById("confirmaUf").textContent = pedidoBox
      .querySelector(".pedido-info:nth-child(4)")
      .textContent.split(": ")[1];
    document.getElementById("confirmaCidade").textContent = pedidoBox
      .querySelector(".pedido-info:nth-child(5)")
      .textContent.split(": ")[1];
    document.getElementById("confirmaFornecedor").textContent = pedidoBox
      .querySelector(".pedido-info:nth-child(6)")
      .textContent.split(": ")[1];
    document.getElementById("confirmaValorPedido").textContent = pedidoBox
      .querySelector(".pedido-info:nth-child(7)")
      .textContent.split(": ")[1];
    document.getElementById("confirmaQtMoedas").textContent = pedidoBox
      .querySelector(".pedido-info:nth-child(8)")
      .textContent.split(": ")[1];
    document.getElementById("confirmaVendedor").textContent = pedidoBox
      .querySelector(".pedido-info:nth-child(9)")
      .textContent.split(": ")[1];
    document.getElementById("confirmaDataLancamento").textContent = pedidoBox
      .querySelector(".pedido-info:nth-child(10)")
      .textContent.split(": ")[1];
    document.getElementById("confirmaDistribuidora").textContent = pedidoBox
      .querySelector(".pedido-info:nth-child(11)")
      .textContent.split(": ")[1];

    const confirmacaoModal = new bootstrap.Modal(
      document.getElementById("confirmacaoModal")
    );
    confirmacaoModal.show();

    document.getElementById("confirmarPedidoBtn").onclick = function () {
      confirmacaoModal.hide();
      atualizarStatusPedido(
        pedidoBox
          .querySelector(".pedido-info:nth-child(1)")
          .textContent.split(": ")[1],
        acao === "aprovar",
        button
      );
    };

    document.getElementById("cancelarPedidoBtn").onclick = function () {
      confirmacaoModal.hide();
    };
  }

  function atualizarStatusPedido(transacao, status, button) {
    const payload = { transacao, status };
    console.log("Enviando requisição:", payload);

    button.disabled = true;
    const siblingButton =
      button.nextElementSibling || button.previousElementSibling;
    siblingButton.disabled = true;

    const loadingSpinner = document.createElement("div");
    loadingSpinner.className = "loading-spinner";
    button.parentNode.appendChild(loadingSpinner);

    fetch(`https://sga.grupobrf1.com:10000/aprovarrejeitarpedido`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        const responseBody = await response.text();
        let data;
        try {
          data = JSON.parse(responseBody);
        } catch (e) {
          data = { detail: responseBody };
        }
        return { status: response.status, body: data };
      })
      .then((data) => {
        if (data.status !== 200) {
          throw new Error(
            data.body.detail || "Erro ao atualizar status do pedido"
          );
        }
        console.log("Dados recebidos:", data.body);
        mostrarMensagemStatus(
          data.body.mensagem,
          status,
          transacao,
          button
            .closest(".pedido-box")
            .querySelector(".pedido-info:nth-child(2)")
            .textContent.split(": ")[1],
          button
            .closest(".pedido-box")
            .querySelector(".pedido-info:nth-child(7)")
            .textContent.split(": ")[1]
        );
        removerPedidoDaTela(button);
      })
      .catch((error) => {
        console.error("Erro ao atualizar status do pedido:", error);
        mostrarMensagemStatus(
          `Erro: ${error.message}`,
          false,
          transacao,
          "",
          ""
        );
        removerPedidoDaTela(button);
      })
      .finally(() => {
        loadingSpinner.remove();
        button.disabled = false;
        siblingButton.disabled = false;
      });
  }

  function mostrarMensagemStatus(mensagem, status, transacao, cliente, valor) {
    mensagemStatus.className = `alert ${
      status ? "alert-success" : "alert-danger"
    }`;
    mensagemStatus.textContent = `${mensagem} - Transação: ${transacao}, Cliente: ${cliente}, Valor: ${valor}`;
    mensagemStatus.classList.remove("d-none");
    setTimeout(() => {
      mensagemStatus.classList.add("d-none");
    }, 10000); // Ocultar mensagem após 10 segundos
  }

  function removerPedidoDaTela(button) {
    const pedidoBox = button.closest(".pedido-box");
    pedidoBox.style.opacity = 0;
    setTimeout(() => {
      pedidoBox.remove();
    }, 1000);
  }

  function selecionarItemMenu(id) {
    document.querySelectorAll(".nav-link").forEach((item) => {
      item.classList.remove("active");
    });
    document.getElementById(id).classList.add("active");
  }

  // Funções de formatação
  function formatarCNPJ(cnpj) {
    return cnpj.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      "$1.$2.$3/$4-$5"
    );
  }

  function formatarMoeda(valor) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  }

  function formatarData(data) {
    const date = new Date(data);
    return date.toLocaleString("pt-BR");
  }

  // Atualizar lista de pedidos pendentes a cada 10 segundos
  setInterval(listarPedidosPendentes, 10000);
  setInterval(listarPedidosHistorico, 10000);

  // Inicializar a seção de pedidos pendentes por padrão
  listarPedidosPendentes();
});
