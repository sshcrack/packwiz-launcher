// Modpack configuration types based on the Rust struct
export interface ModpackConfig {
  name: string;
  author: string;
  description: string;
  logo_url: string;
  packwiz_url: string;
  base_pack_url: string;
  theme: 'dark' | 'light';
  background: string;
}

// GitHub Actions workflow interface
export interface GitHubWorkflowInput {
  icon_url: string;
}

// Response from the GitHub Actions workflow
export interface GitHubWorkflowResponse {
  id: number;
  artifacts_url: string;
  status: string;
}

// Response from GitHub artifacts API
export interface GitHubArtifactsResponse {
  artifacts: Array<{
    id: number;
    name: string;
    size_in_bytes: number;
    archive_download_url: string;
  }>;
}

// Application state interface
export interface AppState {
  useCustomIcon: boolean;
  customIconUrl: string | null;
  modpackConfig: ModpackConfig;
  isLoading: boolean;
  error: string | null;
  executableUrl: string | null;
}
