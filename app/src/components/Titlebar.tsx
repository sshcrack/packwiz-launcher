import { getCurrentWebview } from '@tauri-apps/api/webview';
import { useContext } from 'react';
import { ModpackConfigContext } from './ModpackConfigProvider';

export default function Titlebar() {
    const { name } = useContext(ModpackConfigContext);

    const handleMinimize = async () => {
        try {
            const app = getCurrentWebview()
            await app.window.minimize();
        } catch (e) {
            console.error('Failed to minimize window:', e);
        }
    };

    const handleClose = async () => {
        try {
            const app = getCurrentWebview()
            await app.window.close();
        } catch (e) {
            console.error('Failed to close window:', e);
        }
    };

    return (
        <div data-tauri-drag-region className="flex justify-between items-center h-8 px-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div data-tauri-drag-region className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none">{name ? name + " Installer" : "Modpack Launcher"}</div>
            <div className="flex items-center space-x-1">
                <button
                    onClick={handleMinimize}
                    className="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
                <button
                    onClick={handleClose}
                    className="flex items-center justify-center w-6 h-6 rounded hover:bg-red-500 hover:text-white dark:hover:bg-red-600 text-gray-500 dark:text-gray-400"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        </div>
    );
}