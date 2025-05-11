import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { InstallType } from "../types";
import { invoke } from '@tauri-apps/api/core';

export function useInstallation() {
    const [installType, setInstallType] = useState<InstallType>("prism");
    const [installPath, setInstallPath] = useState("");
    const [installing, setInstalling] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState("");
    const [hasLauncher, setHasLauncher] = useState<boolean | null>(null);

    // Check if PrismLauncher is already installed
    useEffect(() => {
        const checkLauncher = async () => {
            try {
                const path = await invoke<string | null>("get_prism_launcher_path");
                setHasLauncher(!!path);
                if (path) {
                    setInstallPath(path);
                }
            } catch (error) {
                console.error("Failed to check launcher path:", error);
                setHasLauncher(false);
            }
        };

        checkLauncher();
    }, []);

    // Installation function using Tauri commands
    const startInstallation = async () => {
        setInstalling(true);
        setProgress(0);
        setProgressMessage("Starting installation...");

        try {
            // Setup event listeners for progress updates
            const unlistenProgress = await listen<[number, string]>("install_progress", (event) => {
                const [percentage, message] = event.payload;
                setProgress(percentage);
                setProgressMessage(message);
                console.log(`Progress: ${percentage}%, Message: ${message}`);
            });

            const unlistenClick = await listen("click_install", () => {
                console.log("Manual installation required, user needs to proceed with installer");
                setProgressMessage("Please complete the PrismLauncher installation in the opened installer");
            });

            // Invoke the installation command based on type
            if (installType === "portable") {
                await invoke("install_portable", { path: installPath });
            } else {
                // If using prism launcher, pass the custom path if provided
                const customPath = installPath.trim() ? installPath : null;
                await invoke("install_launcher", { customPath });
            }

            // Cleanup listeners after installation completes
            unlistenProgress();
            unlistenClick();

            setProgress(100);
            setProgressMessage("Installation completed successfully!");
        } catch (error) {
            console.error("Installation failed:", error);
            setProgressMessage(`Installation failed: ${error}`);
        }
    };

    return {
        installType,
        setInstallType,
        installPath,
        setInstallPath,
        installing,
        progress,
        progressMessage,
        hasLauncher,
        startInstallation
    };
}