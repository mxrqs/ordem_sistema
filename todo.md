# Sistema de Ordens de Compra e Serviço - TODO

## Banco de Dados e Backend
- [x] Criar tabelas: orders, order_items, checklists, notifications
- [x] Configurar autenticação com níveis de usuário (user, admin)
- [x] Implementar procedures tRPC para CRUD de ordens
- [x] Implementar upload de PDF para S3
- [x] Configurar sistema de notificações por email
- [x] Criar procedures para dashboard (métricas, gráficos)

## Frontend - Autenticação e Layout
- [x] Criar layout base com sidebar navigation
- [x] Implementar redirecionamento por role (user vs admin)
- [x] Criar página de login/logout
- [x] Implementar proteção de rotas

## Frontend - Usuário Padrão
- [x] Criar formulário para solicitar OS (Ordem de Serviço)
- [x] Criar formulário para solicitar OC (Ordem de Compra)
- [x] Criar página "Minhas Solicitações" com filtro por status
- [x] Implementar visualização de PDF anexado pelo admin
- [x] Criar página de Checklist
- [x] Implementar notificações de mudança de status

## Frontend - Administrador
- [x] Criar dashboard com métricas (total de solicitações)
- [x] Implementar gráfico de comparação mensal
- [x] Implementar painel de usuário que mais solicitou
- [x] Criar tabela de OS com opções de status
- [x] Criar tabela de OC com opções de status
- [x] Implementar upload de PDF para cada solicitação
- [x] Implementar filtros e busca nas tabelas

## Estilo e Design
- [x] Aplicar International Typographic Style
- [x] Configurar paleta de cores (branco, vermelho, preto)
- [x] Implementar grid system preciso
- [x] Criar componentes com dividers finos
- [x] Organizar espaçamento negativo

## Testes e Qualidade
- [x] Escrever testes vitest para procedures
- [x] Testar fluxos de autenticação
- [ ] Testar upload e download de PDF
- [ ] Testar notificações por email

## Deploy e Finalização
- [ ] Criar checkpoint final
- [ ] Testar em ambiente de produção
- [ ] Documentar instruções de uso


## Redesign do Layout (Nova Solicitação)
- [x] Criar componente DashboardLayout com sidebar navegável
- [x] Implementar menu expansível com submenu
- [x] Adaptar Orders para usar novo layout
- [x] Adaptar Checklist para usar novo layout
- [x] Adaptar AdminDashboard para usar novo layout
- [x] Adaptar AdminOrders para usar novo layout
- [x] Testar navegação e responsividade


## Redesign Novo (Order Control Style)
- [x] Atualizar paleta de cores (azul, cinza, amarelo para alertas)
- [x] Redesenhar Sidebar com logo "OC"
- [x] Reorganizar menu em seções (Solicitações, Gestão, Administração)
- [x] Redesenhar Dashboard com cards informativos
- [x] Implementar alerta amarelo para avisos pendentes
- [x] Redesenhar páginas de Orders, Checklist, Admin
- [x] Testar responsividade e UX


## Implementação do Formulário Multi-Step (Nova Solicitação)
- [x] Remover background cinza da página de Orders
- [x] Criar componente OrderForm com multi-step
- [x] Implementar seleção de tipo (OS/OC)
- [x] Implementar steps para OS (categoria, contrato, placa, fotos, KM, informe)
- [x] Implementar steps para OC (contrato, placa, fotos, KM, informe, orçamento)
- [x] Adicionar upload de fotos/evidências
- [x] Adicionar upload de orçamento (PDF/imagem)
- [x] Implementar resumo e confirmação
- [x] Testar fluxo completo


## Separação de Formulários por Tipo
- [x] Modificar Sidebar para navegar direto para formulário OS
- [x] Modificar Sidebar para navegar direto para formulário OC
- [x] Criar página FormOS.tsx com formulário multi-step para OS
- [x] Criar página FormOC.tsx com formulário multi-step para OC
- [x] Remover seleção de tipo do OrderForm
- [x] Atualizar rotas no App.tsx


## Implementação de Minhas Solicitações
- [x] Criar página MyOrders.tsx para usuários verem suas solicitações
- [x] Separar solicitações em abas: OS e OC
- [x] Implementar query tRPC para buscar apenas solicitações do usuário
- [x] Implementar query tRPC para admin buscar todas as solicitações
- [x] Atualizar Sidebar para navegar para Minhas Solicitações
- [ ] Adicionar filtros e busca nas solicitações
- [x] Testar isolamento de dados por usuário


## Melhorias Admin e Remoção de Valor OS
- [x] Remover campo Valor das Ordens de Serviço (OS)
- [x] Redesenhar AdminOrders para mostrar todas solicitações de todos usuários
- [x] Separar AdminOrders em abas OS e OC
- [x] Implementar controle de status (não iniciada, em processo, concluída)
- [x] Implementar upload de PDF pelo admin para cada solicitação
- [x] Garantir que usuário veja e baixe o PDF em Minhas Solicitações
- [x] Implementar endpoint de upload de PDF no backend


