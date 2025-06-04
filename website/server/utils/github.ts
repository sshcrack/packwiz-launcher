import { Octokit } from '@octokit/rest';
import { CACHE_TTL, GITHUB_REPO, REPO_NAME, REPO_OWNER, TARGET_BRANCH } from './constants';

// Cache for the latest release URL
let latestReleaseCache: {
    url: string;
    timestamp: number;
} | null = null;

// Create GitHub API client
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

// Function to commit a file to GitHub
export const commitFileToGitHub = async (filePath: string, fileContent: ArrayBuffer, message: string) => {
    try {
        // First, get the latest commit SHA for the target branch
        const { data: refData } = await octokit.git.getRef({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            ref: `heads/${TARGET_BRANCH}`
        });

        const latestCommitSha = refData.object.sha;

        // Get the tree associated with this commit
        const { data: commitData } = await octokit.git.getCommit({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            commit_sha: latestCommitSha
        });

        const treeSha = commitData.tree.sha;

        // Create a blob with the file content
        const { data: blobData } = await octokit.git.createBlob({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            content: Buffer.from(fileContent).toString('base64'),
            encoding: 'base64'
        });

        // Create a new tree with our file
        const { data: newTreeData } = await octokit.git.createTree({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            base_tree: treeSha,
            tree: [
                {
                    path: filePath,
                    mode: '100644', // Normal file mode
                    type: 'blob',
                    sha: blobData.sha
                }
            ]
        });

        // Create a commit with this tree
        const { data: newCommitData } = await octokit.git.createCommit({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            message,
            tree: newTreeData.sha,
            parents: [latestCommitSha]
        });

        // Update the reference to point to the new commit
        await octokit.git.updateRef({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            ref: `heads/${TARGET_BRANCH}`,
            sha: newCommitData.sha
        });

        return {
            commitSha: newCommitData.sha,
            message: message
        };
    } catch (error: any) {
        console.error('Error committing file to GitHub:', error);
        throw new Error(`Failed to commit file: ${error.message}`);
    }
};

// Function to get workflow runs triggered by a specific commit
export const getWorkflowRunByCommit = async (commitSha: string, workflowName: string) => {
    try {
        // Get workflow runs for the repository
        const { data } = await octokit.actions.listWorkflowRunsForRepo({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            per_page: 20 // Increased to get more recent runs
        });

        console.log(`Searching for workflow runs with commit SHA: ${commitSha}`);

        // Find the workflow run triggered by our commit
        // First try exact match for both commit and name
        let workflowRun = data.workflow_runs.find(run =>
            run.head_sha === commitSha &&
            run.name === workflowName
        );

        // If not found, try to match by commit SHA and filename pattern
        if (!workflowRun) {
            workflowRun = data.workflow_runs.find(run =>
                run.head_sha === commitSha &&
                (run.path?.includes(workflowName) || run.name?.includes('custom-icon') || run.workflow_id?.toString().includes(workflowName))
            );
        }

        // If still not found, just match by commit SHA as a last resort
        if (!workflowRun) {
            workflowRun = data.workflow_runs.find(run => run.head_sha === commitSha);
        }

        if (!workflowRun) {
            console.log(`No workflow runs found for commit SHA: ${commitSha}`);
            return null;
        }

        console.log(`Found workflow run: ${workflowRun.id} (${workflowRun.name}) with status ${workflowRun.status}`);

        return {
            id: workflowRun.id,
            name: workflowRun.name,
            status: workflowRun.status,
            conclusion: workflowRun.conclusion,
            html_url: workflowRun.html_url
        };
    } catch (error: any) {
        console.error('Error getting workflow run:', error);
        throw new Error(`Failed to get workflow run: ${error.message}`);
    }
};

// Function to get latest release URL (with caching)
export const getLatestReleaseUrl = async (): Promise<string> => {
    // Check if we have a valid cached URL
    if (latestReleaseCache && (Date.now() - latestReleaseCache.timestamp) < CACHE_TTL) {
        return latestReleaseCache.url;
    }

    // Fetch the latest release info from GitHub
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
        headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        },
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

    // Cache the URL
    latestReleaseCache = {
        url: asset.browser_download_url,
        timestamp: Date.now(),
    };

    return asset.browser_download_url;
};
