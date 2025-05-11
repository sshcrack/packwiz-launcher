import { CSSProperties, useState, useEffect } from "react";
import { Card, CardHeader, CardBody, CardFooter, Button, Input } from '@heroui/react';
import { InstallType } from "../../types";
import { open } from '@tauri-apps/plugin-dialog';

interface InstallOptionsProps {
    cardStyle: CSSProperties;
    installType: InstallType;
    setInstallType: (type: InstallType) => void;
    installPath: string;
    setInstallPath: (path: string) => void;
    startInstallation: () => void;
    hasLauncher: boolean | null;
}

export default function InstallOptions({
    cardStyle,
    installType,
    setInstallType,
    installPath,
    setInstallPath,
    startInstallation,
    hasLauncher
}: InstallOptionsProps) {
    const [isSelectingPath, setIsSelectingPath] = useState(false);
    const [portablePath, setPortablePath] = useState("");
    const [prismPath, setPrismPath] = useState(installPath || "");

    // Update appropriate path when installation type changes
    const handleInstallTypeChange = (type: InstallType) => {
        setInstallType(type);
        // Set the appropriate path based on the selected type
        setInstallPath(type === "portable" ? portablePath : prismPath);
    };
    // Update the appropriate path when the global path changes
    useEffect(() => {
        if (installType === "portable") {
            setPortablePath(installPath);
        } else {
            setPrismPath(installPath);
        }
    }, [installPath, installType]);

    const handlePathSelect = async () => {
        setIsSelectingPath(true);
        try {
            const selected = await open({
                directory: true,
                multiple: false,
                title: installType === 'portable'
                    ? 'Select folder for portable installation'
                    : 'Select PrismLauncher location (optional)'
            });

            if (selected && typeof selected === 'string') {
                setInstallPath(selected);
            }
        } catch (error) {
            console.error('Path selection failed:', error);
        } finally {
            setIsSelectingPath(false);
        }
    };

    return (
        <Card style={cardStyle}><CardHeader className="pb-0 pt-6 px-6 rounded-t-none">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Installation Options</h2>
        </CardHeader>
            <CardBody className="p-6">
                <div className="mb-4">
                    <label className="text-sm font-medium mb-2 block text-gray-800 dark:text-gray-200">Installation Type</label>
                    <div className="space-y-2">
                        <div className="flex items-start">
                            <input type="radio" id="prism" name="installType" value="prism" checked={installType === "prism"} onChange={() => handleInstallTypeChange("prism")} className="mt-1 mr-2 accent-blue-600 dark:accent-blue-400" />
                            <div>
                                <label htmlFor="prism" className="font-medium cursor-pointer text-gray-800 dark:text-gray-200">
                                    PrismLauncher
                                    {hasLauncher === true && <span className="ml-2 text-xs text-green-500 dark:text-green-400">(Detected)</span>}
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {hasLauncher
                                        ? "Install using existing PrismLauncher"
                                        : "Download and install PrismLauncher first"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <input type="radio" id="portable" name="installType" value="portable" checked={installType === "portable"} onChange={() => handleInstallTypeChange("portable")} className="mt-1 mr-2 accent-blue-600 dark:accent-blue-400" />
                            <div>
                                <label htmlFor="portable" className="font-medium cursor-pointer text-gray-800 dark:text-gray-200">Portable</label>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Install as standalone portable installation</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-4">
                    <Input
                        readOnly
                        label={installType === "portable" ? "Installation Directory" : "PrismLauncher Location (Optional)"}
                        placeholder={installType === "portable" ? "Select folder for installation" : "Leave empty to auto-detect or install"}
                        value={installType === "portable" ? portablePath : prismPath}
                        onClick={() => handlePathSelect()}
                        classNames={{
                            label: "text-gray-800 dark:text-gray-200",
                            input: "cursor-pointer text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        }} endContent={
                            <Button size="sm" variant="ghost" color="primary" isLoading={isSelectingPath} onPress={handlePathSelect}
                            >
                                Browse
                            </Button>
                        } isRequired={installType === "portable"}
                    />
                </div>
            </CardBody>
            <CardFooter><Button color="primary" variant="solid" fullWidth={true} onPress={startInstallation} isDisabled={installType === "portable" && !portablePath}
            >
                Install Modpack
            </Button>
            </CardFooter>
        </Card>
    );
}