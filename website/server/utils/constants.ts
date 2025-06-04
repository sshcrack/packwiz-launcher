import path from 'path';
import { fileURLToPath } from 'url';

// Define the GitHub repository and workflow ID
export const GITHUB_REPO = 'sshcrack/packwiz-launcher';
export const REPO_OWNER = GITHUB_REPO.split('/')[0];
export const REPO_NAME = GITHUB_REPO.split('/')[1];
export const WORKFLOW_ID = 'build-with-custom-icon.yml';
export const TARGET_BRANCH = 'build';

// File paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '../..');

// Create uploads directory for local storage
export const uploadsDir = path.join(rootDir, 'uploads');

// Cache TTL in milliseconds (1 hour)
export const CACHE_TTL = 60 * 60 * 1000;
