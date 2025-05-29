import { CSSProperties } from "react";
import { Card, CardHeader, CardBody, Progress } from '@heroui/react';

interface InstallProgressProps {
    cardStyle: CSSProperties;
    progress: number;
    progressMessage: string;
}

export default function InstallProgress({ cardStyle, progress, progressMessage }: InstallProgressProps) {    return (
        <Card style={cardStyle} className="border-2 border-gray-200 dark:border-gray-700 overflow-hidden rounded-t-none">
            <CardHeader className="pb-0 pt-6 px-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 font-minecraft">Installing...</h2>
            </CardHeader>
            <CardBody className="p-6">
                <Progress
                    value={progress}
                    maxValue={1}
                    className="mb-2"
                    color="primary"
                    size="lg"
                    showValueLabel={true}
                />
                <p className="text-center text-gray-600 dark:text-gray-300">
                    {progressMessage || (progress < 1
                        ? `Downloading and installing modpack (${progress}%)`
                        : "Installation complete!")}
                </p>
            </CardBody>
        </Card>
    );
}