## Melhorias nos Cards e Sidebar
- [x] Adicionar campos Placa, KM e Contrato nos cards de solicitações (MyOrders e AdminOrders)
- [x] Adicionar ícones diferenciados na Sidebar para OS, OC e Minhas Solicitações
- [x] Salvar dados de placa, km e contrato no banco de dados ao criar ordem

## Novas Funcionalidades - Login, Usuários e Fotos
- [x] Criar tela de login com botão "Manter conectado"
- [x] Criar página de administração de usuários (criar, editar, excluir)
- [x] Implementar upload de fotos nas solicitações de serviço
- [x] Implementar visualização de fotos nos cards de solicitações
- [x] Adicionar galeria de fotos nas páginas MyOrders e AdminOrders


## Importação de Dados e Novas Funcionalidades
- [ ] Criar script para importar dados do Excel para o banco de dados
- [ ] Otimizar layout para mobile (responsividade)
- [ ] Criar aba de Relatórios com download de OS em PDF/Excel
- [ ] Criar aba de Relatórios com download de OC em PDF/Excel
- [ ] Testar importação e dados reais no sistema


## Alterações Solicitadas - Sprint 2

### Alteração 1 - Branding
- [x] Renomear sistema de "Order Control" para "Controle Manutenção"
- [x] Fazer upload da logo fornecida para S3
- [x] Exibir logo no topo do sidebar/header
- [x] Atualizar VITE_APP_TITLE com novo nome

### Alteração 2 - Formulário OC Passo 6
- [x] Adicionar seção "Informações de Pagamento do Fornecedor" no passo 6 do FormOC
- [x] Adicionar campo obrigatório: Nome da empresa ou prestador
- [x] Adicionar campo obrigatório: CNPJ
- [x] Adicionar campo obrigatório: Forma de pagamento (dropdown)
- [x] Implementar regra condicional: Se transferência, exibir campos adicionais
- [x] Adicionar campos condicionais: Banco, Agência, Conta, Titularidade
- [ ] Atualizar schema do banco para armazenar dados de pagamento
- [x] Testar validação e fluxo condicional

### Alteração 3 - Exclusão de Solicitações
- [x] Adicionar mutation tRPC para deletar ordem (admin only)
- [x] Adicionar coluna de ações na tabela AdminOrders com botão de exclusão
- [x] Implementar modal de confirmação antes de deletar
- [x] Testar permissões e segurança
- [x] Verificar cascata de deleção (fotos, PDFs)


## Bug Fixes - Sprint 2

### Bug: API returns HTML instead of JSON on /my-orders
- [x] Identificar a causa: race condition no render com setLocation
- [x] Implementar useEffect para redirecionamento
- [x] Adicionar enabled condicional na query tRPC
- [x] Testar a página /my-orders


### Bug: Order deletion mutation fails intermittently
- [x] Adicionar logging detalhado para diagnosticar o problema
- [x] Testar deleção múltiplas vezes para confirmar funcionamento
- [x] Remover logging de debug
- [x] Verificar cascata de deleção (fotos, itens)


### Bug: API returns HTML instead of JSON on /form/os and /form/oc
- [x] Identificar a causa: race condition no render com setLocation
- [x] Implementar useEffect para redirecionamento em FormOS.tsx
- [x] Implementar useEffect para redirecionamento em FormOC.tsx
- [x] Testar as páginas /form/os e /form/oc


### Bug: API returns HTML instead of JSON on /admin/orders
- [x] Identificar a causa: race condition no render com setLocation
- [x] Implementar useEffect para redirecionamento em AdminOrders.tsx
- [x] Testar a página /admin/orders


### Bug: URL Too Long (414) on /admin/orders with many orders
- [x] Identify root cause: Loading photos for 250+ orders in batch requests
- [x] Implement pagination with 10 items per page
- [x] Add pagination controls (Previous, page numbers, Next)
- [x] Reset to page 1 when changing tabs
- [x] Fix React hooks error (moved useEffect to correct position)
- [x] Test pagination stability


### Bug: URL Too Long (414) on /my-orders with many orders
- [x] Identify root cause: Loading photos for 600+ orders in batch requests
- [x] Implement pagination with 10 items per page on MyOrders
- [x] Add pagination controls (Previous, page numbers, Next)
- [x] Reset to page 1 when changing tabs
- [x] Test pagination stability


## Alterações Solicitadas - Sprint 3

### Alteração 1 - Filtros Avançados em MyOrders
- [x] Adicionar filtros por status (não iniciadas, em processo, concluídas)
- [x] Adicionar filtro por tipo de OS (Preventiva, Corretiva, Reforma)
- [x] Implementar UI com checkboxes ou dropdown para filtros
- [x] Aplicar filtros em tempo real na lista de solicitações
- [x] Testar combinação de múltiplos filtros

