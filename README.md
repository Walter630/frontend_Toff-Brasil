# ToffCo Frontend

Frontend do sistema de catálogo de impressões 3D e filamentos.

## Tecnologias

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios

## Executar

```bash
cd frontend
cp .env.example .env
npm run dev
```

O endereço padrão é `http://localhost:5173`.

## Ambiente local com backend

Para testar o backend local sem publicar o frontend, use:

```bash
cd frontend
npm run dev
```

O arquivo `.env.development.local` aponta o frontend para `/api` e o proxy do
Vite encaminha essas chamadas para `http://localhost:8081`. Assim o navegador
enxerga as requisições como `http://localhost:5173/api/...`, evitando CORS no
desenvolvimento e ajudando a separar problema de rota de problema de cabeçalho
no backend.

Se o backend subir em outra porta, altere:

```env
VITE_BACKEND_URL=http://localhost:8081
```
