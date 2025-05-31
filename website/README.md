# Minecraft Modpack Installer Generator

This project is a web application for generating custom Minecraft modpack installers. It allows you to create branded installers with your own logo, Minecraft block background, and theme (dark or light), making it easy for players to install your modpack.

## Features

- Custom branding (logo, Minecraft block background, dark/light theme)
- Packwiz integration
- Custom icon support
- Easy to use web interface
- Client-side processing for fast operation
- Cloudflare Workers for serverless API endpoints

## Requirements

- Node.js 18+
- PNPM 8+
- Cloudflare account (for deployment)

## Quick Start

If you're on Windows, you can use the provided setup script:

```bash
./setup.ps1
```

This will install dependencies, create template configuration files, and start the development server.

## Development Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/modpack-installer-generator.git
cd modpack-installer-generator
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

Create a `.dev.vars` file in the project root with the following content:

```
GITHUB_TOKEN=your_github_personal_access_token
```

The GitHub token is used only for operations that require authentication:
- Triggering GitHub Actions workflows
- Downloading artifacts from private repositories
- Uploading icons for custom installers

For most other GitHub API operations, direct client-side calls are used without needing authentication.

The GitHub token needs the following permissions:
- `workflow` scope to trigger GitHub Actions
- `read:packages` to access artifacts

4. Start the development server:

```bash
pnpm dev
```

## Building for Production

To build the application for production, run:

```bash
pnpm build
```

## Deployment

This application is designed to be deployed to Cloudflare Workers. To deploy:

1. Configure your Cloudflare account in wrangler.toml
2. Deploy with:

```bash
pnpm deploy
```

## How It Works

1. User provides modpack configuration information
2. If a custom icon is provided, it's converted to .ico format and uploaded
3. The GitHub Actions workflow is triggered to build a custom installer (if custom icon is used)
4. The modpack configuration is encoded as JSON and appended to the executable
5. The user can download the final installer

## License

[MIT License](LICENSE)
