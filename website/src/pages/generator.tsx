import { useState, useEffect } from 'react';
import { Button } from '@heroui/button';
import { Link } from '@heroui/link';
import ModpackForm from '@/components/ModpackForm';
import { ModpackConfig } from '@/types/modpack';
import { appendDataToExecutable, downloadFile, getLatestReleaseArtifact, pollWorkflowCompletion, triggerGitHubWorkflow } from '@/utils/github';
import { uploadIconFile, isIcoFile } from '@/utils/iconConverter';

export default function GeneratorPage() {
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
        let iconBlob: Blob;
        if (customIconUrl.startsWith('blob:') || customIconUrl.startsWith('data:')) {
          iconBlob = await fetch(customIconUrl).then(r => r.blob());
        } else {
          iconBlob = await fetch(customIconUrl).then(r => r.blob());
        }
        
        const iconFile = new File([iconBlob], 'icon.ico', { type: 'image/x-icon' });
        const iconUrl = await uploadIconFile(iconFile);
          
        setProcessingStep('Triggering GitHub workflow...');
        const workflowResponse = await triggerGitHubWorkflow(iconUrl);
        
        setProcessingStep('Building custom installer (this may take a few minutes)...');
        const artifactUrl = await pollWorkflowCompletion(workflowResponse.id);
        
        setProcessingStep('Downloading custom installer...');
        executableArrayBuffer = await downloadFile(artifactUrl);
      } else {
        setProcessingStep('Downloading default installer...');
        const latestReleaseUrl = await getLatestReleaseArtifact();
        executableArrayBuffer = await downloadFile(latestReleaseUrl);
      }
      
      setProcessingStep('Processing installer with your modpack configuration...');
      const jsonData = JSON.stringify(config);
      const resultBlob = appendDataToExecutable(executableArrayBuffer, jsonData);
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
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Minecraft Modpack Installer Generator</h1>
        <p className="text-lg">Create custom installers for your Minecraft modpacks</p>
      </div>
      
      {executableUrl ? (
        <div className="max-w-2xl mx-auto bg-green-50 dark:bg-green-900/20 p-6 rounded-lg shadow-md">
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
            <div className="max-w-2xl mx-auto mb-6 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-700 dark:text-red-400">
              <h3 className="font-bold">Error</h3>
              <p>{error}</p>
            </div>
          )}
          
          {isLoading && processingStep && (
            <div className="max-w-2xl mx-auto mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-blue-700 dark:text-blue-400">
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
      
      <div className="mt-12 max-w-2xl mx-auto text-sm text-gray-600 dark:text-gray-400">
        <h3 className="font-medium mb-2">How it works:</h3>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Fill out the modpack information form</li>
          <li>Choose whether to use the default icon or upload a custom one</li>
          <li>Click "Generate Installer" to create your custom installer</li>
          <li>Download and distribute your installer to your players</li>
        </ol>
        <p className="mt-4">
          This tool uses the <Link href="https://github.com/sshcrack/packwiz-launcher" isExternal className="underline">packwiz-launcher</Link> to create custom modpack installers.
        </p>
      </div>
    </div>
  );
}
