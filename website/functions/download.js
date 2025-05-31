/**
 * Download an artifact that requires authentication
 * @param {Request} request 
 * @param {Env} env 
 * @returns {Response}
 */
export async function downloadArtifact(request, env) {
  // Parse the request URL
  const url = new URL(request.url);
  const artifactUrl = url.searchParams.get('url');
  
  if (!artifactUrl) {
    return new Response(
      JSON.stringify({ error: 'Artifact URL is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  try {
    // Fetch the artifact with GitHub token
    const response = await fetch(artifactUrl, {
      headers: {
        'Authorization': `token ${env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: `GitHub API error: ${errorText}` }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Return the artifact data directly, preserving content type
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    
    return new Response(response.body, {
      status: response.status,
      headers: headers
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
