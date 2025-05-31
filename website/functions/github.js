// Cloudflare Worker functions for GitHub API interactions

/**
 * Trigger a GitHub workflow
 * @param {Request} request 
 * @param {Env} env 
 * @returns {Response}
 */
export async function triggerWorkflow(request, env) {
  // Parse the request body
  const { repo, workflow_id, inputs } = await request.json();
  
  // GitHub API endpoint for triggering workflows
  const url = `https://api.github.com/repos/${repo}/actions/workflows/${workflow_id}/dispatches`;
  
  try {
    // Trigger the workflow
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ref: 'main', // or any other branch
        inputs,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: `GitHub API error: ${errorText}` }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Get the workflow run ID
    const runsResponse = await fetch(
      `https://api.github.com/repos/${repo}/actions/workflows/${workflow_id}/runs?per_page=1`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${env.GITHUB_TOKEN}`,
        },
      }
    );
    
    if (!runsResponse.ok) {
      const errorText = await runsResponse.text();
      return new Response(
        JSON.stringify({ error: `Failed to get workflow runs: ${errorText}` }),
        { status: runsResponse.status, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const runsData = await runsResponse.json();
    const latestRun = runsData.workflow_runs[0];
    
    return new Response(
      JSON.stringify({
        id: latestRun.id,
        status: latestRun.status,
        artifacts_url: latestRun.artifacts_url,
      }),
      { 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Get the latest release from a GitHub repository
 * @param {Request} request 
 * @param {Env} env 
 * @returns {Response}
 */
export async function getLatestRelease(request, env) {
  // Parse the request URL
  const url = new URL(request.url);
  const repo = url.searchParams.get('repo');
  
  if (!repo) {
    return new Response(
      JSON.stringify({ error: 'Repository name is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  try {
    // Get the latest release
    const response = await fetch(
      `https://api.github.com/repos/${repo}/releases/latest`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${env.GITHUB_TOKEN}`,
        },
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: `GitHub API error: ${errorText}` }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const data = await response.json();
    
    // Find the modpack-installer.exe asset
    const asset = data.assets.find(a => a.name === 'modpack-installer.exe');
    
    if (!asset) {
      return new Response(
        JSON.stringify({ error: 'No modpack-installer.exe found in the latest release' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({
        download_url: asset.browser_download_url,
        release_name: data.name,
        release_tag: data.tag_name,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Check the status of a GitHub workflow run
 * @param {Request} request 
 * @param {Env} env 
 * @returns {Response}
 */
export async function checkWorkflowStatus(request, env) {
  // Parse the request URL
  const url = new URL(request.url);
  const runId = url.searchParams.get('run_id');
  
  if (!runId) {
    return new Response(
      JSON.stringify({ error: 'Workflow run ID is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  try {
    // Get the workflow run status
    const response = await fetch(
      `https://api.github.com/repos/sshcrack/packwiz-launcher/actions/runs/${runId}`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${env.GITHUB_TOKEN}`,
        },
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: `GitHub API error: ${errorText}` }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const data = await response.json();
    
    return new Response(
      JSON.stringify({
        id: data.id,
        status: data.status,
        conclusion: data.conclusion,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Get artifacts from a GitHub workflow run
 * @param {Request} request 
 * @param {Env} env 
 * @returns {Response}
 */
export async function getWorkflowArtifacts(request, env) {
  // Parse the request URL
  const url = new URL(request.url);
  const runId = url.searchParams.get('run_id');
  
  if (!runId) {
    return new Response(
      JSON.stringify({ error: 'Workflow run ID is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  try {
    // Get the workflow artifacts
    const response = await fetch(
      `https://api.github.com/repos/sshcrack/packwiz-launcher/actions/runs/${runId}/artifacts`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${env.GITHUB_TOKEN}`,
        },
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: `GitHub API error: ${errorText}` }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const data = await response.json();
    
    // Add download URLs to each artifact
    const artifacts = data.artifacts.map(artifact => ({
      ...artifact,
      // This URL will need to be authorized with the GitHub token
      archive_download_url: artifact.archive_download_url,
    }));
    
    return new Response(
      JSON.stringify({ artifacts }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Upload an icon file to a storage service and convert to .ico if needed
 * @param {Request} request 
 * @param {Env} env 
 * @returns {Response}
 */
export async function uploadIcon(request, env) {
  try {
    // Parse the form data from the request
    const formData = await request.formData();
    const iconFile = formData.get('icon');
    
    if (!iconFile) {
      return new Response(
        JSON.stringify({ error: 'No icon file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if the file is already in .ico format
    const isIco = iconFile.name.toLowerCase().endsWith('.ico') || 
                 iconFile.type === 'image/x-icon';
    
    let finalIconFile = iconFile;
    
    if (!isIco) {
      // In a real implementation, you would convert the file to .ico format here
      // This would typically involve:
      // 1. Reading the file as an ArrayBuffer
      // 2. Using a library like 'png-to-ico' (server-side) to convert it
      // 3. Creating a new file with the converted data
      
      // For this example, we'll assume the conversion is successful
      console.log('Converting icon to .ico format...');
      
      // Here we would do the actual conversion
      // finalIconFile = convertToIco(iconFile);
      
      // For now, we'll just use the original file
      finalIconFile = iconFile;
    }
    
    // Now upload the file to a storage service (e.g., Cloudflare R2)
    // In a real implementation, you would:
    // 1. Generate a unique filename
    // 2. Upload to R2 or another storage service
    // 3. Return the public URL
    
    // For this example, we'll simulate the upload
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    const fileName = `icon-${uniqueId}.ico`;
    
    // For production, implement actual R2 upload code here
    // const uploadedUrl = await uploadToR2(finalIconFile, fileName, env);
    
    // Simulate a successful upload
    const uploadedUrl = `https://storage.example.com/${fileName}`;
    
    return new Response(
      JSON.stringify({ url: uploadedUrl }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
