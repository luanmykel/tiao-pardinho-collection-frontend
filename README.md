# Collection Tião Carreiro & Pardinho (v2) – Frontend

O **Top 5 Tião Carreiro**, evoluiu para a v2: agora **Collection Tião Carreiro & Pardinho** 😁,
com layout responsivo e integração por API REST com o backend.

---

### Frameworks e Bibliotecas

- **React 19** – Base da SPA.
- **React Router DOM** – Navegação entre páginas.
- **Vite 7** – Build e Dev Server.
- **TypeScript 5** – Tipagem estática.
- **Mantine 7** – Componentes UI modernos e responsivos (dark/light mode).
- **Mantine Carousel** – Carrossel de músicas.
- **Mantine Notifications** – Notificações.
- **Tabler Icons React** – Ícones vetoriais.
- **TanStack React Query** – Gerenciamento de estado assíncrono e cache.
- **Axios** – Cliente HTTP para a API REST.
- **NProgress** – Indicador de carregamento.
- **Vitest** – Test runner.
- **Testing Library React** – Testes de componentes.
- **Jest DOM** – Matchers adicionais para DOM.
- **User Event** – Simulação de interações.
- **ESLint + Plugins** – Padronização de código.
- **Prettier** – Formatação consistente.
- **Emotion** – Estilização com CSS-in-JS.

---

## Estrutura

- **Painel Administrativo**
    - Aprovar/Reprovar sugestões.
    - Excluir músicas.
    - Pesquisar registros.
    - Gerenciar usuários (criar, editar, excluir).
    - Alterar avatar do perfil.

- **Página Pública**
    - Busca de músicas cadastradas.
    - Sugestão de novas músicas (via link do YouTube).
    - Destaque para o **Top 5 músicas mais tocadas**.
    - Carrossel interativo com as demais músicas.
    - Modal com player do YouTube embutido.
    - Acesso rápido ao link oficial do vídeo no YouTube.

---

### Desenvolvimento Local

#### Requisitos
Node.js 20+ e npm 10+

```bash
git clone https://github.com/luanmykel/tiao-pardinho-collection-frontend.git

cp .env.example .env

npm install
npm run dev
````
( ajustar a url da api do backend no .env )

### Testes

```bash
npm test
```

Ou simplesmente 😊

### Docker (Frontend + Backend)

#### Requisitos
Docker 24+ e Docker Compose v2+

```bash
git clone https://github.com/luanmykel/tiao-pardinho-collection-frontend.git

docker compose up --build
# ou em segundo plano
docker compose up --build -d
```

- Acesso: http://localhost:8080/
- Admin: http://localhost:8080/admin
- Usuário: admin@teste.com
- Senha:   secret123

O serviço utiliza **Nginx** como servidor web e proxy para o backend, configurado para:

* Redirecionar `/api/` para o container `collection-api`.
* Servir os arquivos estáticos do frontend.
* Aplicar fallback SPA (`index.html`).

---

## Live Demo

**[Collection Tião Carreiro & Pardinho](https://collection.lmdev.space/)**
**[Collection Tião Carreiro & Pardinho - Admin](https://collection.lmdev.space/admin)**

### Credenciais de Acesso

```
Usuário: admin@teste.com
Senha:   secret123
```
