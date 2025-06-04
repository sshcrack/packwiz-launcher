import { Elysia } from 'elysia';
import { GITHUB_REPO } from '../utils/constants';

// Artifact download route
export const artifactRoutes = new Elysia()
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
