import { useState } from 'react';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Switch } from '@heroui/switch';
import { ModpackConfig } from '@/types/modpack';
import { fileToDataUrl } from '@/utils/iconConverter';

interface ModpackFormProps {
    onSubmit: (config: ModpackConfig, useCustomIcon: boolean, customIconFile: File | null) => void;
    isLoading: boolean;
    processingStep?: string;
}

export default function ModpackForm({ onSubmit, isLoading, processingStep }: ModpackFormProps) {
    const [useCustomIcon, setUseCustomIcon] = useState(false);
    const [customIconFile, setCustomIconFile] = useState<File | null>(null);
    const [customIconPreviewUrl, setCustomIconPreviewUrl] = useState<string | null>(null);const [formData, setFormData] = useState<ModpackConfig>({
        name: 'Minecolonies',
        author: 'Minecolonies Team',
        description: 'A modpack focused on building and managing colonies with the Minecolonies mod. Includes various quality of life mods and performance improvements.',
        logo_url: 'https://discord.do/wp-content/uploads/2023/08/MineColonies.jpg',
        packwiz_url: 'http://localhost:3000',
        base_pack_url: 'http://localhost:3001/base_modpack.zip',
        theme: 'dark',
        background: 'stone'
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };    const handleIconFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];

            // Check if file is in .ico format
            if (file.type === 'image/x-icon' || file.name.toLowerCase().endsWith('.ico')) {
                setCustomIconFile(file);
                // Create a temporary URL for preview
                const previewUrl = await fileToDataUrl(file);
                setCustomIconPreviewUrl(previewUrl);
            } else {
                alert('Please select a valid .ico file');
                // Clear the input
                e.target.value = '';
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // If using custom icon but no file was selected
        if (useCustomIcon && !customIconFile) {
            alert('Please select a custom icon file');
            return;
        }

        // Pass the file directly to the onSubmit handler
        onSubmit(formData, useCustomIcon, customIconFile);
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
                        required
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
                        required
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
                    <textarea
                        id="description"
                        name="description"
                        required
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="A short description of your modpack..."
                        className="w-full min-h-20 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        required
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
                        required
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
                        required
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
                    <div className="flex items-center space-x-2">
                        <select
                            id="theme"
                            name="theme"
                            required
                            value={formData.theme}
                            onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value as 'dark' | 'light' }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="dark">Dark</option>
                            <option value="light">Light</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="background_block" className="block text-sm font-medium mb-1">
                        Background Block (Minecraft block name)
                    </label>                    <Input
                        id="background_block"
                        name="background"
                        required
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

                <div className="flex items-center space-x-3 mb-4">
                    <Switch
                        id="useCustomIcon"
                        checked={useCustomIcon}
                        onChange={() => setUseCustomIcon(!useCustomIcon)}
                    />
                    <label htmlFor="useCustomIcon" className="text-sm font-medium">
                        Use custom icon for installer
                    </label>
                </div>                {useCustomIcon && (
                    <div className="mt-4">                        <label htmlFor="iconFile" className="block text-sm font-medium mb-1">
                        Upload Icon (.ico file only)
                    </label>
                        <Input
                            id="iconFile"
                            type="file"
                            accept=".ico"
                            onChange={handleIconFileChange}
                            className="w-full"
                        />
                        {customIconPreviewUrl && (
                            <div className="mt-2">
                                <p className="text-sm">Icon Preview:</p>
                                <img src={customIconPreviewUrl} alt="Icon Preview" className="mt-2 h-16 w-16" />
                            </div>
                        )}
                    </div>
                )}
            </div>            <div className="pt-4">
                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading
                        ? processingStep
                            ? `${processingStep}`
                            : 'Generating Installer...'
                        : 'Generate Installer'}
                </Button>
                {isLoading && (
                    <div className="mt-2 w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1.5">
                        <div className="bg-blue-600 h-1.5 rounded-full animate-pulse w-full"></div>
                    </div>
                )}
            </div>
        </form>
    );
}
