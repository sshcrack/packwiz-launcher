// Types used across the application

export type InstallType = "portable" | "prism";

export interface CardStyleProps {
  cardStyle: React.CSSProperties;
}

export interface InstallProgressMessage {
  percentage: number;
  message: string;
}

export interface ModLoader {
  type: string;
  version: string;
}

export interface ModpackConfig {
  name: string;
  version: string;
  description: string;
  author?: string;
  minecraft: string;
  modloader: ModLoader;
  theme: 'light' | 'dark';
  background: string;
}