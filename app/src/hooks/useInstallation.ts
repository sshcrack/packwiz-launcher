import { useState, useEffect, useMemo } from "react";
import { listen } from "@tauri-apps/api/event";
import { InstallType } from "../types";
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { platform } from '@tauri-apps/plugin-os';

export function useInstallation() {
    const [installType, setInstallType] = useState<InstallType>("prism");
    const [installPath, setInstallPath] = useState("");
    const [installing, setInstalling] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState("");
    const [hasLauncher, setHasLauncher] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [isNewInstallation, setIsNewInstallation] = useState(false);
    const isWindows = useMemo(() => platform() === "windows", [])

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

    // Reset the installation state
    const resetInstallation = () => {
        setInstalling(false);
        setProgress(0);
        setProgressMessage("");
        setError(null);
    };

    // Retry the installation after an error
    const retryInstallation = () => {
        setError(null);
        startInstallation();
    };    // Installation function using Tauri commands
    const startInstallation = async () => {
        setInstalling(true);
        setProgress(0);
        setProgressMessage("Starting installation...");
        setError(null);
        try {
            // Setup event listeners for progress updates
            const unlistenProgress = await listen<[number, string]>("install_progress", (event) => {
                const [percentage, message] = event.payload;
                setProgress(percentage);
                setProgressMessage(message);
                console.log(`Progress: ${percentage}%, Message: ${message}`);
            });

            const unlistenImportDialog = await listen("import_dialog", () => {
                console.log("Import dialog is showing");
                // Check if this is a new installation based on progress or other signals
                const isNewInstall = !hasLauncher;
                setIsNewInstallation(isNewInstall);
                setShowImportDialog(true);
            });

            // Invoke the installation command based on type
            if (installType === "portable") {
                await invoke("install_portable", { path: installPath });
            } else {
                // If using prism launcher, pass the custom path if provided
                const customPath = isWindows && installPath.trim() ? installPath : null;
                await invoke("use_or_install_launcher", { customPath });
            }
            // Cleanup listeners after installation completes
            unlistenProgress();
            unlistenImportDialog();

            setProgress(1);
            setProgressMessage("Installation completed successfully. This installer will close shortly.");
            setTimeout(async () => {
                await getCurrentWindow().close();
            }, 2000);
        } catch (error) {
            console.error("Installation failed:", error);
            // Set error state instead of just updating progress message
            setError(`${error}`);
            setProgressMessage("Installation failed");
        }
    }; return {
        installType,
        setInstallType,
        installPath,
        setInstallPath,
        installing,
        progress,
        progressMessage,
        hasLauncher,
        startInstallation,
        error,
        retryInstallation,
        resetInstallation,
        showImportDialog,
        setShowImportDialog,
        isNewInstallation
    };
}