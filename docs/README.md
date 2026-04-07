# feira-libera-cupom

## Objetivo

Disponibilizar uma interface web para o financeiro aprovar ou reprovar pedidos e cupons da campanha Experiência 360.

## Problema que resolve

Centraliza a análise financeira dos pedidos e reduz aprovação manual sem histórico padronizado.

## Áreas ou setores atendidos

- Financeiro
- Comercial
- Operação da campanha

## Público principal

Usuários internos responsáveis pela validação financeira dos pedidos.

## Escopo resumido

Frontend web em Vite com autenticação, listagem de pedidos pendentes, histórico de solicitações aprovadas ou negadas e ações de aprovação ou reprovação.

## Funcionamento lógico resumido

- Origem dos dados: API da campanha em `https://api.grupobrf1.com:10000`.
- Entrada: credenciais do usuário, navegação entre abas e ações de aprovação ou reprovação.
- Processamento principal: consulta listas de pedidos pendentes, aprovados e negados, filtra histórico por fornecedor e envia a decisão financeira.
- Saída: tela atualizada com histórico e status do pedido.
- Integrações: rotas `listarpedidosnaovalidados`, `listarsolicitacoesaprovadas`, `listarsolicitacoesnegadas` e `aprovarrejeitarpedido`.
- Regra principal de negócio: somente pedidos pendentes podem receber aprovação ou reprovação financeira pela interface.
- Fluxo resumido: usuário autentica -> frontend carrega pendentes -> operador aprova ou reprova -> histórico é atualizado.

## Tecnologias principais

- Vite
- JavaScript
- HTML/CSS
- Bootstrap
- Amazon Cognito

## Como executar

Build de produção:

```bash
npm run build
```

## Integrações

- API `https://api.grupobrf1.com:10000`
- autenticação baseada em Amazon Cognito

## Publicação web

### Nginx

```nginx
server {
    listen 80;
    server_name <subdominio>;

    root /var/www/feira-libera-cupom/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Cloudflare

- criar registro DNS do subdomínio
- apontar para o servidor da aplicação
- ajustar proxy e SSL conforme o padrão do ambiente

## Status de produção

Há indício de uso como frontend interno da campanha. Solicitante original, URL final e período de uso ainda precisam de confirmação retroativa.

## Pendências para registro retroativo

- Confirmar solicitante original
- Confirmar URL ou subdomínio final
- Confirmar período de uso em produção
