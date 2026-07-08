# Estrutura do frontend ToffCo

Este documento explica onde cada responsabilidade está localizada.

## Fluxo principal

1. `src/main.tsx` inicia o React.
2. `src/App.tsx` entrega a aplicação ao roteador.
3. `src/routes/AppRouter.tsx` associa URLs às páginas.
4. `src/routes/ProtectedRoute.tsx` impede acesso às páginas internas sem JWT.
5. As páginas chamam arquivos de `services/`.
6. Os serviços usam a instância Axios definida em `src/lib/api.ts`.
7. O interceptor do Axios adiciona `Authorization: Bearer <token>`.

## Pastas

- `components/catalog`: componentes reutilizáveis do catálogo.
- `components/layout`: estruturas compartilhadas como menu, autenticação e footer.
- `components/ui`: elementos visuais básicos, como botão e input.
- `features/catalog`: dados locais usados somente pela landing page pública.
- `hooks`: lógica React reutilizável, como consulta de produtos.
- `lib`: configuração técnica e tratamento de erros.
- `pages`: uma página por rota da aplicação.
- `routes`: definição e proteção das rotas.
- `services`: comunicação com as rotas do backend.
- `types`: contratos TypeScript equivalentes aos DTOs Java.

## Rotas frontend

| Rota | Página | Origem dos dados |
| --- | --- | --- |
| `/` | Landing page pública | Dados demonstrativos locais |
| `/login` | Login | `POST /api/auth/login` |
| `/cadastro` | Cadastro | `POST /api/auth/register` |
| `/dashboard` | Início do usuário | `GET /api/produtos` |
| `/catalogo` | Lista completa | `GET /api/produtos` |
| `/produtos/:id` | Detalhe do produto | `GET /api/produtos/{id}` |
| `/favoritos` | Tela bloqueada | Aguarda endpoints no backend |
| `/carrinho` | Tela bloqueada | Endpoint atual retorna erro |
| `/pedidos` | Tela bloqueada | Aguarda endpoint no backend |
| `/conta` | Dados da conta | Dados salvos durante o login |
| `/integracoes` | Tela bloqueada | Aguarda endpoints OAuth no backend |

## Serviços

### `auth-service.ts`

Faz cadastro e login, salva tokens e encerra a sessão. O backend não retorna o
nome no login, então a tela usa o e-mail como identificação até existir uma
rota como `GET /api/users/me`.

### `product-service.ts`

Lista e busca produtos. Também normaliza URLs de imagens e mantém
compatibilidade com a versão antiga do container que ainda não retorna
`categoria`.

### `cart-service.ts`

Contém o contrato preparado para consulta, adição e remoção de itens. Ele não é
chamado pela interface enquanto `GET /api/carrinhos` estiver retornando HTTP
500.

### `favorite-service.ts`

Arquivo legado sem uso pela interface. Favoritos permanecem bloqueados até
existirem rotas próprias no backend, evitando dados diferentes entre
dispositivos ou navegadores.

## Variáveis de ambiente

```env
VITE_API_URL=http://localhost:8081/api
VITE_API_ASSET_URL=http://localhost:8081
```

## Observações do contrato atual

- As rotas internas e os produtos exigem JWT.
- Favoritos, carrinho, pedidos e integrações estão desabilitados na navegação.
- As URLs desses recursos exibem somente uma explicação, sem chamadas ou
  alterações locais.
- O código Java já possui `categoria` no `ProdutoResponseDTO`.
- O container testado ainda retornou a versão antiga sem `categoria`; ele
  precisa ser reconstruído para publicar o DTO novo.
- `ItemCarrinhoResponseDTO` retorna somente `id`. Para mostrar nome, imagem,
  quantidade e preço por item no carrinho, o backend precisará acrescentar
  esses campos ao DTO.
- Não existem rotas de pedidos, favoritos ou perfil individual.
