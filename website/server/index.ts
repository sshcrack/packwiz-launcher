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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Create uploads directory for local storage
const uploadsDir = path.join(rootDir, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create icons directory specifically for icon uploads
const iconsDir = path.join(uploadsDir, 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Setup file handling functions for icon uploads
const storeIcon = async (file: File) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = '.ico';
    const filename = `icon-${uniqueSuffix}${extension}`;
    const filepath = path.join(iconsDir, filename);

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
        origin: 'sshcrack.github.io'
    }))
    // Make uploads directory accessible
    .use(staticPlugin({
        assets: uploadsDir,
        prefix: '/uploads'
    }))
    .post('/trigger-workflow', async ({ body, set }) => {
        try {
            const { repo, workflow_id, inputs } = body as { repo: string, workflow_id: string, inputs: any };

            // GitHub API endpoint for triggering workflows
            const url = `https://api.github.com/repos/${repo}/actions/workflows/${workflow_id}/dispatches`;

            // Trigger the workflow
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ref: 'main', // or any other branch
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
                `https://api.github.com/repos/${repo}/actions/workflows/${workflow_id}/runs?per_page=1`,
                {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
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
                artifacts_url: latestRun.artifacts_url,
            };
        } catch (error: any) {
            console.error('Error triggering workflow:', error);
            set.status = 500;
            return { error: error.message };
        }
    }, {
        body: t.Object({
            repo: t.String(),
            workflow_id: t.String(),
            inputs: t.Object({})
        })
    })
    .get('/latest-release', async ({ query, set }) => {
        try {
            const { repo } = query as { repo: string };

            if (!repo) {
                set.status = 400;
                return { error: 'Repository name is required' };
            }

            // Get the latest release
            const response = await fetch(
                `https://api.github.com/repos/${repo}/releases/latest`,
                {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                    },
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                set.status = response.status;
                return { error: `GitHub API error: ${errorText}` };
            }

            const data = await response.json();

            // Find the modpack-installer.exe asset
            const asset = data.assets.find((a: any) => a.name === 'modpack-installer.exe');

            if (!asset) {
                set.status = 404;
                return { error: 'No modpack-installer.exe found in the latest release' };
            }

            return {
                download_url: asset.browser_download_url,
                release_name: data.name,
                release_tag: data.tag_name,
            };
        } catch (error: any) {
            console.error('Error getting latest release:', error);
            set.status = 500;
            return { error: error.message };
        }
    })
    .get('/workflow-status', async ({ query, set }) => {
        try {
            const { run_id } = query as { run_id: string };

            if (!run_id) {
                set.status = 400;
                return { error: 'Workflow run ID is required' };
            }

            // Get the workflow run status
            const response = await fetch(
                `https://api.github.com/repos/sshcrack/packwiz-launcher/actions/runs/${run_id}`,
                {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                    },
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                set.status = response.status;
                return { error: `GitHub API error: ${errorText}` };
            }

            const data = await response.json();

            return {
                id: data.id,
                status: data.status,
                conclusion: data.conclusion,
            };
        } catch (error: any) {
            console.error('Error checking workflow status:', error);
            set.status = 500;
            return { error: error.message };
        }
    })
    .get('/workflow-artifacts', async ({ query, set }) => {
        try {
            const { run_id } = query as { run_id: string };

            if (!run_id) {
                set.status = 400;
                return { error: 'Workflow run ID is required' };
            }

            // Get the workflow artifacts
            const response = await fetch(
                `https://api.github.com/repos/sshcrack/packwiz-launcher/actions/runs/${run_id}/artifacts`,
                {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                    },
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                set.status = response.status;
                return { error: `GitHub API error: ${errorText}` };
            }

            const data = await response.json();

            // Add download URLs to each artifact
            const artifacts = data.artifacts.map((artifact: any) => ({
                ...artifact,
                // This URL will need to be authorized with the GitHub token
                archive_download_url: artifact.archive_download_url,
            }));

            return { artifacts };
        } catch (error: any) {
            console.error('Error getting workflow artifacts:', error);
            set.status = 500;
            return { error: error.message };
        }
    })
    .post('/upload-icon', async ({ request, set }) => {
        try {
            const form = await request.formData();
            const iconFile = form.get('icon') as File;

            if (!iconFile) {
                set.status = 400;
                return { error: 'No icon file provided' };
            }

            // Check file type (only accept .ico files)
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
            const { filename, size } = await storeIcon(iconFile);

            // Create the URL to access the file
            const protocol = request.headers.get('x-forwarded-proto') || 'http';
            const host = request.headers.get('host');
            const baseUrl = `${protocol}://${host}`;
            const fileUrl = `${baseUrl}/uploads/icons/${filename}`;

            return {
                url: fileUrl,
                filename,
                size,
            };
        } catch (error: any) {
            console.error('Error uploading icon:', error);
            set.status = 500;
            return { error: error.message };
        }
    })
    .get('/download-artifact', async ({ query, set }) => {
        try {
            const { url } = query as { url: string };

            if (!url) {
                set.status = 400;
                return { error: 'URL is required' };
            }

            // Download the artifact
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                set.status = response.status;
                return { error: `GitHub API error: ${errorText}` };
            }

            // Stream the response back to the client
            set.headers['Content-Type'] = response.headers.get('content-type') || 'application/octet-stream';
            set.headers['Content-Disposition'] = response.headers.get('content-disposition') || 'attachment';

            // Return the buffer
            const buffer = await response.arrayBuffer();
            return Buffer.from(buffer);
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
