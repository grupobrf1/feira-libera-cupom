document.addEventListener("DOMContentLoaded", () => {
  const accessToken = localStorage.getItem("accessToken");
  const userName = localStorage.getItem("userName");

  const pendenteFinanceiroSection = document.getElementById("pendente-financeiro-section");
  const pendenteComercialSection = document.getElementById("pendente-comercial-section");
  const historicoSection = document.getElementById("historico-section");
  const mensagemStatus = document.getElementById("mensagemStatus");
  const tituloBemVindo = document.getElementById("tituloBemVindo");
  const notificationBadge = document.getElementById("notificationBadge");

  let financeiroInterval, comercialInterval, historicoInterval;

  if (tituloBemVindo) {
    tituloBemVindo.textContent = `Bem-vindo, ${userName}`;
  }

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userName");
    window.location.href = "./index.html";
  });

  document.getElementById("pendente-financeiro-tab").addEventListener("click", () => {
    mostrarSecaoPendenteFinanceiro();
  });

  document.getElementById("pendente-comercial-tab").addEventListener("click", () => {
    mostrarSecaoPendenteComercial();
  });

  document.getElementById("historico-tab").addEventListener("click", () => {
    mostrarSecaoHistorico();
  });

  const buscaFornecedor = document.getElementById("buscaFornecedor");
  if (buscaFornecedor) {
    buscaFornecedor.addEventListener("input", () => {
      listarPedidosHistorico(buscaFornecedor.value);
    });
  }

  function mostrarSecaoPendenteFinanceiro() {
    if (pendenteFinanceiroSection) pendenteFinanceiroSection.classList.remove("d-none");
    if (pendenteComercialSection) pendenteComercialSection.classList.add("d-none");
    if (historicoSection) historicoSection.classList.add("d-none");

    clearInterval(comercialInterval);
    clearInterval(historicoInterval);
    financeiroInterval = setInterval(listarPedidosPendentesFinanceiro, 10000);

    listarPedidosPendentesFinanceiro();
    selecionarItemMenu("pendente-financeiro-tab");
  }

  function mostrarSecaoPendenteComercial() {
    if (pendenteFinanceiroSection) pendenteFinanceiroSection.classList.add("d-none");
    if (pendenteComercialSection) pendenteComercialSection.classList.remove("d-none");
    if (historicoSection) historicoSection.classList.add("d-none");

    clearInterval(financeiroInterval);
    clearInterval(historicoInterval);
    comercialInterval = setInterval(listarPedidosPendentesComercial, 10000);

    listarPedidosPendentesComercial();
    selecionarItemMenu("pendente-comercial-tab");
  }

  function mostrarSecaoHistorico() {
    if (pendenteFinanceiroSection) pendenteFinanceiroSection.classList.add("d-none");
    if (pendenteComercialSection) pendenteComercialSection.classList.add("d-none");
    if (historicoSection) historicoSection.classList.remove("d-none");

    clearInterval(financeiroInterval);
    clearInterval(comercialInterval);
    historicoInterval = setInterval(() => listarPedidosHistorico(buscaFornecedor.value), 10000);

    listarPedidosHistorico(buscaFornecedor.value);
    selecionarItemMenu("historico-tab");
  }

  function listarPedidosPendentesFinanceiro() {
    fetchPedidos(
      "https://api.grupobrf1.com:10000/listarpedidosnaovalidadosfinanceiro",
      "pendentePedidosFinanceiro",
      "Não há pedidos pendentes no momento (Financeiro).",
      false
    );
  }

  function listarPedidosPendentesComercial() {
    fetchPedidos(
      "https://api.grupobrf1.com:10000/listarpedidosnaovalidadoscomercial",
      "pendentePedidosComercial",
      "Não há pedidos pendentes no momento (Comercial).",
      false
    );
  }

  function listarPedidosHistorico(fornecedor = "") {
    listarPedidosAprovados(fornecedor);
    listarPedidosNegados(fornecedor);
  }

  function listarPedidosAprovados(fornecedor) {
    fetchPedidos(
      "https://api.grupobrf1.com:10000/listarsolicitacoesaprovadas",
      "aprovadosPedidos",
      "Não há pedidos aprovados no momento.",
      true,
      fornecedor
    );
  }

  function listarPedidosNegados(fornecedor) {
    fetchPedidos(
      "https://api.grupobrf1.com:10000/listarsolicitacoesnegadas",
      "negadosPedidos",
      "Não há pedidos reprovados no momento.",
      true,
      fornecedor
    );
  }

  function fetchPedidos(
    url,
    elementId,
    emptyMessage,
    incluirUsuarioLibera,
    fornecedor = ""
  ) {
    fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((response) => {
        if (response.status === 403) {
          window.location.href = "./pagina_erro_403.html";
          return;
        }
        if (response.status === 404) {
          return { noData: true };
        }
        if (!response.ok) throw new Error("Erro ao buscar pedidos");
        return response.json();
      })
      .then((data) => {
        if (data.noData) {
          renderPedidos(
            [],
            elementId,
            emptyMessage,
            incluirUsuarioLibera,
            fornecedor
          );
        } else if (data) {
          renderPedidos(
            data,
            elementId,
            emptyMessage,
            incluirUsuarioLibera,
            fornecedor
          );
        }
      })
      .catch((error) => {
        console.error("Erro ao buscar pedidos:", error);
        const element = document.getElementById(elementId);
        if (element) {
          element.innerHTML = `<div class="alert alert-danger">Erro ao buscar pedidos. Tente novamente mais tarde.</div>`;
        }
      });
  }

  function renderPedidos(
    data,
    elementId,
    emptyMessage,
    incluirUsuarioLibera,
    fornecedor
  ) {
    const container = document.getElementById(elementId);
    if (!container) return;

    container.innerHTML = "";

    if (Array.isArray(data) && data.length > 0) {
      const pedidosFiltrados = data.filter((pedido) =>
        pedido.fornecedor.toLowerCase().includes(fornecedor.toLowerCase())
      );

      if (pedidosFiltrados.length > 0) {
        pedidosFiltrados.forEach((pedido) => {
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
          ${
            incluirUsuarioLibera
              ? `<div class="pedido-info"><strong>Data Validação:</strong> ${formatarData(
                  pedido.dtvalidacaocom
                )}</div>`
              : ""
          }
          ${
            incluirUsuarioLibera
              ? `<div class="pedido-info"><strong>Usuário Libera:</strong> ${pedido.usuariovalidacaocom}</div>`
              : ""
          }
          ${
            elementId === "pendentePedidosFinanceiro" ||
            elementId === "pendentePedidosComercial"
              ? `
          <button class="btn btn-success btn-approve mt-2" data-transacao="${pedido.transacao}">Aprovar</button>
          <button class="btn btn-danger btn-reprovar mt-2" data-transacao="${pedido.transacao}">Reprovar</button>
          `
              : ""
          }
        `;
          container.appendChild(pedidoElement);
        });

        if (notificationBadge) {
          notificationBadge.textContent = pedidosFiltrados.length;
        }
      } else {
        container.innerHTML = `<div class="alert alert-info">${emptyMessage}</div>`;
        if (notificationBadge) {
          notificationBadge.textContent = "0";
        }
      }
    } else {
      container.innerHTML = `<div class="alert alert-info">${emptyMessage}</div>`;
      if (notificationBadge) {
        notificationBadge.textContent = "0";
      }
    }
  }

  document.addEventListener("click", (event) => {
    if (
      event.target.classList.contains("btn-approve") ||
      event.target.classList.contains("btn-reprovar")
    ) {
      const pedidoBox = event.target.closest(".pedido-box");
      const acao = event.target.classList.contains("btn-approve")
        ? "aprovar"
        : "reprovar";
      mostrarModalConfirmacao(acao, pedidoBox, event.target);
    }
  });

  function mostrarModalConfirmacao(acao, pedidoBox, button) {
    const acaoElement = document.getElementById("acaoModal");
    if (acaoElement) {
      acaoElement.textContent = acao;
      acaoElement.className =
        acao === "aprovar" ? "text-success fw-bold" : "text-danger fw-bold";
    }

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

    document.getElementById("confirmarPedidoBtn").onclick = () => {
      confirmacaoModal.hide();
      const isFinanceiro = button.closest("#pendentePedidosFinanceiro");
      const endpoint = isFinanceiro
        ? "https://api.grupobrf1.com:10000/aprovarrejeitarpedidofinanceiro"
        : "https://api.grupobrf1.com:10000/aprovarrejeitarpedidocomercial";
      atualizarStatusPedido(
        pedidoBox
          .querySelector(".pedido-info:nth-child(1)")
          .textContent.split(": ")[1],
        acao === "aprovar",
        button,
        endpoint
      );
    };

    document.getElementById("cancelarPedidoBtn").onclick = () => {
      confirmacaoModal.hide();
    };
  }

  function atualizarStatusPedido(transacao, status, button, endpoint) {
    const payload = { transacao, status };
    console.log("Enviando requisição:", payload);

    desabilitarBotoes(button, true);

    fetch(endpoint, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(
              data.detail || "Erro ao atualizar status do pedido"
            );
          });
        }
        return response.json();
      })
      .then((data) => {
        mostrarMensagemStatus(
          data.mensagem,
          status,
          transacao,
          button.closest(".pedido-box")
        );
        removerPedidoDaTela(button);
      })
      .catch((error) => {
        console.error("Erro ao atualizar status do pedido:", error);
        mostrarMensagemStatus(`Erro: ${error.message}`, false, transacao);
      })
      .finally(() => desabilitarBotoes(button, false));
  }

  function desabilitarBotoes(button, desabilitar) {
    button.disabled = desabilitar;
    const siblingButton =
      button.nextElementSibling || button.previousElementSibling;
    if (siblingButton) {
      siblingButton.disabled = desabilitar;
    }

    if (desabilitar) {
      const loadingSpinner = document.createElement("div");
      loadingSpinner.className = "loading-spinner";
      button.parentNode.appendChild(loadingSpinner);
    } else {
      const spinner = button.parentNode.querySelector(".loading-spinner");
      if (spinner) {
        spinner.remove();
      }
    }
  }

  function mostrarMensagemStatus(
    mensagem,
    status,
    transacao,
    pedidoBox = null
  ) {
    if (mensagemStatus) {
      mensagemStatus.className = ` position-fixed alert ${
        status ? "alert-success" : "alert-danger"
      }`;
      const cliente = pedidoBox
        ? pedidoBox
            .querySelector(".pedido-info:nth-child(2)")
            .textContent.split(": ")[1]
        : "";
      const valor = pedidoBox
        ? pedidoBox
            .querySelector(".pedido-info:nth-child(7)")
            .textContent.split(": ")[1]
        : "";
      mensagemStatus.textContent = `${mensagem} - Transação: ${transacao}, Cliente: ${cliente}, Valor: ${valor}`;
      mensagemStatus.classList.remove("d-none");
      setTimeout(() => mensagemStatus.classList.add("d-none"), 10000);
    }
  }

  function removerPedidoDaTela(button) {
    const pedidoBox = button.closest(".pedido-box");
    if (pedidoBox) {
      pedidoBox.style.opacity = 0;
      setTimeout(() => pedidoBox.remove(), 1000);
    }
  }

  function selecionarItemMenu(id) {
    document
      .querySelectorAll(".nav-link")
      .forEach((item) => item.classList.remove("active"));
    document.getElementById(id).classList.add("active");
  }

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
    return isNaN(date.getTime())
      ? "Data Inválida"
      : date.toLocaleString("pt-BR");
  }

  mostrarSecaoPendenteFinanceiro();
});
