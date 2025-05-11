import { CSSProperties, useContext } from "react";
import { Card, CardHeader, CardBody } from '@heroui/react';
import { ModpackConfigContext } from '../ModpackConfigProvider';

interface ModpackInfoProps {
    cardStyle: CSSProperties;
}

export default function ModpackInfo({ cardStyle }: ModpackInfoProps) {
    const { theme, background, description } = useContext(ModpackConfigContext);

    return (
        <Card style={cardStyle} className='rounded-b-none'>
            <CardHeader className="pb-0 pt-6 px-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Modpack</h2>
                </div>
            </CardHeader>
            <CardBody className="p-6">
                {description && (
                    <p className="text-gray-700 dark:text-gray-300 mb-4">{description}</p>
                )}

            </CardBody>
        </Card>
    );
}