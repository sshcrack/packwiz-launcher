// Main Cloudflare Worker script
import { checkWorkflowStatus, getLatestRelease, getWorkflowArtifacts, triggerWorkflow, uploadIcon } from './functions/github';
import { downloadArtifact } from './functions/download';

/**
 * Environment interface for Cloudflare Worker
 * @typedef {Object} Env
 * @property {string} GITHUB_TOKEN - GitHub personal access token
 */

export default {
  /**
   * Handle incoming requests
   * @param {Request} request
   * @param {Env} env
   * @param {ExecutionContext} ctx
   * @returns {Promise<Response>}
   */
  async fetch(request, env, ctx) {
    // Get the request URL
    const url = new URL(request.url);
    const path = url.pathname;
      // Handle API routes
    if (path.startsWith('/api/')) {
      // Create a headers object with CORS settings
      const headers = new Headers({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      });
      
      // Handle OPTIONS request for CORS preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers });
      }
        // API route handling
      let response;
      if (path === '/api/trigger-workflow' && request.method === 'POST') {
        response = await triggerWorkflow(request, env);
      } else if (path === '/api/latest-release' && request.method === 'GET') {
        response = await getLatestRelease(request, env);
      } else if (path === '/api/workflow-status' && request.method === 'GET') {
        response = await checkWorkflowStatus(request, env);
      } else if (path === '/api/workflow-artifacts' && request.method === 'GET') {
        response = await getWorkflowArtifacts(request, env);
      } else if (path === '/api/upload-icon' && request.method === 'POST') {
        response = await uploadIcon(request, env);
      } else if (path === '/api/download-artifact' && request.method === 'GET') {
        response = await downloadArtifact(request, env);
      } else {
        // If no API route matched
        response = new Response(
          JSON.stringify({ error: 'API route not found' }),
          { status: 404, headers }
        );
      }
      
      // Add CORS headers to the response
      const originalHeaders = new Headers(response.headers);
      headers.forEach((value, key) => {
        if (!originalHeaders.has(key)) {
          originalHeaders.set(key, value);
        }
      });
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: originalHeaders,
      });
    }
    
    // Serve static assets
    return env.ASSETS.fetch(request);
  },
};
