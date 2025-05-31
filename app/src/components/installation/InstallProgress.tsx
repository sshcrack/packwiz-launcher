import { CSSProperties } from "react";
import { Card, CardHeader, CardBody, Progress, Button } from '@heroui/react';

interface InstallProgressProps {
    cardStyle: CSSProperties;
    progress: number;
    progressMessage: string;
    error?: string | null;
    onRetry?: () => void;
    onCancel?: () => void;
}

export default function InstallProgress({
    cardStyle,
    progress,
    progressMessage,
    error,
    onRetry,
    onCancel
}: InstallProgressProps) {
    const isError = !!error;

    return (
        <Card style={cardStyle} className="border-2 border-gray-200 dark:border-gray-700 overflow-hidden rounded-t-none">
            <CardHeader className="pb-0 pt-6 px-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 font-minecraft">
                    {isError ? "Installation Error" : (progress >= 1 ? "Installation Complete" : "Installing...")}
                </h2>
            </CardHeader>
            <CardBody className="p-6">
                {!isError && (
                    <Progress
                        value={progress}
                        maxValue={1}
                        className="mb-2"
                        color={isError ? "danger" : "primary"}
                        size="lg"
                        showValueLabel={true}
                        disableAnimation
                    />
                )}

                {isError ? (
                    <div className="text-center">
                        <div className="p-4 mb-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
                            <p className="text-red-700 dark:text-red-300 font-medium mb-2">
                                {progressMessage || "Installation failed"}
                            </p>
                            <p className="text-red-600 dark:text-red-400 text-sm font-mono overflow-auto max-h-32 whitespace-pre-wrap">
                                {error}
                            </p>
                        </div>

                        <div className="flex justify-center gap-3 mt-4">
                            {onRetry && (
                                <Button
                                    color="primary"
                                    variant="solid"
                                    onPress={onRetry}
                                    className="font-minecraft text-white uppercase tracking-wide shadow-md text-xs"
                                >
                                    Retry Installation
                                </Button>
                            )}
                            {onCancel && (
                                <Button
                                    color="default"
                                    variant="flat"
                                    onPress={onCancel}
                                    className="font-minecraft uppercase tracking-wide text-xs"
                                >
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-600 dark:text-gray-300">
                        {progressMessage || (progress < 1
                            ? `Downloading and installing modpack (${progress}%)`
                            : "Installation complete!")}
                    </p>
                )}
            </CardBody>
        </Card>
    );
}