import { CSSProperties } from "react";
import { Card, CardHeader, CardBody, Progress } from '@heroui/react';

interface InstallProgressProps {
    cardStyle: CSSProperties;
    progress: number;
    progressMessage: string;
}

export default function InstallProgress({ cardStyle, progress, progressMessage }: InstallProgressProps) {
    return (
        <Card style={cardStyle} className="rounded-t-none">
            <CardHeader className="pb-0 pt-6 px-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Installing...</h2>
            </CardHeader>
            <CardBody className="p-6">
                <Progress
                    value={progress}
                    className="mb-2"
                    color="primary"
                    size="lg"
                    showValueLabel={true}
                />
                <p className="text-center text-gray-600 dark:text-gray-300">
                    {progressMessage || (progress < 100
                        ? `Downloading and installing modpack (${progress}%)`
                        : "Installation complete!")}
                </p>
            </CardBody>
        </Card>
    );
}