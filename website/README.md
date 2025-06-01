# Minecraft Modpack Installer Generator

This project is a web application for generating custom Minecraft modpack installers. It allows you to create branded installers with your own logo, Minecraft block background, and theme (dark or light), making it easy for players to install your modpack.

## Features

- Custom branding (logo, Minecraft block background, dark/light theme)
- Packwiz integration
- Custom icon support
- Easy to use web interface
- Bun+Express server for API endpoints
- Local file storage for uploaded assets

## Requirements

- Node.js 18+ or Bun 1.0+
- PNPM 8+

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

Create a `.env` file in the project root with the following content:

```
GITHUB_TOKEN=your_github_personal_access_token
PORT=3001
```

4. Start the development servers:

For the frontend:
```bash
pnpm dev
```

For the backend (in a separate terminal):
```bash
pnpm dev:server
```

## Running in Production

To build and run the application in production mode:

```bash
# Build the frontend
pnpm build

# Start the server (serves both API and static files)
pnpm start
```

Or use the combined command:
```bash
pnpm deploy
```

## How It Works

1. User provides modpack configuration information
2. If a custom icon is provided, it's converted to .ico format and uploaded to the server
3. The GitHub Actions workflow is triggered to build a custom installer (if custom icon is used)
4. The modpack configuration is encoded as JSON and appended to the executable
5. The user can download the final installer

### File Storage

This application uses the local filesystem for storing uploaded icons. The files are stored in the `server/uploads/icons` directory, which is automatically created when the server starts.

### API Endpoints

The server provides the following API endpoints:

- `POST /api/trigger-workflow`: Triggers a GitHub Actions workflow to build a custom installer
- `GET /api/latest-release`: Gets the latest release of the modpack installer
- `GET /api/workflow-status`: Checks the status of a GitHub workflow run
- `GET /api/workflow-artifacts`: Gets the artifacts from a completed workflow run
- `POST /api/upload-icon`: Uploads a custom icon for the installer
- `GET /api/download-artifact`: Downloads an artifact from a workflow run

## License

[MIT License](LICENSE)

## Migrating from Cloudflare Workers

This project has been migrated from Cloudflare Workers to a Bun+Express server with local file storage. The following files are no longer needed and can be safely removed:

- `worker.js` - Replaced with `server/index.ts`
- `wrangler.toml` and `wrangler.jsonc` - Cloudflare Workers configuration
- `functions/github.js` - Replaced with `server/routes/github.ts`
- `functions/download.js` - Functionality moved to server routes
- `setup_r2.ps1` - R2 storage setup script
- `test_r2_access.ps1` - R2 storage test script
- `R2_SETUP.md` - R2 storage documentation
- `R2_USAGE_LIMITS.md` - R2 usage limits documentation

To remove these files, you can run:

```bash
rm worker.js wrangler.toml wrangler.jsonc setup_r2.ps1 test_r2_access.ps1 R2_SETUP.md R2_USAGE_LIMITS.md
rm -r functions/
```
