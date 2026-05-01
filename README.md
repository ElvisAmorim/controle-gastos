# 💰 Controle de Gastos Pessoal (SPA)

Um aplicativo de gestão financeira pessoal (Single Page Application) desenvolvido puramente com JavaScript (Vanilla JS), HTML e CSS (Bootstrap 5). O sistema roda **100% no navegador** (offline-first), garantindo total privacidade dos seus dados, sem a necessidade de um servidor backend ou banco de dados relacional.

## 🌟 Funcionalidades

O sistema foi desenhado para oferecer uma visão completa e detalhada da sua saúde financeira:

- **📊 Dashboard Interativo**: Visão geral do mês com métricas de "Última Atualização", "Poder de Compra", "Fixas Pendentes" e "Fatura Cartão". Inclui gráfico de evolução mensal e uma tabela anual cruzando Receitas x Despesas detalhadas.
- **💸 Lançamentos Variáveis**: Controle de despesas e receitas do dia a dia. Suporte para lançamentos **parcelados** (gerando as parcelas nos meses seguintes automaticamente) e possibilidade de "incrementar" o valor de um lançamento existente.
- **📅 Custos Fixos**: Gestão inteligente de contas recorrentes. Defina o mês de início e o dia de vencimento. O sistema projeta o custo fixo para os meses seguintes. Você pode marcar um custo fixo como "Pago" em um mês específico sem afetar os próximos.
- **🗂️ Categorias Dinâmicas**: Crie e gerencie categorias (Receita ou Despesa) e suas respectivas subcategorias, mantendo seu orçamento altamente organizado.
- **📈 Relatório Anual (Orçamento)**: Uma visualização dedicada (Análise de Orçamento) que projeta e calcula a **média mensal** real das suas despesas baseadas em categorias, além do % de impacto de cada categoria sobre as suas receitas totais.

## 💾 Armazenamento e Privacidade

Este projeto adota uma arquitetura **Local-First**. O que isso significa?
- **Sem Banco de Dados em Nuvem**: Seus dados nunca saem do seu dispositivo. 
- **LocalStorage**: Todos os lançamentos, categorias e status de pagamentos são salvos utilizando a API nativa `localStorage` do seu navegador. 
- **Velocidade e Offline**: Como não há requisições de rede para buscar os dados, as abas e dashboards carregam instantaneamente e funcionam sem acesso à internet.

## 🛡️ Backup e Restauração

Como os dados ficam apenas no dispositivo (celular ou PC) em que você utiliza o sistema, **fazer backup é essencial** caso você queira limpar o cache do navegador ou trocar de aparelho.

**Para fazer Backup:**
1. Acesse o menu lateral e vá em **"Configurações"**.
2. Clique no botão azul **"Fazer Backup (Download)"**.
3. O sistema fará o download de um arquivo `myfinance_backup.json` contendo todo o seu histórico financeiro. Guarde este arquivo em um local seguro (Google Drive, pendrive, etc).

**Para Restaurar (ou migrar de aparelho):**
1. Acesse as **"Configurações"** no aparelho/navegador de destino.
2. Na área de "Restaurar Dados", clique em **Escolher arquivo** e selecione o seu `.json` de backup.
3. Clique em **"Restaurar Backup"**. Pronto! Todos os seus dados estarão lá.

## 💻 Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla - ES6)
- **Framework UI**: [Bootstrap 5.3](https://getbootstrap.com/)
- **Ícones**: [FontAwesome 6](https://fontawesome.com/)
- **Gráficos**: [Chart.js](https://www.chartjs.org/)

## 🚀 Como Rodar o Projeto

Você não precisa instalar Node.js, PHP, MySQL ou configurar servidores.

1. Baixe os arquivos do projeto.
2. Dê um duplo clique no arquivo `index.html`.
3. O sistema abrirá no seu navegador padrão e já estará pronto para uso.

> **Dica**: O projeto está perfeitamente estruturado para ser hospedado gratuitamente no **GitHub Pages**, **Vercel** ou **Netlify**. Hospedando em uma dessas plataformas, você poderá acessar seu sistema pelo celular como se fosse um app comum.

---
*Desenvolvido como uma solução robusta e privada para gestão financeira.*
