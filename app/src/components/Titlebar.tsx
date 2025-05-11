import { Button } from '@heroui/react';
import { getCurrentWindow } from '@tauri-apps/api/window';


const Titlebar: React.FC = () => {
    const appWindow = getCurrentWindow();

    // Handle minimize window
    const handleMinimize = async () => {
        await appWindow.minimize();
    };

    // Handle close window
    const handleClose = async () => {
        await appWindow.close();
    };

    return (<div
        className="h-9 bg-neutral-100 dark:bg-neutral-900 flex items-center justify-between select-none"
        data-tauri-drag-region
    >
        {/* App title - also functions as drag region */}
        <div
            className="flex items-center h-full px-4"
            data-tauri-drag-region
        />            {/* Titlebar buttons */}            <div className="flex h-full">
            <Button
                isIconOnly
                radius="none"
                variant="light"
                aria-label="Minimize"
                className="h-full w-11 text-black dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-700 rounded-none"
                onPress={handleMinimize}
            >
                <MinimizeIcon />
            </Button>
            <Button
                isIconOnly
                radius="none"
                variant="light"
                aria-label="Close"
                className="h-full w-11 text-black dark:text-white hover:bg-red-600 hover:text-white rounded-none"
                onPress={handleClose}
            >
                <CloseIcon />
            </Button>
        </div>
    </div>
    );
};

// Minimize icon component
const MinimizeIcon = () => (
    <svg width="10" height="1" viewBox="0 0 10 1" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0.5H10" stroke="currentColor" strokeWidth="1" />
    </svg>
);

// Close icon component
const CloseIcon = () => (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.2" />
    </svg>
);

export default Titlebar;