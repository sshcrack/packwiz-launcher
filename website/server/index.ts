import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Check for GitHub token
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

// Define the GitHub repository and workflow ID
const GITHUB_REPO = 'sshcrack/packwiz-launcher';
const WORKFLOW_ID = '165435937';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Create uploads directory for local storage
const uploadsDir = path.join(rootDir, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Setup file handling functions for icon uploads
const storeIcon = async (file: File) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `icon-${uniqueSuffix}.ico`;
    const filepath = path.join(uploadsDir, filename);

    const buffer = await file.arrayBuffer();
    await Bun.write(filepath, buffer);

    return {
        filename,
        size: buffer.byteLength,
    };
};

// Create Elysia app
const app = new Elysia()
    .use(cors({
        origin: '*' // Allow all origins for client-side development
    }))
    .onAfterResponse(({ set }) => {
        // Check if we need to delete a file after sending the response
        if (set.headers['on-response-sent'] && set.headers['file-to-delete']) {
            const filename = set.headers['file-to-delete'] as string;
            const filepath = path.join(uploadsDir, filename);
            try {
                fs.unlinkSync(filepath);
                console.log(`Deleted file: ${filename}`);
            } catch (error) {
                console.error(`Error deleting file ${filename}:`, error);
            }
        }
    })
    .get('/uploads/:filename', async ({ params, set }) => {
        try {
            const { filename } = params;
            const filepath = path.join(uploadsDir, filename);

            // Check if file exists
            if (!fs.existsSync(filepath)) {
                set.status = 404;
                return { error: 'File not found' };
            }

            // Read file content
            const fileContent = await Bun.file(filepath).arrayBuffer();

            // Set appropriate headers for ico file
            set.headers['Content-Type'] = 'image/x-icon';

            // Create a response with the file content
            const response = new Response(fileContent);
            // Use a response interceptor to delete the file after the response is sent
            set.headers['on-response-sent'] = 'true'; // Add a custom header to trigger the response hook

            // Store just the filename for deletion in a custom property
            set.headers['file-to-delete'] = filename;

            response.headers.set('Connection', 'close'); // Ensure connection is closed after response

            return response;
        } catch (error: any) {
            console.error('Error serving icon file:', error);
            set.status = 500;
            return { error: error.message };
        }
    })
    .post('/trigger-workflow', async ({ request, set }) => {
        try {
            const form = await request.formData();
            let iconUrl = null;

            // Check if an icon file was uploaded
            const iconFile = form.get('icon') as File | null;
            if (iconFile) {
                // Validate icon file
                const fileExtension = iconFile.name.substring(iconFile.name.lastIndexOf('.')).toLowerCase();
                if (fileExtension !== '.ico' && iconFile.type !== 'image/x-icon') {
                    set.status = 400;
                    return { error: 'Only .ico files are allowed' };
                }

                // Check file size (1MB limit)
                if (iconFile.size > 1024 * 1024) {
                    set.status = 400;
                    return { error: 'File size exceeds 1MB limit' };
                }

                // Store the file
                const { filename } = await storeIcon(iconFile);

                // Create the URL to access the file
                iconUrl = `${process.env.BASE_URL}/uploads/${filename}`;
            }

            // Create inputs object with icon URL if available
            const inputs: Record<string, string> = {};
            if (iconUrl) {
                inputs.icon_url = iconUrl;
            }

            // GitHub API endpoint for triggering workflows - using server-side constants
            const url = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${WORKFLOW_ID}/dispatches`;

            // Trigger the workflow
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ref: 'master',
                    inputs,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                set.status = response.status;
                return { error: `GitHub API error: ${errorText}` };
            }

            // Get the workflow run ID
            const runsResponse = await fetch(
                `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${WORKFLOW_ID}/runs?per_page=1`,
                {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                    },
                }
            );

            if (!runsResponse.ok) {
                const errorText = await runsResponse.text();
                set.status = runsResponse.status;
                return { error: `Failed to get workflow runs: ${errorText}` };
            }

            const runsData = await runsResponse.json();
            const latestRun = runsData.workflow_runs[0];

            return {
                id: latestRun.id,
                status: latestRun.status,
                artifacts_url: latestRun.artifacts_url
            };
        } catch (error: any) {
            console.error('Error triggering workflow:', error);
            set.status = 500;
            return { error: error.message };
        }
    })
    .get('/download-artifact/:artifactId', async ({ params, set }) => {
        try {
            const { artifactId } = params;

            if (!artifactId) {
                set.status = 400;
                return { error: 'Artifact ID is required' };
            }

            // Construct the URL using only the artifact ID
            const url = `https://api.github.com/repos/${GITHUB_REPO}/actions/artifacts/${artifactId}/zip`;

            // Download the artifact with GitHub token
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                set.status = response.status;
                return { error: `GitHub API error: ${errorText}` };
            }

            // Set appropriate headers for streaming
            set.headers['Content-Type'] = response.headers.get('content-type') || 'application/octet-stream';
            set.headers['Content-Disposition'] = response.headers.get('content-disposition') || 'attachment';

            // Return the response body directly to stream it to the client
            return new Response(response.body);
        } catch (error: any) {
            console.error('Error downloading artifact:', error);
            set.status = 500;
            return { error: error.message };
        }
    });

// Start server
const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
