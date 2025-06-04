import { cors } from '@elysiajs/cors';
import dotenv from 'dotenv';
import { Elysia } from 'elysia';
import fs from 'fs';
import path from 'path';
import { artifactRoutes } from './routes/artifact';
import { debugRoutes } from './routes/debug';
import { downloadRoutes } from './routes/download';
import { workflowRoutes } from './routes/workflow';
import { uploadsDir } from './utils/constants';

// Load environment variables
dotenv.config();

// Check for required environment variables
if (!process.env.GITHUB_TOKEN) {
    console.error('Error: GITHUB_TOKEN environment variable is not set');
    console.error('Please create a .env file with your GitHub token');
    process.exit(1);
}

if (!process.env.BASE_URL) {
    console.error('Error: BASE_URL environment variable is not set');
    console.error('Please create a .env file with your base URL');
    process.exit(1);
}

if (!process.env.TURNSTILE_SECRET) {
    console.error('Error: TURNSTILE_SECRET environment variable is not set');
    console.error('Please create a .env file with your Turnstile secret key');
    process.exit(1);
}

// Create Elysia app
const app = new Elysia()
    .use(cors({
        origin: process.env.DEBUG === "true" ? '*' : ["packwiz-launcher.sshcrack.me", "localhost", "127.0.0.1"]
    }))
    .onAfterResponse(({ set }) => {
        // Check if we need to delete a file after sending the response
        if (set.headers['on-response-sent'] && set.headers['file-to-delete']) {            const filename = set.headers['file-to-delete'] as string;
            const filepath = path.join(uploadsDir, filename);
            try {
                fs.unlinkSync(filepath);
                console.log(`Deleted file: ${filename}`);
            } catch (error) {
                console.error(`Error deleting file ${filename}:`, error);
            }
        }
    })
    // Mount all route handlers
    .use(downloadRoutes)
    .use(workflowRoutes)
    .use(artifactRoutes);

// Add debug routes if in debug mode
debugRoutes(app);

// Start server
const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
