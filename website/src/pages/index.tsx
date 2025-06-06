import { lazy, Suspense, useEffect } from 'react';
import { ModpackConfig } from '@/types/modpack';
import { isIcoFile } from '@/utils/iconConverter';
import { Button } from '@heroui/button';
import { Alert } from '@heroui/alert';
import { Link } from '@heroui/link';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

// Lazy load the ModpackForm component
const ModpackForm = lazy(() => import('@/components/ModpackForm'));

// Loading component for form
const FormLoadingSpinner = () => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex justify-center items-center min-h-[400px]">
    <div className="text-center">
      <div className="relative mb-4 mx-auto w-16 h-16" role="status" aria-label="Loading form">
        <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-blue-500 dark:border-blue-400 rounded-full animate-spin absolute top-0 left-0 border-t-transparent border-b-transparent"></div>
      </div>
      <p className="text-gray-600 dark:text-gray-400">Loading form...</p>
    </div>
  </div>
);

export default function IndexPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executableUrl, setExecutableUrl] = useState<string | null>(null);
  const [executableBlob, setExecutableBlob] = useState<Blob | null>(null);
  const [modpackName, setModpackName] = useState<string>('');
  const [processingStep, setProcessingStep] = useState<string>('');

  // Add page leave warning when installer is being generated
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isLoading) {
        const message = "Your installer is still being generated. Leaving now will cancel the process. Are you sure you want to leave?";
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isLoading]);

  const handleFormSubmit = async (
    config: ModpackConfig,
    useCustomIcon: boolean,
    customIconFile: File | null,
    turnstileToken: string | null
  ) => {
    setIsLoading(true);
    setError(null);
    setExecutableUrl(null);
    setExecutableBlob(null);
    setModpackName(config.name);

    try {
      // Dynamically import utilities only when needed
      const {
        appendDataToExecutable,
        downloadFile,
        downloadFileBlob,
        getLatestReleaseArtifact,
        pollWorkflowCompletion,
        triggerGitHubWorkflow
      } = await import('@/utils/github');

      let executableArrayBuffer: ArrayBuffer;

      if (useCustomIcon && customIconFile) {
        if (!turnstileToken) {
          throw new Error('Turnstile token is required for custom icon uploads. Please complete the CAPTCHA.');
        }

        // Validate icon file
        if (!isIcoFile(customIconFile)) {
          throw new Error('Only .ico files are supported. Please select a valid icon file.');
        }

        setProcessingStep('Triggering GitHub workflow with custom icon...');
        // Trigger GitHub workflow with custom icon
        const workflowResponse = await triggerGitHubWorkflow(customIconFile, turnstileToken);

        setProcessingStep('Building custom installer (this may take a few minutes)...');
        // Poll for workflow completion
        const artifactUrl = await pollWorkflowCompletion(workflowResponse.id);
        console.log('Downloading artifact from:', artifactUrl);

        setProcessingStep('Downloading custom installer...');
        // Download the artifact
        const rawZipFile = await downloadFileBlob(artifactUrl);

        setProcessingStep('Reading zip file...');
        // Dynamically import zipUtils (which in turn imports zip.js) only when needed
        const { extractFirstEntryAsArrayBuffer } = await import('@/utils/zipUtils');

        executableArrayBuffer = await extractFirstEntryAsArrayBuffer(rawZipFile);
      } else {
        setProcessingStep('Downloading default installer...');
        // Use default executable from latest release - direct GitHub API call
        const latestReleaseUrl = await getLatestReleaseArtifact();
        console.log('Downloading default installer from:', latestReleaseUrl);
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
          <Alert color="primary" classNames={{
            base: "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800",
            mainWrapper: "flex-row gap-1 items-center"
          }}>
            <span>Need help? Check out our </span>
            <RouterLink to="/guide" className="font-medium underline">comprehensive guide</RouterLink>
            <span> for creating and publishing modpacks!</span>
          </Alert>
        </div>

        {executableUrl ? (
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-green-700 dark:text-green-400">Installer Generated Successfully!</h2>
            <p className="mb-4">Your modpack installer has been created. Click the button below to download it.</p>

            <Button onPress={handleDownload} className="w-full">
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
          <>            {isLoading && processingStep && (
              <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-blue-700 dark:text-blue-400">
                <h3 className="font-bold">Processing</h3>
                <p>{processingStep}</p>
                <div className="mt-2 w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2.5" role="progressbar" aria-label="Processing status" aria-valuenow={50} aria-valuemin={0} aria-valuemax={100}>
                  <div className="bg-blue-600 h-2.5 rounded-full animate-pulse w-full"></div>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <Suspense fallback={<FormLoadingSpinner />}>
                <ModpackForm
                  onSubmit={handleFormSubmit}
                  isLoading={isLoading}
                  processingStep={processingStep}
                />
              </Suspense>

              {error && (
                <div className="mt-6 mb-2 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-700 dark:text-red-400">
                  <h3 className="font-bold">Error</h3>
                  <p>{error}</p>
                </div>
              )}
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
            This tool creates installers that use <Link href="https://prismlauncher.org/" isExternal className="underline">PrismLauncher</Link> to launch Minecraft instances and <Link href="https://github.com/sshcrack/packwiz-launcher" isExternal className="underline">packwiz-launcher</Link> to install the modpack.
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