### Alteração 2 - Número Real da OS e Criador em AdminOrders
- [x] Adicionar campo "Número Real da OS" no formulário FormOS
- [ ] Adicionar campo "Criador" (quem criou a OS) no banco de dados
- [x] Exibir "Número Real da OS" em AdminOrders ao lado do upload de PDF
- [ ] Exibir "Criador" nas solicitações (além do solicitante)
- [x] Atualizar schema do banco para novos campos
- [x] Testar preenchimento e exibição dos novos campos

### Alteração 3 - Ordenação por Data de Criação
- [x] Ordenar solicitações em MyOrders por data de criação (mais recente primeiro)
- [x] Ordenar solicitações em AdminOrders por data de criação (mais recente primeiro)
- [x] Testar ordenação após criar novas solicitações


## Alterações Solicitadas - Sprint 4

### Alteração 1 - Filtros de Status em AdminOrders
- [x] Adicionar filtros de status (Não Iniciada, Em Processo, Concluída) na página AdminOrders
- [x] Implementar UI com checkboxes ou dropdown para filtros de status
- [x] Aplicar filtros em tempo real na lista de solicitações
- [x] Testar combinação de filtros com paginação

### Alteração 2 - Tipos de Arquivo para Orçamento (OC)
- [x] Restringir upload de fotos/orçamento no FormOC para apenas mídia (jpg, png, jpeg, gif) e PDF
- [x] Adicionar validação no frontend para tipos de arquivo aceitos
- [x] Exibir mensagem de erro se arquivo não for aceito
- [x] Testar upload com diferentes tipos de arquivo

### Alteração 3 - OS Informado pelo Admin
- [x] Remover campo "Número Real da OS" do FormOS (passo 2)
- [x] Adicionar campo "Número Real da OS" em AdminOrders para o admin preencher
- [x] Implementar mutation tRPC para salvar número da OS
- [x] Exibir campo como input editável em AdminOrders
- [x] Testar preenchimento e salvamento do número da OS


## Alterações Solicitadas - Sprint 5

### Alteração 1 - Visibilidade Condicional de Ordens
- [ ] Adicionar campo `isVisible` ou `orderNumber` ao banco de dados para controlar visibilidade
- [ ] Modificar query tRPC para retornar apenas ordens com número preenchido para solicitantes
- [ ] Admin continua vendo todas as ordens (com ou sem número)
- [ ] Testar que solicitante não vê ordem até admin preencher número
- [ ] Testar que ordem fica visível após admin preencher número

### Alteração 2 - Layout Responsivo Mobile
- [x] Adaptar Sidebar para mobile (menu hamburger ou collapse)
- [x] Adaptar FormOS para mobile (campos em tela cheia)
- [x] Adaptar FormOC para mobile (campos em tela cheia)
- [x] Adaptar MyOrders para mobile (cards em coluna única)
- [x] Adaptar AdminOrders para mobile (tabelas em cards)
- [x] Adaptar Checklist para mobile (step-by-step view)
- [x] Testar em diferentes tamanhos de tela (320px, 375px, 768px)

### Alteração 3 - Checklist em Step-by-Step
- [ ] Remover visualização de tabela do Checklist
- [ ] Criar componente ChecklistForm com multi-step
- [ ] Implementar steps: contrato, veículo, placa, motorista, data, km inicial, luzes, freios, pneus, óleo, água, observações, fotos, assinatura
- [ ] Adicionar botões: Voltar, Avançar, Concluir
- [ ] Implementar progresso visual (1 de 14, 2 de 14, etc.)
- [ ] Testar fluxo completo do checklist
- [ ] Testar responsividade em mobile

### Alteração 4 - Integração Completa do Fluxo
- [ ] Testar: Solicitante cria OS/OC
- [ ] Testar: Admin vê ordem em Gerenciar Ordens
- [ ] Testar: Admin preenche número da OS/OC
- [ ] Testar: Solicitante vê ordem em Minhas Solicitações
- [ ] Testar: Solicitante preenche checklist em step-by-step
- [ ] Testar: Fluxo completo em desktop e mobile


## Bug Fixes - Sprint 5

### Bug: OS/OC number field not editable in AdminOrders
- [x] Replace placeholder text with editable input field for OS number
- [x] Add same editable input for OC number in AdminOrders
- [x] Implement mutation to save OS/OC number when edited
- [x] Add visual feedback (loading state) while saving
- [x] Test editing and saving OS/OC numbers


### Sprint 5 - Mobile Responsiveness Improvements
- [x] Aplicar responsive padding (px-4 sm:px-6 md:px-8) em MyOrders e AdminOrders
- [x] Aplicar responsive text sizing (text-2xl sm:text-3xl md:text-4xl) em headings
- [x] Aplicar responsive button layout (flex-col sm:flex-row) para mobile
- [x] Testar layout em diferentes tamanhos de tela
- [x] Verificar que sidebar funciona corretamente em mobile
