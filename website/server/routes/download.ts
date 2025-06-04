import { Elysia } from 'elysia';
import { getLatestReleaseUrl } from '../utils/github';

// Add the download route for the launcher executable
export const downloadRoutes = new Elysia()
    .get('/download', async ({ set }) => {
        try {
            // Get the latest release URL (cached if available)
            const downloadUrl = await getLatestReleaseUrl();

            // Fetch the file from GitHub
            const response = await fetch(downloadUrl, {
                headers: {
                    'Accept': 'application/octet-stream',
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
            set.headers['Content-Disposition'] = 'attachment; filename="modpack-installer.exe"';

            // Stream the response directly to the client
            return new Response(response.body);
        } catch (error: any) {
            console.error('Error downloading launcher:', error);
            set.status = 500;
            return { error: error.message };
        }
    });
