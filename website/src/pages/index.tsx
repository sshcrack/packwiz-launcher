import { useState } from 'react';
import { Button } from '@heroui/button';
import { Link } from '@heroui/link';
import ModpackForm from '@/components/ModpackForm';
import { ModpackConfig } from '@/types/modpack';
import { appendDataToExecutable, downloadFile, getLatestReleaseArtifact, pollWorkflowCompletion, triggerGitHubWorkflow } from '@/utils/github';
import { uploadIconFile } from '@/utils/iconConverter';

export default function IndexPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executableUrl, setExecutableUrl] = useState<string | null>(null);
  const [executableBlob, setExecutableBlob] = useState<Blob | null>(null);
  const [modpackName, setModpackName] = useState<string>('');
  const [processingStep, setProcessingStep] = useState<string>('');

  const handleFormSubmit = async (
    config: ModpackConfig, 
    useCustomIcon: boolean, 
    customIconUrl: string | null
  ) => {
    setIsLoading(true);
    setError(null);
    setExecutableUrl(null);
    setExecutableBlob(null);
    setModpackName(config.name);
    
    try {
      let executableArrayBuffer: ArrayBuffer;
      
      if (useCustomIcon && customIconUrl) {
        setProcessingStep('Converting and uploading icon...');
        // Convert to blob if it's a data URL
        let iconBlob: Blob;
        if (customIconUrl.startsWith('blob:') || customIconUrl.startsWith('data:')) {
          iconBlob = await fetch(customIconUrl).then(r => r.blob());
        } else {
          // It's already a URL to an uploaded file
          iconBlob = await fetch(customIconUrl).then(r => r.blob());
        }
        
        // Create a File object from the blob
        const iconFile = new File([iconBlob], 'icon.ico', { type: 'image/x-icon' });
        
        // Upload the icon
        const iconUrl = await uploadIconFile(iconFile);
          
        setProcessingStep('Triggering GitHub workflow...');
        // Trigger GitHub workflow with custom icon
        const workflowResponse = await triggerGitHubWorkflow(iconUrl);
        
        setProcessingStep('Building custom installer (this may take a few minutes)...');
        // Poll for workflow completion
        const artifactUrl = await pollWorkflowCompletion(workflowResponse.id);
        
        setProcessingStep('Downloading custom installer...');
        // Download the artifact
        executableArrayBuffer = await downloadFile(artifactUrl);
      } else {
        setProcessingStep('Downloading default installer...');
        // Use default executable from latest release
        const latestReleaseUrl = await getLatestReleaseArtifact();
        executableArrayBuffer = await downloadFile(latestReleaseUrl);
      }
      
      setProcessingStep('Processing installer with your modpack configuration...');
      // Convert config to JSON
      const jsonData = JSON.stringify(config);
      
      // Append JSON data to the executable - client-side operation
      const resultBlob = appendDataToExecutable(executableArrayBuffer, jsonData);
      
      // Create a download URL
      const downloadUrl = URL.createObjectURL(resultBlob);
      
      setExecutableUrl(downloadUrl);
      setExecutableBlob(resultBlob);
      setProcessingStep('');
      setIsLoading(false);
    } catch (err) {
      console.error('Error generating installer:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setProcessingStep('');
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (executableUrl && executableBlob) {
      const a = document.createElement('a');
      a.href = executableUrl;
      a.download = `${modpackName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-installer.exe`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
      <div className="max-w-3xl w-full mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Minecraft Modpack Installer Generator
          </h1>
          <p className="text-xl mb-6">
            Create custom-branded installers for your Minecraft modpacks with ease
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Uses direct GitHub API integration for faster performance
          </p>
        </div>
        
        {executableUrl ? (
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-green-700 dark:text-green-400">Installer Generated Successfully!</h2>
            <p className="mb-4">Your modpack installer has been created. Click the button below to download it.</p>
            
            <Button onClick={handleDownload} className="w-full">
              Download Installer
            </Button>
            
            <div className="mt-4 text-center">
              <button 
                onClick={() => {
                  setExecutableUrl(null);
                  setExecutableBlob(null);
                }}
                className="text-blue-600 hover:underline"
              >
                Create Another Installer
              </button>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-700 dark:text-red-400">
                <h3 className="font-bold">Error</h3>
                <p>{error}</p>
              </div>
            )}
            
            {isLoading && processingStep && (
              <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-blue-700 dark:text-blue-400">
                <h3 className="font-bold">Processing</h3>
                <p>{processingStep}</p>
                <div className="mt-2 w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full animate-pulse w-full"></div>
                </div>
              </div>
            )}
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <ModpackForm onSubmit={handleFormSubmit} isLoading={isLoading} />
            </div>
          </>
        )}
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Custom Branding</h3>
            <p>
              Add your own logo, Minecraft block background, and theme to create a unique installer experience.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Easy to Use</h3>
            <p>
              Simple form interface to generate custom installers without any technical knowledge.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Packwiz Integration</h3>
            <p>
              Works seamlessly with Packwiz to provide a smooth installation experience for your players.
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-sm text-gray-600 dark:text-gray-400">
          <h3 className="font-medium mb-2">How it works:</h3>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Fill out the modpack information form</li>
            <li>Choose whether to use the default icon or upload a custom one</li>
            <li>Click "Generate Installer" to create your custom installer</li>
            <li>Download and distribute your installer to your players</li>
          </ol>
          <p className="mt-4">
            This tool uses the <Link href="https://github.com/sshcrack/packwiz-launcher" isExternal className="underline">packwiz-launcher</Link> to create custom modpack installers.
            Most operations are performed directly client-side, with server functions only used when GitHub authentication is required.
          </p>
        </div>
        
        <div className="mt-8 text-center">
          <Button
            size="md"
            variant="bordered"
            className="px-6"
            as="a"
            href="https://github.com/sshcrack/packwiz-launcher"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </Button>
        </div>
      </div>
    </div>
  );
}
