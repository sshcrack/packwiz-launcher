import { invoke } from '@tauri-apps/api/core'
import React, { useEffect } from 'react'

export type ModpackConfigState = {
    title: string,
    description: string,
    logo_url: string,
    packwiz_url: string,
    theme: "dark" | "light",
    background: string
}

export const ModpackConfigContext = React.createContext<ModpackConfigState>({} as any)

export default function ModpackConfigProvider({ children }: { children: React.ReactNode }) {
    const [modpackConfig, setModpackConfig] = React.useState<ModpackConfigState | null>(null)


    useEffect(() => {
        invoke("read_config")
            .then((config) => {
                setModpackConfig(config as ModpackConfigState)
            })
            .catch((err) => {
                alert("Invalid mod config file. " + (err.message ?? JSON.stringify(err)))
            })
    }, [])

    if (!modpackConfig) {
        return <></>
    }

    return (
        <ModpackConfigContext.Provider value={modpackConfig}>
            {children}
        </ModpackConfigContext.Provider>
    )
}