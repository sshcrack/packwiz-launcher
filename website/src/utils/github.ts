// Utility functions for GitHub API interactions

import { GitHubArtifactsResponse, GitHubWorkflowResponse } from '@/types/modpack';

const GITHUB_REPO = 'sshcrack/packwiz-launcher';
const WORKFLOW_ID = '165435937';
const API_BASE_URL = ''; // Empty string for relative URLs

/**
 * Trigger a GitHub workflow with the specified inputs
 * This operation requires a GitHub token, so it must go through the server
 */
export async function triggerGitHubWorkflow(iconUrl: string): Promise<GitHubWorkflowResponse> {
  const response = await fetch(`${API_BASE_URL}/api/trigger-workflow`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      repo: GITHUB_REPO,
      workflow_id: WORKFLOW_ID,
      inputs: {
        icon_url: iconUrl
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to trigger GitHub workflow: ${await response.text()}`);
  }

  return response.json();
}

/**
 * Get the latest release artifact URL from GitHub
 * Now using our Express server as a proxy
 */
export async function getLatestReleaseArtifact(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/latest-release?repo=${GITHUB_REPO}`, {
    headers: {
      'Accept': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to get latest release: ${await response.text()}`);
  }

  const data = await response.json();

  // Find the modpack-installer.exe asset
  const asset = data.assets.find((a: any) => a.name === 'modpack-installer.exe');

  if (!asset) {
    throw new Error('No modpack-installer.exe found in the latest release');
  }

  return asset.browser_download_url;
}

/**
 * Poll for workflow completion and get artifact download URL
 * Now using our Express server as a proxy for both status and artifacts
 */
export async function pollWorkflowCompletion(workflowRunId: number): Promise<string> {
  let complete = false;
  let artifactUrl = '';

  while (!complete) {
    // Check workflow status through our server endpoint
    const response = await fetch(`${API_BASE_URL}/api/workflow-status?run_id=${workflowRunId}`, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to check workflow status: ${await response.text()}`);
    }

    const data = await response.json();

    if (data.status === 'completed') {
      complete = true;

      // Get artifacts through our server endpoint
      const artifactsResponse = await fetch(`${API_BASE_URL}/api/workflow-artifacts?run_id=${workflowRunId}`);

      if (!artifactsResponse.ok) {
        throw new Error(`Failed to get workflow artifacts: ${await artifactsResponse.text()}`);
      }

      const artifactsData: GitHubArtifactsResponse = await artifactsResponse.json();

      if (artifactsData.artifacts.length === 0) {
        throw new Error('No artifacts found for the workflow run');
      }

      artifactUrl = artifactsData.artifacts[0].archive_download_url;
    } else {
      // Wait for 5 seconds before polling again
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  return artifactUrl;
}

/**
 * Download a file from a URL
 * For URLs that require authentication, this will proxy through the server
 */
export async function downloadFile(url: string): Promise<ArrayBuffer> {
  // If the URL is for a GitHub artifact download which requires authentication
  if (url.includes('api.github.com') && url.includes('/actions/artifacts/')) {
    // Use our Express server proxy to handle authentication
    const response = await fetch(`${API_BASE_URL}/api/download-artifact?url=${encodeURIComponent(url)}`);

    if (!response.ok) {
      throw new Error(`Failed to download file through proxy: ${await response.text()}`);
    }

    return response.arrayBuffer();
  } else {
    // For public URLs (like release assets), download directly
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download file: ${await response.text()}`);
    }

    return response.arrayBuffer();
  }
}

/**
 * Append JSON data to an executable file
 * 
 * This function follows the requirements:
 * 1. Encode the data as JSON
 * 2. Translate it to bytes UTF-8
 * 3. Append it at the end of the executable
 * 4. Append the size of the byte array as u64
 */
export function appendDataToExecutable(
  executableBuffer: ArrayBuffer,
  jsonData: string
): Blob {
  // Convert JSON to UTF-8 bytes
  const encoder = new TextEncoder();
  const jsonBytes = encoder.encode(jsonData);

  // Create a Uint8Array to hold the executable + JSON + size
  const executableArray = new Uint8Array(executableBuffer);

  // Create a buffer for the size (8 bytes for u64)
  const sizeBuffer = new ArrayBuffer(8);
  const sizeView = new DataView(sizeBuffer);
  sizeView.setBigUint64(0, BigInt(jsonBytes.length), true); // true for little-endian

  // Combine the executable, JSON bytes, and size
  const resultArray = new Uint8Array(
    executableArray.length + jsonBytes.length + 8
  );

  // Copy the executable
  resultArray.set(executableArray, 0);

  // Copy the JSON data
  resultArray.set(jsonBytes, executableArray.length);

  // Copy the size (8 bytes for u64)
  resultArray.set(
    new Uint8Array(sizeBuffer),
    executableArray.length + jsonBytes.length
  );

  // Return as a Blob for easy downloading
  return new Blob([resultArray], { type: 'application/octet-stream' });
}
