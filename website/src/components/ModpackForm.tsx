import { ModpackConfig } from '@/types/modpack';
import { fileToDataUrl } from '@/utils/iconConverter';
import { Button } from '@heroui/button';
import { Input, Textarea } from '@heroui/input';
import { Switch } from '@heroui/switch';
import { SelectItem, Select } from '@heroui/select';
import React, { useRef, useState, useEffect } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

interface ModpackFormProps {
    onSubmit: (config: ModpackConfig, useCustomIcon: boolean, customIconFile: File | null, turnstileToken: string | null) => void;
    isLoading: boolean;
    processingStep?: string;
}

const DEBUG_DEFAULTS: ModpackConfig = {
    name: 'Minecolonies',
    author: 'Minecolonies Team',
    description: 'A modpack focused on building and managing colonies with the Minecolonies mod. Includes various quality of life mods and performance improvements.',
    logo_url: 'https://discord.do/wp-content/uploads/2023/08/MineColonies.jpg',
    packwiz_url: 'http://localhost:3000',
    base_pack_url: 'http://localhost:3001/base_modpack.zip',
    theme: 'dark',
    background: 'stone'
};

// Define the component as React.FC to ensure it returns JSX.Element
const ModpackForm: React.FC<ModpackFormProps> = ({ onSubmit, isLoading, processingStep }) => {
    const [useCustomIcon, setUseCustomIcon] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const initializing = useRef(false);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [iconModuleLoading, setIconModuleLoading] = useState(false);
    const [iconConversionError, setIconConversionError] = useState<string | null>(null);

    const [customIconFile, setCustomIconFile] = useState<File | null>(null);
    const [customIconPreviewUrl, setCustomIconPreviewUrl] = useState<string | null>(null);
    const [formData, setFormData] = useState<ModpackConfig>(import.meta.env.DEV ? DEBUG_DEFAULTS : {
        name: '',
        author: '',
        description: '',
        logo_url: '',
        packwiz_url: '',
        base_pack_url: '',
        theme: 'light',
        background: 'dirt'
    });

    // Lazy load the img-to-ico module
    useEffect(() => {
        if (useCustomIcon && !initialized && !initializing.current) {
            initializing.current = true;
            setIconModuleLoading(true);

            // Dynamic import of the icon converter
            import('@/utils/iconConverter.lazy').then(async (iconModule) => {
                await iconModule.initIconConverter();
                setInitialized(true);
                setIconModuleLoading(false);
            }).catch(err => {
                console.error('Error loading icon converter:', err);
                setIconModuleLoading(false);
                initializing.current = false;
            });
        }
    }, [useCustomIcon, initialized]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleIconFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];

            // Check if file is in .ico format
            if (file.type === 'image/x-icon' || file.name.toLowerCase().endsWith('.ico')) {
                setCustomIconFile(file);
                // Create a temporary URL for preview
                const previewUrl = await fileToDataUrl(file);
                setCustomIconPreviewUrl(previewUrl);
            } else {
                try {
                    // Dynamically import the converter only when needed
                    const iconConverter = await import('@/utils/iconConverter.lazy');
                    const icoFile = await iconConverter.createIcoFile(file);

                    setCustomIconFile(icoFile);
                    // Create a temporary URL for preview
                    const previewUrl = await fileToDataUrl(icoFile);
                    setCustomIconPreviewUrl(previewUrl);
                    setIconConversionError(null); // Clear any previous errors
                } catch (err) {
                    console.error('Error converting file to ICO format:', err);
                    setIconConversionError(`Failed to convert: ${err}`);
                    setCustomIconFile(null);
                    setCustomIconPreviewUrl(null);
                    e.target.value = ''; // Reset file input to allow re-uploading the same file
                }
            }
        }
    }; const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // If using custom icon but no file was selected
        if (useCustomIcon && !customIconFile) {
            setIconConversionError('Please select a custom icon file');
            return;
        }

        // Pass the file directly to the onSubmit handler
        onSubmit(formData, useCustomIcon, customIconFile, turnstileToken);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Modpack Information</h2>

                <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                        Modpack Name
                    </label>
                    <Input
                        id="name"
                        name="name"
                        isRequired
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="My Awesome Modpack"
                        className="w-full"
                    />
                </div>

                <div>
                    <label htmlFor="author" className="block text-sm font-medium mb-1">
                        Author
                    </label>
                    <Input
                        id="author"
                        name="author"
                        isRequired
                        value={formData.author}
                        onChange={handleInputChange}
                        placeholder="Your Name"
                        className="w-full"
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-1">
                        Description
                    </label>
                    <Textarea
                        id="description"
                        name="description"
                        isRequired
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="A short description of your modpack..."
                        className="w-full min-h-20 rounded-md"
                        rows={4}
                    />
                </div>

                <div>
                    <label htmlFor="logo_url" className="block text-sm font-medium mb-1">
                        Logo URL
                    </label>
                    <Input
                        id="logo_url"
                        name="logo_url"
                        isRequired
                        value={formData.logo_url}
                        onChange={handleInputChange}
                        placeholder="https://example.com/logo.png"
                        className="w-full"
                    />
                </div>

                <div>
                    <label htmlFor="packwiz_url" className="block text-sm font-medium mb-1">
                        Packwiz URL
                    </label>
                    <Input
                        id="packwiz_url"
                        name="packwiz_url"
                        isRequired
                        value={formData.packwiz_url}
                        onChange={handleInputChange}
                        placeholder="https://example.com/pack.toml"
                        className="w-full"
                    />
                </div>

                <div>
                    <label htmlFor="base_pack_url" className="block text-sm font-medium mb-1">
                        Base Pack URL
                    </label>
                    <Input
                        id="base_pack_url"
                        name="base_pack_url"
                        isRequired
                        value={formData.base_pack_url}
                        onChange={handleInputChange}
                        placeholder="https://example.com/basepack"
                        className="w-full"
                    />
                </div>
                <div>
                    <label htmlFor="theme" className="block text-sm font-medium mb-1">
                        Theme
                    </label>
                    <div className="flex items-center space-x-2">                        <Select
                            id="theme"
                            name="theme"
                            defaultSelectedKeys={["dark"]}
                            isRequired
                            onSelectionChange={(e) => setFormData(prev => ({ ...prev, theme: e as unknown as 'dark' | 'light' }))}
                            className="w-full rounded-md"
                            aria-label="Select theme"
                        >
                            <SelectItem key="dark">Dark</SelectItem>
                            <SelectItem key="light">Light</SelectItem>
                        </Select>
                    </div>
                </div>

                <div>
                    <label htmlFor="background_block" className="block text-sm font-medium mb-1">
                        Background Block (Minecraft block name)
                    </label>
                    <Input
                        id="background_block"
                        name="background"
                        isRequired
                        value={formData.background}
                        onChange={handleInputChange}
                        placeholder="stone"
                        className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter a <a className='underline text-blue-500' href="https://mcasset.cloud/1.21.5/assets/minecraft/textures/block" target='_blank'>valid Minecraft block</a> name without .png extension (e.g., stone, dirt, grass_block)</p>
                </div>
            </div>

            <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-4">Installer Executable</h2>

                <div className="flex items-center space-x-3 mb-4">                    <Switch
                    id="useCustomIcon"
                    checked={useCustomIcon}
                    onChange={() => {
                        setUseCustomIcon(!useCustomIcon);
                        if (!useCustomIcon === false) {
                            setIconConversionError(null);
                        }
                    }}
                    aria-label="Use custom icon for installer"
                />
                    <label htmlFor="useCustomIcon" className="text-sm font-medium">
                        Use custom icon for installer
                    </label>
                </div>
                {useCustomIcon && (
                    iconModuleLoading ? (
                        <label>Initializing icon converter, please wait...</label>
                    ) : !initialized ? (
                        <label>Preparing icon converter...</label>
                    ) : (
                        <div className="mt-4">
                            <label htmlFor="iconFile" className="block text-sm font-medium mb-1">
                                Upload Icon (image must be square and under 1MB)
                            </label>
                            <Input
                                id="iconFile"
                                type="file"
                                accept="image/*"
                                onChange={handleIconFileChange}
                                className="w-full"
                            />
                            {iconConversionError && (
                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                    {iconConversionError}
                                </p>
                            )}
                            {customIconPreviewUrl && (
                                <div className="mt-2">
                                    <p className="text-sm">Icon Preview:</p>
                                    <img src={customIconPreviewUrl} alt="Icon Preview" className="mt-2 h-16 w-16" />
                                </div>
                            )}
                            <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                                Note: Uploaded icons will be publicly accessible on GitHub.
                            </p>                            <div className='h-5' />                            <Turnstile
                                siteKey='0x4AAAAAABfrRkvlvcZn3fZ-'
                                onSuccess={token => setTurnstileToken(token)}
                                onExpire={() => setTurnstileToken(null)}
                                onError={err => {
                                    setTurnstileToken(null);
                                    setIconConversionError(`Turnstile error: ${err}`);
                                }}
                                aria-label="CAPTCHA verification"
                            />
                        </div>
                    )
                )}
            </div>
            <div className="pt-4">                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading
                        ? processingStep
                            ? `${processingStep}`
                            : 'Generating Installer...'
                        : 'Generate Installer'}
                </Button>
                  {isLoading && (
                    <>
                        <div className="mt-2 w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1.5" role="progressbar" aria-label="Installation progress" aria-valuenow={50} aria-valuemin={0} aria-valuemax={100}>
                            <div className="bg-blue-600 h-1.5 rounded-full animate-pulse w-full"></div>
                        </div>
                        <p className="mt-3 text-sm font-medium text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700 p-2 rounded">
                            Please do not close or navigate away from this page while your installer is being generated.
                        </p>
                    </>
                )}
            </div>
        </form>
    );
};

// Export the component with proper typing for lazy loading
export default ModpackForm;
