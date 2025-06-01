// Utility functions for GitHub API interactions

import { GitHubArtifactsResponse, GitHubWorkflowResponse } from '@/types/modpack';

// GitHub repository used for API calls
const GITHUB_REPO = 'sshcrack/packwiz-launcher';
export const API_BASE_URL = import.meta.env.PROD ? "https://packwiz-launcher.sshcrack.me" : 'https://tunnel.sshcrack.me';

/**
 * Trigger a GitHub workflow with an optional icon
 * This operation requires a GitHub token, so it must go through the server
 * The server determines the repository, workflow ID and other parameters
 */
export async function triggerGitHubWorkflow(iconFile: File | null): Promise<GitHubWorkflowResponse> {
  const formData = new FormData();

  // Add the icon file if provided
  if (iconFile) {
    formData.append('icon', iconFile);
  }

  // The server will handle repo, workflow ID and inputs
  const response = await fetch(`${API_BASE_URL}/trigger-workflow`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to trigger GitHub workflow: ${await response.text()}`);
  }

  return response.json();
}

/**
 * Get the latest release artifact URL directly from GitHub
 */
export async function getLatestReleaseArtifact(): Promise<string> {
  const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);

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
 * Poll for workflow completion and get artifact download URL directly from GitHub
 */
export async function pollWorkflowCompletion(workflowRunId: number): Promise<string> {
  let complete = false;
  let artifactUrl = '';

  while (!complete) {
    // Check workflow status directly
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/actions/runs/${workflowRunId}`);

    if (!response.ok) {
      throw new Error(`Failed to check workflow status: ${await response.text()}`);
    }

    const data = await response.json();

    if (data.status === 'completed') {
      complete = true;      // Get artifacts directly
      const artifactsResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/actions/runs/${workflowRunId}/artifacts`);

      if (!artifactsResponse.ok) {
        throw new Error(`Failed to get workflow artifacts: ${await artifactsResponse.text()}`);
      }

      const artifactsData: GitHubArtifactsResponse = await artifactsResponse.json();

      if (artifactsData.artifacts.length === 0) {
        throw new Error('No artifacts found for the workflow run');
      }

      // Extract the artifact ID from the download URL
      const artifact = artifactsData.artifacts[0];
      const artifactId = artifact.id;

      // Use our server endpoint with just the artifact ID
      artifactUrl = `${API_BASE_URL}/download-artifact/${artifactId}`;
    } else {
      // Wait for 5 seconds before polling again
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  return artifactUrl;
}

/**
 * Download a file from a URL
 * Works for both public URLs and artifact URLs through our server
 */
export async function downloadFile(url: string): Promise<ArrayBuffer> {
  // If this is a URL to our server's download-artifact endpoint
  // just pass it through directly as we've already formatted it correctly
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download file: ${await response.text()}`);
  }

  return response.arrayBuffer();
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
