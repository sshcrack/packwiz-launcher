import { CSSProperties, useContext } from "react";
import { Card, CardHeader, CardBody } from '@heroui/react';
import { ModpackConfigContext } from '../ModpackConfigProvider';

interface ModpackInfoProps {
    cardStyle: CSSProperties;
}

export default function ModpackInfo({ cardStyle }: ModpackInfoProps) {
    const { name, description, author, logo_url, minecraft, modloader } = useContext(ModpackConfigContext);

    return (
        <Card style={cardStyle} className="mb-4 overflow-hidden">
            <CardHeader className="pb-0 pt-6 px-6 flex flex-col md:flex-row items-center gap-4">
                {logo_url && (
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden flex-shrink-0 border-2 border-gray-200 dark:border-gray-700">
                        <img
                            src={logo_url}
                            alt={`${name} logo`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                // If image fails to load, replace with a placeholder
                                const target = e.target as HTMLImageElement;
                                target.src = "https://placehold.co/96x96/png?text=Modpack";
                            }}
                        />
                    </div>
                )}
                <div className={logo_url ? "text-center md:text-left flex-grow" : "w-full"}>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">{name || "Modpack"}</h2>
                    {author && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Created by <span className="font-semibold text-gray-700 dark:text-gray-300">{author}</span>
                        </p>
                    )}

                    {/* Minecraft and modloader info */}
                    <div className="flex flex-wrap gap-2 mt-2">
                        {minecraft && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-300 rounded text-xs font-medium">
                                Minecraft {minecraft}
                            </span>
                        )}
                        {modloader && (
                            <span className="px-2 py-1 bg-orange-100 dark:bg-orange-800/30 text-orange-700 dark:text-orange-300 rounded text-xs font-medium">
                                {modloader.type} {modloader.version}
                            </span>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardBody className="p-6">
                {description && (
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                        {description}
                    </p>
                )}
            </CardBody>
        </Card>
    );
}