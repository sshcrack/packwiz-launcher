import React from 'react'

const modpackConfig = {
    title: "Minecolonies",
    description: "A modpack focused on building and managing colonies with the Minecolonies mod. Includes various quality of life mods and performance improvements.",
    logoUrl: "https://discord.do/wp-content/uploads/2023/08/MineColonies.jpg",
    packwizUrl: "http://localhost:3000",
    theme: "dark",
    background: "deepslate"
}

export type ModpackConfigState = typeof modpackConfig

export const ModpackConfigContext = React.createContext<ModpackConfigState>({} as any)

export default function ModpackConfigProvider({ children }: { children: React.ReactNode }) {
    return (
        <ModpackConfigContext.Provider value={modpackConfig}>
            {children}
        </ModpackConfigContext.Provider>
    )
}