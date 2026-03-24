# GitHub Actions & Environment Setup Guide

To enable automated deployment and domain replacement, you must configure your GitHub repository with the following secrets.

## 🔑 GitHub Secrets Configuration

Go to your repository: **Settings > Secrets and variables > Actions > New repository secret**.

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `SERVER_HOST` | The IP address or domain of your VPS. | `66.154.xxx.xxx` |
| `SERVER_USER` | The SSH user for deployment. | `root` |
| `SSH_PRIVATE_KEY` | Your SSH private key (OpenSSH format). | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `APP_URL` | Your production domain (with protocol, no trailing slash). | `https://yourdomain.com` |
| `NEXTAUTH_SECRET` | A secure random string for authentication. | `openssl rand -base64 32` |

## 🛠️ Local Environment Setup

1. **Clone & Install**:
   ```bash
   git clone <your-repo-url>
   cd loricamaris
   npm install
   ```
2. **Environment File**:
   Copy `.env.example` to `.env` and fill in your local development values.
   ```bash
   cp .env.example .env
   ```
3. **Database**:
   Initialize the SQLite database and run migrations.
   ```bash
   npx prisma migrate dev
   ```

## 🚀 Deployment Workflow

1. **Push to Release**:
   The automated deployment is triggered when you push code to the `release` branch.
2. **Domain Replacement**:
   The workflow will automatically find `__DOMAIN__` placeholders in your skill documentation and replace them with your `APP_URL` secret.
3. **Docker Build**:
   The workflow builds a production-ready Docker image with your environment variables baked into the client bundle.
4. **VPS Restart**:
   The image is transferred to your VPS, loaded into Docker, and restarted using `docker compose`.
