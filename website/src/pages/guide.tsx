export default function GuidePage() {
    return (
        <div className="min-h-screen flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
            <div className="max-w-4xl w-full mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Modpack Creation Guide
                    </h1>
                    <p className="text-xl mb-6">
                        A comprehensive guide to creating and publishing your Minecraft modpack
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md space-y-8 mb-8">
                    <section id="overview">
                        <h2 className="text-3xl font-bold mb-4">Overview</h2>
                        <p className="mb-4">
                            This guide will walk you through the complete process of creating a Minecraft modpack using packwiz,
                            publishing it to GitHub, and setting it up with our installer generator. Follow these steps to create
                            a professional, easy-to-install modpack for your players.
                        </p>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-blue-800 dark:text-blue-200">
                            <h3 className="font-bold mb-2">What you'll need:</h3>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Java installed on your computer</li>
                                <li>A GitHub account</li>
                                <li>PrismLauncher installed</li>
                                <li>Basic knowledge of Minecraft modding</li>
                            </ul>
                        </div>
                    </section>

                    <section id="installing-packwiz" className="pt-4">
                        <h2 className="text-3xl font-bold mb-4">Step 1: Installing packwiz</h2>
                        <p className="mb-4">
                            packwiz is a command-line tool that helps you manage Minecraft modpacks. Let's install it:
                        </p>                        <h3 className="text-xl font-semibold mb-2">Option 1: Pre-built binaries (recommended)</h3>
                        <ol className="list-decimal list-inside space-y-2 mb-4">
                            <li>
                                Download from <a href="https://github.com/packwiz/packwiz/actions" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">GitHub Actions</a> - select the top build, then download the artifact ZIP for your system at the bottom of the page
                            </li>
                            <li>
                                Or use <a href="https://nightly.link/packwiz/packwiz/workflows/go/main" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">nightly.link</a> for an easier download experience - just select the artifact for your system
                            </li>
                            <li>
                                Extract the downloaded file and add the folder to your PATH environment variable or move it to your modpack directory
                            </li>
                            <li>
                                For Windows users, <a href="https://www.howtogeek.com/118594/how-to-edit-your-system-path-for-easy-command-line-access/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">here's a tutorial</a> on editing your PATH environment variable
                            </li>
                        </ol>

                        <h3 className="text-xl font-semibold mb-2">Option 2: Using go</h3>
                        <p className="mb-2">If you have Go installed, you can use:</p>
                        <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md mb-4 font-mono text-sm overflow-auto">
                            go install github.com/packwiz/packwiz@latest
                        </div>

                        <p className="mb-2">For more detailed installation instructions, visit:</p>
                        <a href="https://packwiz.infra.link/installation/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            https://packwiz.infra.link/installation/
                        </a>
                    </section>

                    <section id="creating-modpack" className="pt-4">
                        <h2 className="text-3xl font-bold mb-4">Step 2: Creating Your Modpack</h2>

                        <h3 className="text-xl font-semibold mb-2">Initialize your modpack</h3>
                        <p className="mb-2">
                            Open a terminal in the directory where you want to create your modpack and run:
                        </p>
                        <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md mb-4 font-mono text-sm overflow-auto">
                            packwiz init
                        </div>

                        <p className="mb-4">
                            This command will ask you some questions about your modpack:
                        </p>
                        <ul className="list-disc list-inside space-y-1 mb-4">
                            <li>Minecraft version (e.g., 1.20.1)</li>
                            <li>Modloader type (Fabric, Forge, Quilt, etc.)</li>
                            <li>Modloader version</li>
                            <li>Modpack name</li>
                            <li>Modpack author</li>
                            <li>Modpack version</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-2">Adding mods to your modpack</h3>
                        <p className="mb-2">
                            You can add mods to your modpack using the following command:
                        </p>
                        <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md mb-4 font-mono text-sm overflow-auto">
                            packwiz mr add [mod-id]
                        </div>

                        <p className="mb-2">
                            For example, to add JEI (Just Enough Items):
                        </p>
                        <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md mb-4 font-mono text-sm overflow-auto">
                            packwiz mr add jei
                        </div>

                        <p className="mb-2">
                            To add mods from CurseForge:
                        </p>
                        <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md mb-4 font-mono text-sm overflow-auto">
                            packwiz cf install [mod-id]
                        </div>

                        <p className="mb-2">
                            To add mods from Modrinth:
                        </p>
                        <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md mb-4 font-mono text-sm overflow-auto">
                            packwiz modrinth install [mod-id]
                        </div>

                        <p className="mb-4">
                            For detailed instructions on adding mods, visit:
                        </p>
                        <a href="https://packwiz.infra.link/tutorials/creating/adding-mods/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mb-4 block">
                            https://packwiz.infra.link/tutorials/creating/adding-mods/
                        </a>
                    </section>

                    <section id="publishing-github" className="pt-4">
                        <h2 className="text-3xl font-bold mb-4">Step 3: Publishing to GitHub</h2>

                        <h3 className="text-xl font-semibold mb-2">Option 1: Using GitHub Desktop (Beginner-Friendly)</h3>
                        <ol className="list-decimal list-inside space-y-2 mb-4">
                            <li>
                                Download and install <a href="https://desktop.github.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">GitHub Desktop</a>
                            </li>
                            <li>
                                Open GitHub Desktop and sign in to your GitHub account
                            </li>
                            <li>
                                Go to File → Add local repository and select your modpack folder
                            </li>
                            <li>
                                Click "Create a Repository" when prompted
                            </li>
                            <li>
                                Fill in the repository details and make sure it's set to be public
                            </li>
                            <li>
                                Click "Publish repository" to publish it to GitHub
                            </li>
                        </ol>

                        <h3 className="text-xl font-semibold mb-2">Option 2: Using Git Command Line</h3>
                        <p className="mb-2">
                            Initialize a Git repository in your modpack directory:
                        </p>
                        <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md mb-4 font-mono text-sm overflow-auto">
                            git init
                        </div>

                        <p className="mb-2">
                            Add .gitignore and .gitattributes files (important for proper handling of pack files).
                            Create these files in your modpack directory with the following content:
                        </p>

                        <p className="font-semibold mb-1">.gitignore:</p>
                        <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md mb-4 font-mono text-sm overflow-auto">
                            # packwiz-specific files
                            .packwizignore

                            # Client-side mod cache
                            .minecraft/

                            # Generated pack files
                            *.zip
                            *.mrpack

                            # IDE and OS-specific files
                            .vscode/
                            .idea/
                            .DS_Store
                        </div>

                        <p className="font-semibold mb-1">.gitattributes:</p>
                        <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md mb-4 font-mono text-sm overflow-auto">
                            # Set line endings to LF for all files
                            * text=auto eol=lf

                            # Properly detect languages
                            *.java text diff=java
                            *.json text
                            *.toml text
                            *.pw.toml text
                            *.properties text
                            *.kts text diff=kotlin
                            *.kt text diff=kotlin
                        </div>

                        <p className="mb-2">Now, add your files to git and make your first commit:</p>
                        <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md mb-4 font-mono text-sm overflow-auto">
                            git add .
                            git commit -m "Initial modpack commit"
                        </div>

                        <p className="mb-2">
                            Create a new repository on GitHub (without initializing it), then link and push your local repository:
                        </p>
                        <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md mb-4 font-mono text-sm overflow-auto">
                            git remote add origin https://github.com/yourusername/your-modpack-name.git
                            git branch -M main
                            git push -u origin main
                        </div>

                        <p className="mb-4">
                            For more information on using Git with packwiz, visit:
                        </p>
                        <a href="https://packwiz.infra.link/tutorials/creating/git/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mb-4 block">
                            https://packwiz.infra.link/tutorials/creating/git/
                        </a>

                        <h3 className="text-xl font-semibold mb-2">Getting the Raw GitHub Link to pack.toml</h3>
                        <ol className="list-decimal list-inside space-y-2 mb-4">
                            <li>
                                Navigate to your repository on GitHub
                            </li>
                            <li>
                                Go to the root directory of your modpack and click on <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">pack.toml</code>
                            </li>
                            <li>
                                Click the "Raw" button in the top-right of the file view
                            </li>
                            <li>
                                Copy the URL from your browser's address bar. It should look like:<br />
                                <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-sm">
                                    https://raw.githubusercontent.com/yourusername/your-modpack-name/main/pack.toml
                                </code>
                            </li>
                            <li>
                                Save this URL - you'll need it as the "Packwiz URL" in the modpack generator
                            </li>
                        </ol>
                    </section>

                    <section id="prism-launcher" className="pt-4">
                        <h2 className="text-3xl font-bold mb-4">Step 4: Setting Up the Base Pack with PrismLauncher</h2>

                        <h3 className="text-xl font-semibold mb-2">Installing PrismLauncher</h3>
                        <ol className="list-decimal list-inside space-y-2 mb-4">
                            <li>
                                Download PrismLauncher from <a href="https://prismlauncher.org/download" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://prismlauncher.org/download</a> for your operating system
                            </li>
                            <li>
                                Install and run PrismLauncher
                            </li>
                            <li>
                                If this is your first time running PrismLauncher, follow the setup wizard to configure Java
                            </li>
                        </ol>

                        <h3 className="text-xl font-semibold mb-2">Creating a Base Instance</h3>
                        <p className="mb-2">
                            The base instance is a clean Minecraft installation with just the modloader - no mods or configs.
                            This is important as the actual mods will be installed via packwiz.
                        </p>
                        <ol className="list-decimal list-inside space-y-2 mb-4">
                            <li>
                                Click "Add Instance" in PrismLauncher
                            </li>
                            <li>
                                Give your instance a name (e.g., "My Modpack Base")
                            </li>
                            <li>
                                Select the Minecraft version that matches your modpack
                            </li>
                            <li>
                                Select the modloader type (Fabric, Forge, etc.) and version that matches your modpack
                            </li>
                            <li>
                                Click "OK" to create the instance
                            </li>
                            <li>
                                Right-click on your new instance and select "Edit"
                            </li>
                            <li>
                                Configure any desired settings like memory allocation, Java arguments, etc.
                            </li>
                            <li>
                                Click "Close" to save settings
                            </li>
                        </ol>

                        <h3 className="text-xl font-semibold mb-2">Exporting the Base Pack</h3>
                        <ol className="list-decimal list-inside space-y-2 mb-4">
                            <li>
                                Right-click on your instance in PrismLauncher
                            </li>
                            <li>
                                Select "Export Instance"
                            </li>
                            <li>
                                In the dialog that appears, make sure only essential files are selected (usually the defaults are fine)
                            </li>
                            <li>
                                Click "Export" and choose a save location and filename (e.g., "base_modpack.zip")
                            </li>
                        </ol>

                        <h3 className="text-xl font-semibold mb-2">Uploading the Base Pack</h3>
                        <p className="mb-2">
                            You need to upload your base pack somewhere it can be downloaded. GitHub is a good option:
                        </p>
                        <ol className="list-decimal list-inside space-y-2 mb-4">
                            <li>
                                Go to your modpack repository on GitHub
                            </li>
                            <li>
                                Click on "Releases" on the right side
                            </li>
                            <li>
                                Click "Create a new release" or "Draft a new release"
                            </li>
                            <li>
                                Fill in a tag version (e.g., "v1.0-base") and title
                            </li>
                            <li>
                                Drag and drop your base_modpack.zip file into the assets section
                            </li>
                            <li>
                                Click "Publish release"
                            </li>
                            <li>
                                After publishing, click on the zip file in the release assets
                            </li>
                            <li>
                                Copy the URL - this will be your "Base Pack URL" for the modpack generator
                            </li>
                        </ol>
                    </section>

                    <section id="generating-installer" className="pt-4">
                        <h2 className="text-3xl font-bold mb-4">Step 5: Generating Your Modpack Installer</h2>
                        <ol className="list-decimal list-inside space-y-2 mb-4">
                            <li>
                                Return to the main page of this website
                            </li>
                            <li>
                                Fill in your modpack details:
                                <ul className="list-disc list-inside ml-8 mt-2 space-y-1">
                                    <li>Name, author, and description</li>
                                    <li>Logo URL (a direct link to your modpack's logo image)</li>
                                    <li>Packwiz URL (the raw GitHub link to your pack.toml file)</li>
                                    <li>Base Pack URL (the direct download link to your base_modpack.zip)</li>
                                    <li>Theme and background preferences</li>
                                </ul>
                            </li>
                            <li>
                                Optionally upload a custom icon for your installer
                            </li>
                            <li>
                                Click "Generate Installer"
                            </li>
                            <li>
                                Once processing is complete, download your custom installer
                            </li>
                            <li>
                                Distribute this installer to your players for a seamless modpack installation experience
                            </li>
                        </ol>
                    </section>

                    <section id="updating" className="pt-4">
                        <h2 className="text-3xl font-bold mb-4">Updating Your Modpack</h2>
                        <p className="mb-4">
                            When you want to update your modpack:
                        </p>
                        <ol className="list-decimal list-inside space-y-2 mb-4">
                            <li>
                                Make changes to your packwiz modpack (add/remove mods, update configs, etc.)
                            </li>
                            <li>
                                Update your pack version in pack.toml
                            </li>
                            <li>
                                Commit and push your changes to GitHub
                            </li>
                        </ol>
                        <p className="mb-2">
                            Players using your installer won't need to download a new version - the installer automatically pulls the latest version from your GitHub repository.
                        </p>
                    </section>
                </div>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md mb-8">
                    <h2 className="text-3xl font-bold mb-4">Troubleshooting</h2>

                    <h3 className="text-xl font-semibold mb-2">Common Issues</h3>

                    <div className="space-y-4">
                        <div>
                            <h4 className="font-bold">Issue: Installer can't download the modpack</h4>
                            <p>
                                Ensure your pack.toml URL is accessible and is the raw GitHub URL (starts with https://raw.githubusercontent.com/).
                                Check that your repository is public.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold">Issue: Mods not loading in the game</h4>
                            <p>
                                Verify that your modloader version matches the mods you've added.
                                Some mods may have dependencies that need to be included.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold">Issue: Base pack doesn't have the right Minecraft version</h4>
                            <p>
                                Make sure the Minecraft version and modloader in your base pack match what you specified in your packwiz modpack.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="text-center text-gray-600 dark:text-gray-400">
                    <p>
                        For more detailed information and advanced usage, please refer to the official packwiz documentation at{' '}
                        <a href="https://packwiz.infra.link/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            https://packwiz.infra.link/
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
