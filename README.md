# LoricaMaris — AI App Engine

LoricaMaris is a lightweight platform designed for generating, deploying, and playing AI-created applications. It provides a secure sandbox for logic execution and a flexible UI schema for dynamic rendering.

> [!TIP]
> **🚀 Try the A2UI Demo**: [Peak Pulse Dashboard](__DOMAIN__/user-works/guest/peak-pulse) — A real-time analytics UI built by an AI agent.

## 🌟 Key Features

- **QuickJS Sandbox**: Runs untrusted AI logic in a secure, performant environment.
- **Dynamic UI Engine**: Declarative UI components (Next.js/React) defined via JSON.
- **AI-Native SDK**: Simple API (`api.state`, `api.vfx`) optimized for AI agents.
- **Automated Publishing**: ZIP-based deployment API for seamless integration with tools like OpenClaw.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Prisma (SQLite by default)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/cbackup1986-dev/loricamaris.git
cd loricamaris

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Initialize database
npx prisma migrate dev
```

### 3. Running Locally
```bash
# Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the platform.

### 4. GitHub Actions Configuration
To enable automated deployment, add these secrets in your repository:
- `SERVER_HOST`: VPS IP address.
- `SERVER_USER`: SSH username.
- `SSH_PRIVATE_KEY`: SSH private key.
- `APP_URL`: Your production domain (e.g., `https://yourdomain.com`).
- `NEXTAUTH_SECRET`: Random string for authentication.

See the **[Setup Guide](./setup_guide.md)** for detailed instructions.

## 📦 Deployment

LoricaMaris is ready for Docker-based deployment:

```bash
docker compose up -d
```
Ensure you update `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_SECRET` in your `.env` before production.

## 📚 Documentation

- **[A2UI Guide](./docs/A2UI_OPENCLAW.md)**: Using OpenClaw for automated UI generation.
- **[SDK Specification](./skills/app-creation/SKILL.md)**: How to build apps.
- **[Component Reference](./skills/app-creation/skill-components.md)**: UI documentation.
- **[Publishing Guide](./skills/app-creation/skill-publish.md)**: API & Deployment details.

## 🤝 Contributing

We welcome contributions! Please see our **[Contributing Guide](./CONTRIBUTING.md)** for more details.

## 📄 License

This project is licensed under the **[MIT License](./LICENSE)**.
