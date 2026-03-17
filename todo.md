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
