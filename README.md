# Incremental Quest

A cross-platform incremental game built with Next.js, Tailwind CSS, and Prisma.
Supports Web, PC, Mobile, and Discord Activity.

## Features

- **Incremental Gameplay**: Click to earn gold, buy upgrades, and earn passive income.
- **Cross-Platform Sync**: Progress is saved to the database and synced across devices via Discord Login.
- **Discord Activity**: Ready to be embedded as a Discord Activity.
- **Responsive Design**: Works on Desktop and Mobile.

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env` file (or use the existing one) with the following:
    ```env
    DATABASE_URL="file:./dev.db"
    NEXTAUTH_SECRET="your_secret_key"
    NEXTAUTH_URL="http://localhost:3000"
    DISCORD_CLIENT_ID="your_discord_client_id"
    DISCORD_CLIENT_SECRET="your_discord_client_secret"
    NEXT_PUBLIC_DISCORD_CLIENT_ID="your_discord_client_id"
    ```

3.  **Database Setup**:
    ```bash
    npx prisma db push
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## Discord Configuration

To use Discord Login and Activity features:
1.  Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2.  Create a new Application.
3.  Get the Client ID and Client Secret.
4.  Add `http://localhost:3000/api/auth/callback/discord` to the Redirects.
5.  For Activity: Enable "Activities" and set the URL Mapping to your deployed URL (or tunnel for local dev).

## Cross-Platform Deployment

- **Web**: Deploy to Vercel or any Node.js host.
- **PC/Mobile**: This web app is PWA-ready. You can also wrap it using Electron (PC) or Capacitor (Mobile) for native app stores.

