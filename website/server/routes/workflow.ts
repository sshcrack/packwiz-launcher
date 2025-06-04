import { Elysia } from 'elysia';
import { commitFileToGitHub, getWorkflowRunByCommit } from '../utils/github';
import { REPO_OWNER, REPO_NAME } from '../utils/constants';

// Workflow trigger route
export const workflowRoutes = new Elysia()
    .post('/trigger-workflow', async ({ request, set }) => {
        let form: FormData | undefined = undefined;
        try {
            form = await request.formData();
        } catch (error: any) {
            set.status = 400;
            return { error: 'Invalid form data' };
        }

        if (!form || !form.has('token')) {
            set.status = 400;
            return { error: 'Turnstile token is required' };
        }

        const turnstileToken = form.get('token') as string | null;
        if (!turnstileToken || typeof turnstileToken !== 'string' || turnstileToken.length > 2048) {
            set.status = 400;
            return { error: 'Invalid token' };
        }

        // Verify Turnstile token
        try {
            const turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    secret: process.env.TURNSTILE_SECRET,
                    response: turnstileToken,
                    remoteip: request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || request.headers.get("X-Real-IP")
                })
            });

            const json = await turnstileResponse.json();
            if (!json.success) {
                set.status = 401;
                return { error: 'Invalid Turnstile token' };
            }

        } catch (error: any) {
            set.status = 500;
            console.error('Error verifying Turnstile token:', error);
            return { error: 'Failed to verify Turnstile token' };
        }

        try {
            // Check if an icon file was uploaded
            const iconFile = form.get('icon') as File | null;
            if (!iconFile) {
                set.status = 400;
                return { error: 'No icon file was uploaded' };
            }

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

            // Get file content as ArrayBuffer
            const iconContent = await iconFile.arrayBuffer();

            // Commit the file to GitHub repository
            console.log('Committing icon file to GitHub repository...');
            const commitResult = await commitFileToGitHub(
                'icon.ico',  // Target filename in the repository
                iconContent,
                `Update icon.ico via web interface [${new Date().toISOString()}]`
            );

            console.log('File committed successfully:', commitResult);            // Poll for the workflow run until it's found
            console.log('Polling for workflow run...');
            let workflowRun = null;
            let retryCount = 0;
            const maxRetries = 5;
            const retryDelay = 2000; // 2 seconds between retries

            while (!workflowRun && retryCount < maxRetries) {
                // Wait before checking
                await new Promise(resolve => setTimeout(resolve, retryDelay));

                // Try to get the workflow run
                workflowRun = await getWorkflowRunByCommit(
                    commitResult.commitSha,
                    'build-with-custom-icon.yml'
                );

                if (workflowRun) {
                    console.log('Workflow run found on attempt', retryCount + 1, ':', workflowRun);
                    break;
                } else {
                    console.log(`Workflow run not found, attempt ${retryCount + 1}/${maxRetries}`);
                    retryCount++;
                }
            }

            if (!workflowRun) {
                console.log('Maximum retries reached. Workflow run not found within the timeout period.')
            }            // Return the success response with commit and workflow information
            return {
                success: true,
                message: 'Icon file committed successfully to the build branch',
                commit: commitResult.commitSha,
                filename: 'icon.ico',
                // Format for frontend compatibility
                id: workflowRun ? workflowRun.id : 0,
                status: workflowRun ? workflowRun.status : 'queued',
                artifacts_url: workflowRun ? `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs/${workflowRun.id}/artifacts` : '',
                // Additional workflow info for debugging
                workflow: workflowRun ? {
                    id: workflowRun.id,
                    name: workflowRun.name,
                    status: workflowRun.status,
                    url: workflowRun.html_url
                } : {
                    message: 'Workflow not found or not yet started',
                    retries: retryCount,
                    commit: commitResult.commitSha
                }
            };
        } catch (error: any) {
            console.error('Error committing file:', error);
            set.status = 500;
            return { error: error.message };
        }
    });
