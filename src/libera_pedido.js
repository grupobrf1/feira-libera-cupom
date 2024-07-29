document.addEventListener("DOMContentLoaded", () => {
  const accessToken = localStorage.getItem("accessToken");
  const userName = localStorage.getItem("userName");

  const pendenteSection = document.getElementById("pendente-section");
  const historicoSection = document.getElementById("historico-section");
  const mensagemStatus = document.getElementById("mensagemStatus");
  const tituloBemVindo = document.getElementById("tituloBemVindo");
  const notificationBadge = document.getElementById("notificationBadge");

  // Verifica se o elemento existe antes de tentar definir o texto
  if (tituloBemVindo) {
    tituloBemVindo.textContent = `Bem-vindo, ${userName}`;
  }

  // Configura o botão de logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userName");
    window.location.href = "./index.html";
  });

  // Configura os tabs de navegação
  document.getElementById("pendente-tab").addEventListener("click", () => {
    mostrarSecaoPendente();
  });

  document.getElementById("historico-tab").addEventListener("click", () => {
    mostrarSecaoHistorico();
  });

  // Função para mostrar a seção de pedidos pendentes
  function mostrarSecaoPendente() {
    if (pendenteSection) pendenteSection.classList.remove("d-none");
    if (historicoSection) historicoSection.classList.add("d-none");
    listarPedidosPendentes();
    selecionarItemMenu("pendente-tab");
  }

  // Função para mostrar a seção de histórico de pedidos
  function mostrarSecaoHistorico() {
    if (pendenteSection) pendenteSection.classList.add("d-none");
    if (historicoSection) historicoSection.classList.remove("d-none");
    listarPedidosHistorico();
    selecionarItemMenu("historico-tab");
  }

  // Função para listar pedidos pendentes
  function listarPedidosPendentes() {
    fetchPedidos(
      "https://api.grupobrf1.com:10000/listarpedidosnaovalidados",
      "pendentePedidos",
      "Não há pedidos pendentes no momento.",
      false
    );
  }

  // Função para listar pedidos históricos (aprovados e negados)
  function listarPedidosHistorico() {
    listarPedidosAprovados();
    listarPedidosNegados();
  }

  // Função para listar pedidos aprovados
  function listarPedidosAprovados() {
    fetchPedidos(
      "https://api.grupobrf1.com:10000/listarsolicitacoesaprovadas",
      "aprovadosPedidos",
      "Não há pedidos aprovados no momento.",
      true
    );
  }

  // Função para listar pedidos negados
  function listarPedidosNegados() {
    fetchPedidos(
      "https://api.grupobrf1.com:10000/listarsolicitacoesnegadas",
      "negadosPedidos",
      "Não há pedidos reprovados no momento.",
      true
    );
  }

  // Função genérica para buscar pedidos e renderizar na tela
  function fetchPedidos(url, elementId, emptyMessage, incluirUsuarioLibera) {
    fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((response) => {
        if (response.status === 403) {
          window.location.href = "./pagina_erro_403.html";
          return;
        }
        if (!response.ok) throw new Error("Erro ao buscar pedidos");
        return response.json();
      })
      .then((data) => {
        if (data) {
          renderPedidos(data, elementId, emptyMessage, incluirUsuarioLibera);
        }
      })
      .catch((error) => {
        console.error("Erro ao buscar pedidos:", error);
        const element = document.getElementById(elementId);
        if (element) {
          element.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        }
      });
  }

  // Função para renderizar os pedidos na tela
  function renderPedidos(data, elementId, emptyMessage, incluirUsuarioLibera) {
    const container = document.getElementById(elementId);
    if (!container) return;

    container.innerHTML = "";

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
          ${
            incluirUsuarioLibera
              ? `<div class="pedido-info"><strong>Data Validação:</strong> ${formatarData(
                  pedido.dtvalidacaofin
                )}</div>`
              : ""
          }
          ${
            incluirUsuarioLibera
              ? `<div class="pedido-info"><strong>Usuário Libera:</strong> ${pedido.usuariovalidacaofin}</div>`
              : ""
          }
          ${
            elementId === "pendentePedidos"
              ? `
          <button class="btn btn-success btn-approve mt-2" data-transacao="${pedido.transacao}">Aprovar</button>
          <button class="btn btn-danger btn-reprovar mt-2" data-transacao="${pedido.transacao}">Reprovar</button>
          `
              : ""
          }
        `;
        container.appendChild(pedidoElement);
      });

      // Atualiza o conteúdo do badge
      if (notificationBadge) {
        notificationBadge.textContent = data.length;
      }
    } else {
      container.innerHTML = `<div class="alert alert-info">${emptyMessage}</div>`;
      if (notificationBadge) {
        notificationBadge.textContent = "0";
      }
    }
  }

  // Configura os eventos de clique para os botões de aprovação e reprovação
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

  // Função para mostrar o modal de confirmação
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
      atualizarStatusPedido(
        pedidoBox
          .querySelector(".pedido-info:nth-child(1)")
          .textContent.split(": ")[1],
        acao === "aprovar",
        button
      );
    };

    document.getElementById("cancelarPedidoBtn").onclick = () => {
      confirmacaoModal.hide();
    };
  }

  // Função para atualizar o status do pedido
  function atualizarStatusPedido(transacao, status, button) {
    const payload = { transacao, status };
    console.log("Enviando requisição:", payload);

    desabilitarBotoes(button, true);

    fetch("https://api.grupobrf1.com:10000/aprovarrejeitarpedido", {
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

  // Função para desabilitar/habilitar os botões de aprovação/reprovação
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

  // Função para mostrar mensagens de status
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

  // Função para remover o pedido da tela
  function removerPedidoDaTela(button) {
    const pedidoBox = button.closest(".pedido-box");
    if (pedidoBox) {
      pedidoBox.style.opacity = 0;
      setTimeout(() => pedidoBox.remove(), 1000);
    }
  }

  // Função para selecionar o item de menu
  function selecionarItemMenu(id) {
    document
      .querySelectorAll(".nav-link")
      .forEach((item) => item.classList.remove("active"));
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
    return isNaN(date.getTime())
      ? "Data Inválida"
      : date.toLocaleString("pt-BR");
  }

  // Atualizar lista de pedidos pendentes e histórico a cada 10 segundos
  setInterval(listarPedidosPendentes, 10000);
  setInterval(listarPedidosHistorico, 10000);

  // Inicializar a seção de pedidos pendentes por padrão
  mostrarSecaoPendente();
});
