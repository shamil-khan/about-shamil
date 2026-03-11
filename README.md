<div align="center">
  <br />
  <img src="apps/web/public/favicon/favicon.svg" alt="App icon" width="80" />
  <h1>About Shamil – CV Application</h1>
  <p><b>A full‑stack curriculum vitae platform with REST API and multilingual web frontend.</b></p>

  <p>
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node" />
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
    <img src="https://img.shields.io/badge/License-AGPL-green?style=for-the-badge" alt="License" />
  </p>

  <p>
    <a href="https://www.buymeacoffee.com/shamilkhan" target="_blank">
      <img src="https://img.shields.io/badge/Sponsor-Buy_Me_A_Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee" />
    </a>
    <a href="https://ko-fi.com/shamilkhan" target="_blank">
      <img src="https://img.shields.io/badge/Sponsor-Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white" alt="Ko-fi" />
    </a>
  </p>
</div>

<br />

## 📖 Summary

The **About Shamil** repository hosts a monorepo with two applications:
- **apps/api** – a RESTful backend built with [Hono](https://hono.dev) and deployed as a Cloudflare Worker.
- **apps/web** – a Vite‑powered React frontend that renders CV dashboards, admin panels and print‑friendly layouts.

The system allows users to manage multiple CV profiles in several languages, view a polished dashboard of the CV content, and generate an intelligent print layout that respects page limits. A system administrator can manage all users, while individual users access a dedicated profile editor. Multilingual support currently covers 10 languages and will eventually be enhanced by AI translation.

This boilerplate is designed to be lightweight, easy to run via Docker, and extendable for future upload formats (JSON/YAML/TOML today, PDF/Doc later).

---

## 🛠 Tech Stack

| Technology | Role | Logo |
| :--- | :--- | :--- |
| **TypeScript** | Language for both frontend & backend | <img src="https://skillicons.dev/icons?i=ts" width="24" align="absmiddle" /> |
| **Node.js** | Runtime (Cloudflare Workers & tooling) | <img src="https://skillicons.dev/icons?i=nodejs" width="24" align="absmiddle" /> |
| **React** | Web UI library | <img src="https://skillicons.dev/icons?i=react" width="24" align="absmiddle" /> |
| **Vite** | Frontend bundler/dev server | <img src="https://skillicons.dev/icons?i=vite" width="24" align="absmiddle" /> |
| **pnpm / Turbo** | Monorepo package manager & task runner | <img src="https://skillicons.dev/icons?i=pnpm" width="24" align="absmiddle" /> |
| **Hono** | Backend framework for Cloudflare Workers | <img src="https://skillicons.dev/icons?i=hono" width="24" align="absmiddle" /> |
| **Redis (Upstash)** | Persistent storage for CV profiles | <img src="https://skillicons.dev/icons?i=redis" width="24" align="absmiddle" /> |
| **Docker & docker‑compose** | Development environment orchestration | <img src="https://skillicons.dev/icons?i=docker" width="24" align="absmiddle" /> |

*Note: the web app also uses Radix UI components, TailwindCSS, Lucide icons, and other modern UI libraries.*

---

## ✨ Feature Highlights

* 📄 **Dashboard view** – renders every field of a CV profile with responsive styling.
* 🖨️ **Intelligent print layout** – automatically reorganises content to fit on physical pages while keeping aesthetics.
* 👤 **User‑admin panel** – each user may manage multiple CV profiles across supported languages.
* ⚙️ **System‑admin panel** – manage all registered users and their profiles.
* 🌐 **Multilingual first** – supports English, Urdu, Arabic, French, German, Dutch, Spanish, Italian, Japanese, Portuguese (see `apps/web/src/config/languages.ts`).
* 📁 **Upload formats** – currently accepts JSON, YAML, and TOML documents; future support for PDF/DOC.
* 📡 **API documentation** – explore endpoints at `https://<host>/api/docs` and Swagger UI at `/api/docs/swagger`.
* 🔄 **Parsing engine** – backend interprets CV documents in the chosen language and constructs UI data automatically. AI translation integration is planned.

---

## 🏛 Architecture

The repo is organised as a pnpm/turbo monorepo with two primary packages:

```
/apps
  /api   ← Cloudflare worker REST API (Hono, Upstash Redis)
  /web   ← Vite + React frontend
```

A `docker-compose.yml` file spins up any local services and the API/web servers for development. The API runs in a worker on Cloudflare and exposes a simple JSON interface; the frontend calls it for all data. Turbo provides cross‑package build, lint, and test orchestration.

---

## ⚙️ Setup & Installation

```bash
# clone the repository
git clone https://github.com/your-username/about-shamil.git
cd about-shamil

# install dependencies in the workspace
pnpm install

# bring up services via Docker (Redis etc.)
docker compose up -d

# start development servers (frontend + API)
pnpm run dev

# run linting and tests across packages
pnpm run lint
pnpm run test
```

> The monorepo uses `pnpm` and `turbo`; ensure both are installed globally or via npx.

Environment variables are managed per‑package; see `.env.example` files or the root `scripts/set-env` for guidance.

---

## 🤝 Contributing

1. **Fork** the repository on GitHub.
2. Create a topic branch: `git checkout -b feat/awesome`.
3. Run the dev environment as shown above.
4. Make your changes, add tests if applicable.
5. Keep linting/formatting clean: `pnpm run lint` & `pnpm run format:check`.
6. Commit with a meaningful message and open a Pull Request.

Please add corresponding tests for backend or frontend logic when introducing new behaviour.

---

## 💖 Sponsor & Support

If you find this project useful, consider supporting its development:

<p>
  <a href="https://www.buymeacoffee.com/shamilkhan" target="_blank">
    <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" width="180" />
  </a>
  &nbsp;&nbsp;&nbsp;
  <a href="https://ko-fi.com/shamilkhan" target="_blank">
    <img src="https://storage.ko-fi.com/cdn/kofi3.png?v=3" alt="Ko-fi" width="180" />
  </a>
</p>

---

## 📜 License

This repository is released under the **GNU Affero General Public License v3.0 (AGPL-3.0)**. See the [LICENSE](./LICENSE) file for details.

---

<br/>
<div align="center">
  <sub>Built with ❤️ by <b>Shamil Khan</b></sub><br/>
  <sup>© 2026 Shamil Khan. All Rights Reserved.</sup>
</div>

